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
    
    const existing = await db.query(
      `SELECT id FROM appointments WHERE patient_id = $1 AND status IN ('pending', 'scheduled', 'accepted')`,
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a pending or scheduled session. Please complete it before booking another.' });
    }

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
      SELECT a.*, u.first_name, u.last_name, u.phone_number 
      FROM appointments a 
      JOIN users u ON a.patient_id = u.id 
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
      ? `SELECT a.*, u.first_name as other_first, u.last_name as other_last, u.phone_number as other_phone 
         FROM appointments a JOIN users u ON a.patient_id = u.id 
         WHERE a.therapist_id = $1 AND (a.status = 'scheduled' OR a.status = 'pending')
         ORDER BY a.appointment_date ASC`
      : `SELECT a.*, u.first_name as other_first, u.last_name as other_last 
         FROM appointments a LEFT JOIN users u ON a.therapist_id = u.id 
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
router.post('/complete/:id', authenticate, async (req, res) => {
  try {
    const { notes } = req.body;
    await db.query(`UPDATE appointments SET status = 'completed', notes = $1 WHERE id = $2`, [notes, req.params.id]);
    res.json({ message: 'Session completed successfully' });
  } catch (err) { 
    console.error("DB Error:", err);
    res.status(500).json({ error: 'Backend crash', details: err.message }); 
  }
});

// Therapist: Update Notes with Audit Logging (Legacy)
router.put('/notes/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const { notes } = req.body;
    const apptId = req.params.id;
    
    const currentRes = await db.query('SELECT notes FROM appointments WHERE id = $1', [apptId]);
    const previousNotes = currentRes.rows[0]?.notes || '';

    if (previousNotes !== notes) {
      await db.query(
        'INSERT INTO note_audit_logs (appointment_id, therapist_id, previous_notes, new_notes) VALUES ($1, $2, $3, $4)',
        [apptId, req.user.id, previousNotes, notes]
      );
    }

    await db.query('UPDATE appointments SET notes = $1 WHERE id = $2', [notes, apptId]);
    res.json({ message: 'Notes updated and audited successfully.' });
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

module.exports = router;
