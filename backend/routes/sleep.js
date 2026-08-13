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
  const { score, date } = req.body;
  
  if (score === undefined) {
    return res.status(400).json({ error: 'Score is required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO sleep_tracking (user_id, score, created_at) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, score, date || new Date().toISOString()]
    );
    res.json({ message: 'Sleep score saved successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Error saving sleep score:', err);
    res.status(500).json({ error: 'Database error while saving sleep score' });
  }
});

module.exports = router;
