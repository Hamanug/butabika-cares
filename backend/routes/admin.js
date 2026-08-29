const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const requireTier = require('../middleware/requireTier');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';
const itAdminAuth = [authenticateToken, requireTier(['system_admin', 'super_admin'])];

// POST /api/admin/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const normalizedEmail = email.toLowerCase();

    // 1. Check if email exists in pre_approved_admins table
    const approvedRes = await db.query('SELECT email FROM pre_approved_admins WHERE email = $1', [normalizedEmail]);
    if (approvedRes.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized: Email is not pre-approved for admin access.' });
    }

    // 2. Verify user credentials
    const userResult = await db.query(`
      SELECT * FROM users 
      WHERE email = $1 AND role IN ('system_admin', 'clinical_admin', 'super_admin')
    `, [normalizedEmail]);
    const user = userResult.rows[0];

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.requires_password_change) {
      return res.json({ requireReset: true, userId: user.id });
    }

    // 3. Return admin session token
    const token = jwt.sign(
      { id: user.id, role: user.role, isAdmin: true }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    res.cookie('auth_token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 86400000
    });
    
    res.json({ 
      message: 'Admin logged in successfully', 
      user: { id: user.id, email: user.email, role: 'admin' } 
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/therapists
router.post('/therapists', [authenticateToken, isAdmin], async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, password, specialization, credentials } = req.body;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert into flattened users table
    const userRes = await db.query(`
      INSERT INTO users (email, phone_number, first_name, last_name, role, password_hash, bio, occupation, requires_password_change)
      VALUES ($1, $2, $3, $4, 'therapist', $5, $6, $7, true)
      RETURNING id, email, first_name, last_name
    `, [email, phone_number, first_name, last_name, passwordHash, credentials, specialization]);
    
    res.json({ message: 'Therapist onboarded successfully', therapist: userRes.rows[0] });
  } catch (error) {
    console.error('Failed to onboard therapist:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'A user with this email already exists.' });
    }
    res.status(500).json({ error: 'Failed to create therapist profile' });
  }
});

// GET /api/admin/sms-balance
router.get('/sms-balance', [authenticateToken, isAdmin], async (req, res) => {
  try {
    const axios = require('axios');
    const payload = {
      method: "GetBalance",
      userdata: {
        username: process.env.EGOSMS_USERNAME,
        password: process.env.EGOSMS_PASSWORD
      }
    };
    const response = await axios.post('https://www.egosms.co/api/v1/json/', payload);
    res.json({ balance: response.data?.Balance || 0 });
  } catch (error) {
    console.error('EgoSMS balance error:', error);
    res.status(500).json({ error: 'Failed to fetch SMS balance' });
  }
});

// GET /api/admin/crisis-alerts
router.get('/crisis-alerts', [authenticateToken, isAdmin], async (req, res) => {
  try {
    const result = await db.query(`
      SELECT sr.*, u.first_name, u.last_name, u.email, u.phone_number 
      FROM screening_results sr
      JOIN users u ON sr.patient_id = u.id
      WHERE sr.screening_type IN ('Suicide Risk', 'SUICIDE_RISK') AND sr.score >= 5
      ORDER BY sr.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch crisis alerts:', error);
    res.status(500).json({ error: 'Failed to fetch crisis alerts' });
  }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', itAdminAuth, async (req, res) => {
  try {
    const { is_active } = req.body;
    await db.query('UPDATE users SET is_active = $1 WHERE id = $2', [is_active, req.params.id]);
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Failed to update user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// GET /api/admin/analytics
router.get('/analytics', [authenticateToken, isAdmin], async (req, res) => {
  try {
    const totalUsers = await db.query("SELECT COUNT(*) FROM users WHERE role = 'patient'");
    const activeTherapists = await db.query("SELECT COUNT(*) FROM users WHERE role = 'therapist' AND is_active = TRUE");
    const completedSessions = await db.query("SELECT COUNT(*) FROM appointments WHERE status = 'completed'");
    
    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count, 10),
      activeTherapists: parseInt(activeTherapists.rows[0].count, 10),
      completedSessions: parseInt(completedSessions.rows[0].count, 10)
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/admin/users
router.get('/users', [authenticateToken, isAdmin], async (req, res) => {
  try {
    const result = await db.query("SELECT id, first_name, last_name, email, role, is_active FROM users ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// IT Diagnostic & Control Endpoints

// POST /api/admin/users/:id/reset-password
router.post('/users/:id/reset-password', itAdminAuth, async (req, res) => {
  try {
    const tempPassword = Math.random().toString(36).slice(-8); // Generate 8-char random password
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    
    await db.query(`
      UPDATE users 
      SET password_hash = $1, requires_password_change = true 
      WHERE id = $2
    `, [passwordHash, req.params.id]);

    res.json({ message: 'Password reset triggered successfully.', tempPassword });
  } catch (error) {
    console.error('Failed to trigger password reset:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', itAdminAuth, async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, is_active } = req.body;
    
    await db.query(`
      UPDATE users 
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone_number = COALESCE($4, phone_number),
        is_active = COALESCE($5, is_active)
      WHERE id = $6
    `, [first_name, last_name, email, phone_number, is_active, req.params.id]);
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// GET /api/admin/health
router.get('/health', itAdminAuth, async (req, res) => {
  try {
    let dbStatus = 'disconnected';
    try {
      const result = await db.query('SELECT 1 AS ok');
      if (result.rows[0].ok === 1) dbStatus = 'connected';
    } catch (dbErr) {
      dbStatus = 'error';
    }

    res.json({
      db_status: dbStatus,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
});

// GET /api/admin/logs
router.get('/logs', itAdminAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch system logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs.' });
  }
});

// POST /api/admin/test-sms
router.post('/test-sms', itAdminAuth, async (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) return res.status(400).json({ error: 'phone_number is required' });
    
    const { sendOTP } = require('../services/smsService');
    // Using sendOTP for simplicity, or we could direct call egosms here
    // Let's use direct egosms call as requested "fire a standard test text via EgoSMS"
    const axios = require('axios');
    const payload = {
      method: "SendSMS",
      userdata: {
        username: process.env.EGOSMS_USERNAME,
        password: process.env.EGOSMS_PASSWORD
      },
      msgdata: [{
        number: phone_number,
        message: "Butabika Cares: This is a system health test message."
      }]
    };
    
    const response = await axios.post('https://www.egosms.co/api/v1/json/', payload);
    res.json({ success: true, api_response: response.data });
  } catch (error) {
    console.error('Test SMS failed:', error);
    res.status(500).json({ error: 'Failed to send test SMS.' });
  }
});

module.exports = router;
