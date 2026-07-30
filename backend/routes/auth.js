const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const formatPhone = require('../utils/formatPhone');
const { sendOTP } = require('../services/smsService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

// POST /api/auth/patient/send-otp
router.post('/patient/send-otp', async (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) return res.status(400).json({ error: 'phone_number is required' });
    const normalizedPhone = formatPhone(phone_number);
    if (!normalizedPhone) return res.status(400).json({ error: 'Invalid phone number format' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query('INSERT INTO otps (phone_number, otp_code, expires_at) VALUES ($1, $2, $3)', [normalizedPhone, code, expiresAt]);
    await sendOTP(normalizedPhone, code, 'signup');
    res.json({ message: 'OTP processed successfully' });
  } catch (error) { res.status(500).json({ error: 'Failed to process OTP request' }); }
});

// POST /api/auth/patient/verify-otp
router.post('/patient/verify-otp', async (req, res) => {
  try {
    const { phone_number, otp_code, password, date_of_birth } = req.body;
    if (!phone_number || !otp_code || !password) return res.status(400).json({ error: 'Missing credentials' });

    if (!date_of_birth) return res.status(400).json({ error: 'Date of birth is required.' });
    
    const dob = new Date(date_of_birth);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    
    if (age < 18) {
      return res.status(400).json({ error: 'You must be at least 18 years old to register for Butabika Cares.' });
    }

    // Auto-migrate DOB column if missing
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;');

    const normalizedPhone = formatPhone(phone_number);
    const otpResult = await db.query('SELECT * FROM otps WHERE phone_number = $1 AND otp_code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1', [normalizedPhone, otp_code]);
    if (otpResult.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired OTP' });

    let userResult = await db.query('SELECT * FROM users WHERE phone_number = $1', [normalizedPhone]);
    let user = userResult.rows[0];
    const passwordHash = await bcrypt.hash(password, 10);

    if (!user) {
      const newUserResult = await db.query('INSERT INTO users (phone_number, role, is_phone_verified, password_hash, date_of_birth) VALUES ($1, $2, $3, $4, $5) RETURNING *', [normalizedPhone, 'patient', true, passwordHash, date_of_birth]);
      user = newUserResult.rows[0];
    } else {
      const updatedUserResult = await db.query('UPDATE users SET is_phone_verified = true, password_hash = $2 WHERE id = $1 RETURNING *', [user.id, passwordHash]);
      user = updatedUserResult.rows[0];
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000 });
    res.json({ message: 'Verified successfully', token, user: { id: user.id, phone_number: user.phone_number, role: user.role } });
    await db.query('DELETE FROM otps WHERE id = $1', [otpResult.rows[0].id]);
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    if (!phone_number || !password) return res.status(400).json({ error: 'Credentials required' });

    const formattedPhone = formatPhone(phone_number);
    const userResult = await db.query('SELECT * FROM users WHERE phone_number = $1 AND role = $2', [formattedPhone, 'patient']);
    const user = userResult.rows[0];

    if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000 });
    res.json({ message: 'Logged in successfully', token, user: { id: user.id, phone_number: user.phone_number, role: user.role } });
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
router.post('/therapist/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: 'identifier and password are required' });
    let query = 'SELECT * FROM users WHERE role = $1 AND ';
    let queryParams = ['therapist'];
    if (identifier.includes('@')) { query += 'email = $2'; queryParams.push(identifier.toLowerCase()); } 
    else { query += 'phone_number = $2'; queryParams.push(formatPhone(identifier)); }
    const userResult = await db.query(query, queryParams);
    const user = userResult.rows[0];
    if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000 });
    res.json({ message: 'Logged in successfully', user: { id: user.id, email: user.email, phone_number: user.phone_number, role: user.role } });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    const userResult = await db.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email.toLowerCase(), 'admin']);
    const user = userResult.rows[0];
    if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000 });
    res.json({ message: 'Logged in successfully', user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
