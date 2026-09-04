const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');
const requireTier = require('../middleware/requireTier');

const router = express.Router();
const clinicalAdminAuth = [authenticateToken, requireTier(['clinical_admin'])];

// POST /therapists/initiate
router.post('/therapists/initiate', clinicalAdminAuth, async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, specialization, occupation } = req.body;
    
    // Step 1: Initiate therapist (no password, inactive)
    const result = await db.query(`
      INSERT INTO users (email, phone_number, first_name, last_name, role, is_active, occupation, bio)
      VALUES ($1, $2, $3, $4, 'therapist', false, $5, $6)
      RETURNING id, email, first_name, last_name, is_active
    `, [email, phone_number, first_name, last_name, occupation, specialization]);
    
    res.json({ message: 'Therapist initiated successfully. Awaiting IT provision.', therapist: result.rows[0] });
  } catch (error) {
    console.error('Failed to initiate therapist:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A user with this email or phone number already exists.' });
    }
    res.status(500).json({ error: 'Failed to initiate therapist.' });
  }
});

// GET /therapists
router.get('/therapists', clinicalAdminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, first_name, last_name, email, phone_number, is_active, occupation
      FROM users WHERE role = 'therapist' ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch therapists' });
  }
});

// GET /patients
router.get('/patients', clinicalAdminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, first_name, last_name, email, phone_number, is_active 
      FROM users WHERE role = 'patient' ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET /audit/phone-reveals
router.get('/audit/phone-reveals', clinicalAdminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, 
             t.first_name as therapist_first, t.last_name as therapist_last,
             p.first_name as patient_first, p.last_name as patient_last
      FROM audit_phone_reveals a
      JOIN users t ON a.therapist_id = t.id
      JOIN users p ON a.patient_id = p.id
      ORDER BY a.created_at DESC LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit phone reveals logs' });
  }
});

// GET /audit/referrals
router.get('/audit/referrals', clinicalAdminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*,
             p.first_name as patient_first, p.last_name as patient_last,
             rt.first_name as referring_first, rt.last_name as referring_last,
             rect.first_name as receiving_first, rect.last_name as receiving_last
      FROM patient_referrals r
      JOIN users p ON r.patient_id = p.id
      JOIN users rt ON r.referring_therapist_id = rt.id
      JOIN users rect ON r.receiving_therapist_id = rect.id
      ORDER BY r.created_at DESC LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient referrals logs' });
  }
});

// POST /avatar/approve
router.post('/avatar/approve', clinicalAdminAuth, async (req, res) => {
  try {
    const { provider_id } = req.body;
    await db.query(`UPDATE users SET profile_picture_approved = true WHERE id = $1`, [provider_id]);
    res.json({ message: 'Avatar approved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve avatar' });
  }
});

// POST /avatar/reject
router.post('/avatar/reject', clinicalAdminAuth, async (req, res) => {
  try {
    const { provider_id } = req.body;
    await db.query(`UPDATE users SET profile_picture = null, profile_picture_approved = false WHERE id = $1`, [provider_id]);
    res.json({ message: 'Avatar rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject avatar' });
  }
});

// GET /triage
// Fetches all pending intake requests where no therapist is assigned
router.get('/triage', clinicalAdminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, p.first_name, p.last_name, u.gender as patient_gender, u.nationality, u.date_of_birth
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE a.status = 'pending' AND a.therapist_id IS NULL
      ORDER BY a.created_at ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Triage Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch triage queue' });
  }
});

// PUT /triage/assign
// Assigns a therapist to a pending concierge request
router.put('/triage/assign', clinicalAdminAuth, async (req, res) => {
  try {
    const { appointment_id, therapist_id } = req.body;
    if (!appointment_id || !therapist_id) {
      return res.status(400).json({ error: 'Appointment ID and Therapist ID are required.' });
    }

    const result = await db.query(`
      UPDATE appointments 
      SET therapist_id = $1 
      WHERE id = $2 AND status = 'pending' AND therapist_id IS NULL
      RETURNING id
    `, [therapist_id, appointment_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found or already assigned.' });
    }

    res.json({ message: 'Patient successfully assigned to therapist.' });
  } catch (error) {
    console.error('Triage Assignment Error:', error);
    res.status(500).json({ error: 'Failed to assign therapist' });
  }
});

module.exports = router;
