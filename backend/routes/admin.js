const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

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

    // 2. Verify user credentials and strict role flag
    const userResult = await db.query(`
      SELECT u.*, ur.role_name as role 
      FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      WHERE u.email = $1 AND ur.role_name = 'admin'
    `, [normalizedEmail]);
    const user = userResult.rows[0];

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
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
      sameSite: 'strict', 
      maxAge: 8 * 60 * 60 * 1000 
    });
    
    res.json({ 
      message: 'Admin logged in successfully', 
      token, 
      user: { id: user.id, email: user.email, role: user.role, isAdmin: true } 
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// POST /api/admin/therapists
router.post('/therapists', async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, password, specialization, credentials } = req.body;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert into flattened users table
    const userRes = await db.query(`
      INSERT INTO users (email, phone_number, first_name, last_name, role, password_hash, bio, occupation)
      VALUES ($1, $2, $3, $4, 'therapist', $5, $6, $7)
      RETURNING id, email, first_name, last_name
    `, [email, phone_number, first_name, last_name, passwordHash, credentials, specialization]);
    
    const userId = userRes.rows[0].id;
    
    // Assign role
    await db.query(`INSERT INTO user_roles (user_id, role_name) VALUES ($1, 'therapist')`, [userId]);
    
    res.json({ message: 'Therapist onboarded successfully', therapist: userRes.rows[0] });
  } catch (error) {
    console.error('Failed to onboard therapist:', error);
    res.status(500).json({ error: 'Failed to create therapist profile' });
  }
});

module.exports = router;
