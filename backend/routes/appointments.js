const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { sendOTP, sendGenericSMS } = require('../services/smsService');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try { 
    req.user = jwt.verify(token, JWT_SECRET); 
    next(); 
  }
  catch { 
    res.status(401).json({ error: 'Invalid token' }); 
  }
};

// POST /api/appointments/concierge-intake
router.post('/concierge-intake', authenticate, async (req, res) => {
  try {
    const patientId = req.user.id;
    const { 
      therapy_type, // 'Individual', 'Couples', 'Child', 'Group'
      primary_focus, 
      relationship_status, 
      mandatory_notes, 
      requested_date, 
      requested_time_block,
      therapist_id,
      dsm_5_assessment,
      partner_ids,
      group_member_ids,
      device_count
    } = req.body;

    // 1. Automate Prior Therapy Check (Has the user had past sessions?)
    const priorTherapyCheck = await db.query(
      `SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status NOT IN ('pending', 'cancelled')`, 
      [patientId]
    );
    const hasPriorTherapy = parseInt(priorTherapyCheck.rows[0].count) > 0;

    // 2. Update Patient Demographics (Religion removed per clinical guidelines)
    await db.query(`
      UPDATE users 
      SET relationship_status = COALESCE($1, relationship_status)
      WHERE id = $2
    `, [relationship_status, patientId]);

    // 3. Format clinical notes for the therapist
    const clinicalIntakeNotes = `
[CLINICAL INTAKE SUMMARY]
Therapy Type: ${therapy_type}
Prior Therapy on Platform: ${hasPriorTherapy ? 'Yes' : 'No'}
Primary Focus: ${primary_focus}
Devices on Call: ${device_count || 1}

[PATIENT'S MANDATORY DETAILS]
${mandatory_notes || 'None provided.'}
    `.trim();

    // 4. Create the Appointment with new Group/DSM-5 capabilities
    const appointmentRes = await db.query(`
      INSERT INTO appointments (
        patient_id, therapist_id, appointment_date, appointment_time, 
        status, notes, therapy_type, partner_ids, group_member_ids, 
        device_count, dsm_5_assessment, prior_therapy
      )
      VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [
      patientId, 
      therapist_id || null, 
      requested_date, 
      requested_time_block, 
      clinicalIntakeNotes,
      therapy_type,
      partner_ids || '{}',
      group_member_ids || '{}',
      device_count || 1,
      dsm_5_assessment || '{}',
      hasPriorTherapy
    ]);

    res.json({ 
      message: 'Intake successful. Your request is in the triage queue.', 
      appointmentId: appointmentRes.rows[0].id 
    });
  } catch (error) {
    console.error('Concierge Intake Error:', error);
    res.status(500).json({ error: 'Failed to process intake request.' });
  }
});

// Patient: Book Appointment
router.post('/book', authenticate, async (req, res) => {
  try {
    const { appointment_date, appointment_time, therapist_id, notes } = req.body;
    
    // 1. Time Boundary Validation (8 AM to 4 PM, 1-hour slots)
    const [hours, minutes] = appointment_time.split(':').map(Number);
    if (hours < 8 || hours > 16) {
      return res.status(400).json({ error: 'Appointments must be scheduled between 8:00 AM and 4:00 PM East Africa Time.' });
    }

    // 2. Auto-Expire "Stuck" Sessions
    // Automatically fail any pending or accepted sessions where the scheduled date/time has already passed
    await db.query(`
      UPDATE appointments 
      SET status = 'expired' 
      WHERE status IN ('pending', 'scheduled', 'accepted') 
      AND (appointment_date + appointment_time::time) < NOW()
    `);

    // 3. Anti-Spam Check (Now only applies to valid future/current sessions)
    const existing = await db.query(
      `SELECT id FROM appointments WHERE patient_id = $1 AND status IN ('pending', 'scheduled', 'accepted')`,
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already have an active session request. Please wait for it to conclude before booking another.' });
    }

    // 4. Therapist Double-Booking Check
    if (therapist_id) {
      const conflict = await db.query(
        `SELECT id FROM appointments 
         WHERE therapist_id = $1 AND appointment_date = $2 AND appointment_time = $3 
         AND status IN ('pending', 'scheduled', 'accepted')`,
        [therapist_id, appointment_date, appointment_time]
      );
      if (conflict.rows.length > 0) {
        return res.status(409).json({ error: 'This therapist is already booked at that time. Please choose a different slot.' });
      }
    }

    // 5. Create New Session
    const result = await db.query(
      `INSERT INTO appointments (patient_id, therapist_id, appointment_date, appointment_time, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [req.user.id, therapist_id || null, appointment_date, appointment_time]
    );
    
    res.json({ message: 'Appointment requested successfully', appointment: result.rows[0] });
  } catch (err) { 
    console.error("DB Error:", err);
    if (err.code === '23505' && err.constraint === 'enforce_single_active_session') { 
      return res.status(400).json({ error: 'You already have an active session request processing.' }); 
    }
    res.status(500).json({ error: 'Backend crash', details: err.message }); 
  }
});

// Therapist: Get Pending Pooled Requests
router.get('/pending', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, p.first_name as other_first, p.last_name as other_last, u.display_id as other_display_id,
      ((NOW() AT TIME ZONE 'Africa/Nairobi') BETWEEN (a.appointment_date + a.appointment_time::time - INTERVAL '15 minutes') AND (a.appointment_date + a.appointment_time::time + INTERVAL '20 minutes')) AS is_joinable
      FROM appointments a 
      JOIN users u ON a.patient_id = u.id 
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE a.status = 'pending' AND a.therapist_id = $1
      ORDER BY a.created_at DESC`, [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { 
    console.error("DB Error:", err);
    res.status(500).json({ error: 'Backend crash', details: err.message }); 
  }
});

// Therapist: Accept Appointment & Send SMS
router.post('/accept/:id', authenticate, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const vdoLink = `https://vdo.ninja/?room=ButabikaCares_Session_${appointmentId}&vdo=1&autostart=1`;
    
    // Claim appointment
    const apptRes = await db.query(
      `UPDATE appointments 
       SET therapist_id = $1, status = 'scheduled', meeting_link = $2 
       WHERE id = $3 AND status = 'pending' RETURNING *`,
      [req.user.id, vdoLink, appointmentId]
    );

    if (apptRes.rows.length === 0) {
      return res.status(400).json({ error: 'Appointment already claimed by another therapist or does not exist.' });
    }

    const appt = apptRes.rows[0];

    // Fetch patient and therapist details correctly from profiles table
    const patientRes = await db.query(`
      SELECT u.phone_number, p.first_name 
      FROM users u 
      LEFT JOIN profiles p ON u.id = p.user_id 
      WHERE u.id = $1
    `, [appt.patient_id]);

    const therapistRes = await db.query(`
      SELECT p.first_name, p.last_name 
      FROM profiles p 
      WHERE p.user_id = $1
    `, [req.user.id]);

    const patient = patientRes.rows[0];
    const therapist = therapistRes.rows[0];

    // Null-safe name formatting
    const tFirstName = therapist?.first_name || 'Therapist';
    const tLastName = therapist?.last_name || '';
    const title = tFirstName.startsWith('Dr.') ? '' : 'Dr. ';
    const docName = `${title}${tFirstName} ${tLastName}`.trim();
    
    // Null-safe Date & Time formatting for legacy data
    const cleanDate = appt.appointment_date 
      ? new Date(appt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      : 'a scheduled date';
    const cleanTime = appt.appointment_time || 'TBD';

    // Trigger SMS Notification
    if (patient && patient.phone_number) {
      const smsMessage = `Butabika Cares: Your session with ${docName} is confirmed for ${cleanDate} at ${cleanTime}. Log in at the scheduled time to join.`;
      try { 
        const { sendGenericSMS } = require('../services/smsService'); 
        await sendGenericSMS(patient.phone_number, smsMessage); 
      } 
      catch (e) { console.error('SMS notification failed:', e.message); }
    }

    res.json({ message: 'Appointment accepted', appointment: appt });
  } catch (err) { 
    console.error("DB Error:", err);
    res.status(500).json({ error: 'Backend crash', details: err.message }); 
  }
});

// Get User's Scheduled Appointments (Patient or Therapist)
router.get('/my-sessions', authenticate, async (req, res) => {
  try {
    const isTherapist = req.user.role === 'therapist';
    
    // Convert UTC Date string properly in DB query or just select it as is
    const query = isTherapist
      ? `SELECT a.*, ROUND(EXTRACT(EPOCH FROM (a.ended_at - a.started_at)) / 60) AS duration_minutes, p.first_name as other_first, p.last_name as other_last, u.display_id as other_display_id,
         ((NOW() AT TIME ZONE 'Africa/Nairobi') BETWEEN (a.appointment_date + a.appointment_time::time - INTERVAL '15 minutes') AND (a.appointment_date + a.appointment_time::time + INTERVAL '20 minutes')) AS is_joinable
         FROM appointments a 
         JOIN users u ON a.patient_id = u.id 
         LEFT JOIN profiles p ON u.id = p.user_id
         WHERE a.therapist_id = $1 AND a.status IN ('scheduled', 'pending', 'completed')
         ORDER BY a.appointment_date ASC`
      : `SELECT a.*, ROUND(EXTRACT(EPOCH FROM (a.ended_at - a.started_at)) / 60) AS duration_minutes, p.first_name as other_first, p.last_name as other_last, u.display_id as other_display_id,
         ((NOW() AT TIME ZONE 'Africa/Nairobi') BETWEEN (a.appointment_date + a.appointment_time::time - INTERVAL '15 minutes') AND (a.appointment_date + a.appointment_time::time + INTERVAL '20 minutes')) AS is_joinable
         FROM appointments a 
         LEFT JOIN users u ON a.therapist_id = u.id 
         LEFT JOIN profiles p ON u.id = p.user_id
         WHERE (
           a.patient_id = $1 
           OR (SELECT display_id FROM users WHERE id = $1) = ANY(a.partner_ids) 
           OR (SELECT display_id FROM users WHERE id = $1) = ANY(a.group_member_ids)
         )
         AND a.status IN ('scheduled', 'pending', 'completed')
         ORDER BY a.appointment_date ASC`;

    const result = await db.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) { 
    console.error("DB Error:", err);
    res.status(500).json({ error: 'Backend crash', details: err.message }); 
  }
});

// Ping Heartbeat
router.patch('/:id/ping', authenticate, async (req, res) => {
  try {
    await db.query('UPDATE appointments SET last_ping_at = NOW() WHERE id = $1', [req.params.id]);
    res.json({ message: 'Ping received' });
  } catch (err) {
    res.status(500).json({ error: 'Backend crash' });
  }
});

// Complete Session & Save Clinical Notes
router.put('/:id/complete', authenticate, async (req, res) => {
  try {
    const { private_notes, shared_notes } = req.body;
    
    const result = await db.query(`
      UPDATE appointments 
      SET status = 'completed', 
          private_notes = $1,
          shared_notes = $2,
          ended_at = NOW()
      WHERE id = $3 
      RETURNING *
    `, [private_notes, shared_notes, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session completed successfully', session: result.rows[0] });
  } catch (err) { 
    console.error("DB Error:", err);
    res.status(500).json({ error: 'Backend crash', details: err.message }); 
  }
});

// Therapist: Update Notes
router.put('/:id/notes', authenticate, async (req, res) => {
  if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const { private_notes, shared_notes } = req.body;
    const apptId = req.params.id;
    
    await db.query(
      'UPDATE appointments SET private_notes = $1, shared_notes = $2 WHERE id = $3 AND therapist_id = $4',
      [private_notes, shared_notes, apptId, req.user.id]
    );
    res.json({ message: 'Notes updated successfully.' });
  } catch (err) { 
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to update notes' }); 
  }
});

// Patient: Get Session History (Completed Sessions)
router.get('/patient/history', authenticate, async (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const result = await db.query(`
      SELECT id, appointment_date, appointment_time, ended_at, shared_notes 
      FROM appointments 
      WHERE patient_id = $1 AND status = 'completed' 
      ORDER BY appointment_date DESC, appointment_time DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to fetch session history' });
  }
});

// Mark user as joined in the video room
router.patch('/:id/join', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role; // 'patient' or 'therapist'

    // Determine which column to update based on role
    const joinColumn = role === 'therapist' ? 'therapist_joined_at' : 'patient_joined_at';

    // 1. Timestamp the specific user's arrival (only if not already set)
    await db.query(`
      UPDATE appointments 
      SET ${joinColumn} = NOW() 
      WHERE id = $1 AND ${joinColumn} IS NULL
    `, [id]);

    // 2. Check if BOTH are now in the room. If so, officially start the session.
    const check = await db.query(`
      SELECT patient_joined_at, therapist_joined_at, started_at 
      FROM appointments WHERE id = $1
    `, [id]);

    const session = check.rows[0];
    if (session.patient_joined_at && session.therapist_joined_at && !session.started_at) {
      await db.query(`
        UPDATE appointments 
        SET started_at = NOW(), status = 'active' 
        WHERE id = $1
      `, [id]);
    }

    res.json({ message: 'Presence logged successfully' });
  } catch (err) {
    console.error("Presence Tracking Error:", err);
    res.status(500).json({ error: 'Failed to log presence' });
  }
});

// Get booked times for a therapist on a given date
router.get('/booked-times', authenticate, async (req, res) => {
  try {
    const { therapist_id, date } = req.query;
    if (!therapist_id || !date) {
      return res.status(400).json({ error: 'therapist_id and date are required.' });
    }

    const result = await db.query(
      `SELECT appointment_time FROM appointments 
       WHERE therapist_id = $1 AND appointment_date = $2 
       AND status IN ('pending', 'scheduled', 'accepted')`,
      [therapist_id, date]
    );

    const times = result.rows.map(r => r.appointment_time);
    res.json(times);
  } catch (err) {
    console.error('Booked times error:', err);
    res.status(500).json({ error: 'Failed to fetch booked times' });
  }
});

// User-initiated cancellation
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Verify the user is either the patient or the therapist for this appointment
    const appt = await db.query(
      `SELECT id FROM appointments WHERE id = $1 AND (patient_id = $2 OR therapist_id = $2)`,
      [appointmentId, req.user.id]
    );

    if (appt.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized or appointment not found.' });
    }

    await db.query(
      `UPDATE appointments SET status = 'cancelled' WHERE id = $1`,
      [appointmentId]
    );

    res.json({ message: 'Appointment cancelled successfully.' });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

module.exports = router;
