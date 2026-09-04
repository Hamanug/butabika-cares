const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const formatPhone = require('../utils/formatPhone');
const { sendOTP } = require('../services/smsService');
const crypto = require('crypto');

// Generates a unique 8-digit display ID (e.g., "4921-8832")
async function generateUniqueDisplayId(db) {
  let isUnique = false;
  let displayId = '';

  while (!isUnique) {
    // Generate a secure random number between 10000000 and 99999999
    const num = crypto.randomInt(10000000, 100000000).toString();
    // Format with a hyphen for readability
    displayId = `${num.slice(0, 4)}-${num.slice(4)}`;

    // Check PostgreSQL to ensure no collision exists
    const result = await db.query(
      'SELECT id FROM users WHERE display_id = $1', 
      [displayId]
    );

    if (result.rows.length === 0) {
      isUnique = true;
    }
  }
  return displayId;
}

const calculateAge = (dobString) => {
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

const rateLimit = require('express-rate-limit');

// IP-based rate limiter: Max 5 requests per IP per hour
const otpIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests from this IP. Please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/patient/send-otp
router.post('/patient/send-otp', otpIpLimiter, async (req, res) => {
  try {
    const { phone_number, date_of_birth } = req.body;
    if (!phone_number) return res.status(400).json({ error: 'phone_number is required' });
    
    if (req.body.date_of_birth) {
      const userAge = calculateAge(req.body.date_of_birth);
      if (userAge < 18) {
        return res.status(400).json({ error: "Users must be 18 or older to register." });
      }
    }
    
    const normalizedPhone = formatPhone(phone_number);
    if (!normalizedPhone) return res.status(400).json({ error: 'Invalid phone number format' });

    // 1. Pre-Flight Check: Prevent Duplicate Sign-ups
    const userCheck = await db.query('SELECT id FROM users WHERE phone_number = $1 AND role = $2', [normalizedPhone, 'patient']);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this phone number already exists on the platform.' });
    }

    // 2. Phone-based Rate Limiting: Max 3 requests per phone per hour
    // Since expires_at is created as NOW() + 10 mins, an OTP from 1 hour ago has expires_at > NOW() - 50 mins.
    const phoneLimitCheck = await db.query(
      `SELECT count(*) FROM otps WHERE phone_number = $1 AND expires_at > NOW() - INTERVAL '50 minutes'`,
      [normalizedPhone]
    );
    
    if (parseInt(phoneLimitCheck.rows[0].count) >= 3) {
      return res.status(429).json({ error: 'Maximum OTP requests reached for this phone number. Please try again after an hour.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await db.query('INSERT INTO otps (phone_number, otp_code, expires_at) VALUES ($1, $2, $3)', [normalizedPhone, code, expiresAt]);
    await sendOTP(normalizedPhone, code, 'signup');
    
    res.json({ message: 'OTP processed successfully' });
  } catch (error) { 
    console.error('OTP Request Error:', error);
    res.status(500).json({ error: 'Failed to process OTP request' }); 
  }
});

// POST /api/auth/patient/verify-otp
router.post('/patient/verify-otp', async (req, res) => {
  try {
    const { phone_number, otp_code, password, date_of_birth, gender, nationality } = req.body;
    if (!phone_number || !otp_code || !password) return res.status(400).json({ error: 'Missing credentials' });

    if (!date_of_birth) return res.status(400).json({ error: 'Date of birth is required.' });
    
    if (calculateAge(date_of_birth) < 18) {
      return res.status(400).json({ error: 'Users must be 18 or older to register.' });
    }

    // Auto-migrate DOB, gender, nationality columns if missing
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50);');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);');

    const normalizedPhone = formatPhone(phone_number);
    const otpResult = await db.query('SELECT * FROM otps WHERE phone_number = $1 AND otp_code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1', [normalizedPhone, otp_code]);
    if (otpResult.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired OTP' });

    let userResult = await db.query('SELECT * FROM users WHERE phone_number = $1', [normalizedPhone]);
    let user = userResult.rows[0];
    const passwordHash = await bcrypt.hash(password, 10);

    if (!user) {
      const displayId = await generateUniqueDisplayId(db);
      const newUserResult = await db.query('INSERT INTO users (phone_number, role, is_phone_verified, password_hash, date_of_birth, gender, nationality, display_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [normalizedPhone, 'patient', true, passwordHash, date_of_birth, gender || null, nationality || null, displayId]);
      user = newUserResult.rows[0];
    } else {
      const updatedUserResult = await db.query('UPDATE users SET is_phone_verified = true, password_hash = $2 WHERE id = $1 RETURNING *', [user.id, passwordHash]);
      user = updatedUserResult.rows[0];
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000 });
    res.json({ message: 'Verified successfully', token, user: { id: user.id, phone_number: user.phone_number, role: user.role, display_id: user.display_id, gender: user.gender, nationality: user.nationality, first_name: user.first_name, last_name: user.last_name } });
    await db.query('DELETE FROM otps WHERE id = $1', [otpResult.rows[0].id]);
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    if (!phone_number || !password) return res.status(400).json({ error: 'Credentials required' });

    const formattedPhone = formatPhone(phone_number);
    const userResult = await db.query('SELECT u.*, p.first_name, p.last_name FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.phone_number = $1 AND u.role = $2', [formattedPhone, 'patient']);
    const user = userResult.rows[0];

    if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000 });
    res.json({ message: 'Logged in successfully', token, user: { id: user.id, phone_number: user.phone_number, role: user.role, display_id: user.display_id, gender: user.gender, nationality: user.nationality, first_name: user.first_name, last_name: user.last_name } });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

// --- NEW FORGOT PASSWORD ROUTES ---

// POST /api/auth/patient/forgot-password-otp
router.post('/patient/forgot-password-otp', async (req, res) => {
  try {
    const { phone_number } = req.body;
    const normalizedPhone = formatPhone(phone_number);

    const userResult = await db.query('SELECT * FROM users WHERE phone_number = $1 AND role = $2', [normalizedPhone, 'patient']);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this number. Please check for typos.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query('INSERT INTO otps (phone_number, otp_code, expires_at) VALUES ($1, $2, $3)', [normalizedPhone, code, expiresAt]);
    await sendOTP(normalizedPhone, code, 'recovery');

    res.json({ message: 'Recovery OTP sent successfully' });
  } catch (error) { res.status(500).json({ error: 'Failed to process request' }); }
});

// POST /api/auth/patient/reset-password
router.post('/patient/reset-password', async (req, res) => {
  try {
    const { phone_number, otp_code, new_password } = req.body;
    const normalizedPhone = formatPhone(phone_number);

    const otpResult = await db.query('SELECT * FROM otps WHERE phone_number = $1 AND otp_code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1', [normalizedPhone, otp_code]);
    if (otpResult.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const passwordHash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE phone_number = $2 AND role = $3', [passwordHash, normalizedPhone, 'patient']);
    await db.query('DELETE FROM otps WHERE id = $1', [otpResult.rows[0].id]);

    res.json({ message: 'Password reset successfully' });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

// ... existing therapist/admin login intact
router.post('/provider-login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: 'identifier and password are required' });
    let query = "SELECT u.*, p.first_name, p.last_name FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.role IN ('therapist', 'admin', 'clinical_admin') AND ";
    let queryParams = [];
    if (identifier.includes('@')) { query += 'u.email = $1'; queryParams.push(identifier.toLowerCase()); } 
    else { query += 'u.phone_number = $1'; queryParams.push(formatPhone(identifier)); }
    const userResult = await db.query(query, queryParams);
    const user = userResult.rows[0];
    if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.requires_password_change) {
      return res.json({ requireReset: true, userId: user.id });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000 });
    res.json({ message: 'Logged in successfully', user: { id: user.id, email: user.email, phone_number: user.phone_number, role: user.role, display_id: user.display_id, first_name: user.first_name, last_name: user.last_name } });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

// POST /api/auth/provider-set-password
router.post('/provider-set-password', async (req, res) => {
  try {
    const { identifier, temporary_password, new_password } = req.body;
    if (!identifier || !temporary_password || !new_password) return res.status(400).json({ error: 'All fields are required' });
    
    if (new_password.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

    let query = "SELECT * FROM users WHERE role IN ('therapist', 'admin', 'clinical_admin') AND ";
    let queryParams = [];
    if (identifier.includes('@')) { query += 'email = $1'; queryParams.push(identifier.toLowerCase()); } 
    else { query += 'phone_number = $1'; queryParams.push(formatPhone(identifier)); }

    const userResult = await db.query(query, queryParams);
    const user = userResult.rows[0];
    
    if (!user || !user.requires_password_change) return res.status(401).json({ error: 'Invalid request' });

    const validPassword = await bcrypt.compare(temporary_password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid temporary credentials' });

    const newPasswordHash = await bcrypt.hash(new_password, 10);
    const updatedUserResult = await db.query(
      'UPDATE users SET password_hash = $1, requires_password_change = false WHERE id = $2 RETURNING *',
      [newPasswordHash, user.id]
    );
    const updatedUser = updatedUserResult.rows[0];

    const token = jwt.sign({ id: updatedUser.id, role: updatedUser.role }, process.env.JWT_SECRET || 'super_secret_key_change_me', { expiresIn: '8h' });
    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000 });
    
    res.json({ message: 'Password updated and logged in successfully', user: { id: updatedUser.id, email: updatedUser.email, phone_number: updatedUser.phone_number, role: updatedUser.role } });
  } catch (error) { 
    console.error('Initial Password Set Error:', error);
    res.status(500).json({ error: 'Internal server error' }); 
  }
});

module.exports = router;

