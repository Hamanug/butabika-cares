const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';
const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/', authenticate, async (req, res) => {
  const { type, date, cycles_completed } = req.body;
  
  if (!type) {
    return res.status(400).json({ error: 'Type is required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO mindfulness_tracking (user_id, type, cycles_completed, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, type, cycles_completed || 0, date || new Date().toISOString()]
    );
    res.json({ message: 'Mindfulness session saved successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Error saving mindfulness session:', err);
    res.status(500).json({ error: 'Database error while saving mindfulness session' });
  }
});

module.exports = router;
