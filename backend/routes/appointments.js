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

// Patient: Book Appointment
router.post('/book', authenticate, async (req, res) => {
  try {
    const { appointment_date, appointment_time, therapist_id, notes } = req.body;
    
    // 1. Time Boundary Validation (8 AM to 8 PM)
    const [hours, minutes] = appointment_time.split(':').map(Number);
    if (hours < 8 || hours >= 20) {
      return res.status(400).json({ error: 'Appointments must be scheduled between 8:00 AM and 8:00 PM East Africa Time.' });
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

    // 4. Create New Session
    const result = await db.query(
      `INSERT INTO appointments (patient_id, therapist_id, appointment_date, appointment_time, status, notes)
       VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *`,
      [req.user.id, therapist_id || null, appointment_date, appointment_time, notes]
    );
    
    res.json({ message: 'Appointment requested successfully', appointment: result.rows[0] });
  } catch (err) { 
    console.error("DB Error:", err);
    res.status(500).json({ error: 'Backend crash', details: err.message }); 
  }
});

// Therapist: Get Pending Pooled Requests
router.get('/pending', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, p.first_name as other_first, p.last_name as other_last, u.phone_number, u.display_id as other_display_id
      FROM appointments a 
      JOIN users u ON a.patient_id = u.id 
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE a.status = 'pending' AND (a.therapist_id IS NULL OR a.therapist_id = $1)
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
      return res.status(400).json({ error: 'Appointment already claimed by another therapist' });
    }

    const appt = apptRes.rows[0];
    const patientRes = await db.query('SELECT phone_number, first_name FROM users WHERE id = $1', [appt.patient_id]);
    const therapistRes = await db.query('SELECT first_name, last_name FROM users WHERE id = $1', [req.user.id]);

    const patient = patientRes.rows[0];
    const therapist = therapistRes.rows[0];
    // Clean up Doctor Name (prevent "Dr. Dr.")
    const title = therapist.first_name.startsWith('Dr.') ? '' : 'Dr. ';
    const docName = `${title}${therapist.first_name} ${therapist.last_name || ''}`.trim();
    
    // Clean up Date formatting
    const cleanDate = new Date(appt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    // Trigger EgoSMS
    if (patient && patient.phone_number) {
      const smsMessage = `Butabika Cares: Your session with ${docName} is confirmed for ${cleanDate} at ${appt.appointment_time}. Log in at the scheduled time to join.`;
      try { await sendGenericSMS(patient.phone_number, smsMessage); } 
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
      ? `SELECT a.*, p.first_name as other_first, p.last_name as other_last, u.phone_number as other_phone, u.display_id as other_display_id 
         FROM appointments a 
         JOIN users u ON a.patient_id = u.id 
         LEFT JOIN profiles p ON u.id = p.user_id
         WHERE a.therapist_id = $1 AND (a.status = 'scheduled' OR a.status = 'pending')
         ORDER BY a.appointment_date ASC`
      : `SELECT a.*, p.first_name as other_first, p.last_name as other_last, u.display_id as other_display_id 
         FROM appointments a 
         LEFT JOIN users u ON a.therapist_id = u.id 
         LEFT JOIN profiles p ON u.id = p.user_id
         WHERE a.patient_id = $1 AND (a.status = 'scheduled' OR a.status = 'pending')
         ORDER BY a.appointment_date ASC`;

    const result = await db.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) { 
    console.error("DB Error:", err);
    res.status(500).json({ error: 'Backend crash', details: err.message }); 
  }
});

// Complete Session & Save Clinical Notes
router.put('/:id/complete', authenticate, async (req, res) => {
  try {
    const { notes } = req.body;
    
    const result = await db.query(`
      UPDATE appointments 
      SET status = 'completed', 
          notes = $1,
          ended_at = NOW()
      WHERE id = $2 
      RETURNING *
    `, [notes, req.params.id]);

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
    const { notes } = req.body;
    const apptId = req.params.id;
    
    await db.query('UPDATE appointments SET notes = $1 WHERE id = $2 AND therapist_id = $3', [notes, apptId, req.user.id]);
    res.json({ message: 'Notes updated successfully.' });
  } catch (err) { 
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to update notes' }); 
  }
});

// Therapist: Save Clinical Notes (Private & Shared)
router.post('/:id/notes', authenticate, async (req, res) => {
  if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const { private_notes, shared_notes } = req.body;
    const apptId = req.params.id;
    
    // Ensure the therapist owns this appointment
    const checkRes = await db.query('SELECT id FROM appointments WHERE id = $1 AND therapist_id = $2', [apptId, req.user.id]);
    if (checkRes.rows.length === 0) return res.status(403).json({ error: 'Unauthorized or appointment not found' });

    await db.query(
      'UPDATE appointments SET private_notes = $1, shared_notes = $2 WHERE id = $3',
      [private_notes, shared_notes, apptId]
    );
    res.json({ message: 'Clinical notes saved successfully.' });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to save notes' });
  }
});

// Patient: Get My Shared Notes
router.get('/patient/my-notes', authenticate, async (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Unauthorized' });
  try {
    // Explicitly stripping out private_notes in SQL by only selecting shared_notes
    const result = await db.query(`
      SELECT id, appointment_date, appointment_time, therapist_id, shared_notes 
      FROM appointments 
      WHERE patient_id = $1 AND shared_notes IS NOT NULL
      ORDER BY appointment_date DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
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

module.exports = router;
