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
  try {
    const { situation, emotion, automaticThought, rationalThought, date } = req.body;
    
    if (!situation || !emotion || !automaticThought || !rationalThought) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await db.query(
      'INSERT INTO thought_records (user_id, situation, emotion, automatic_thought, rational_thought, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, situation, emotion, automaticThought, rationalThought, date || new Date().toISOString()]
    );
    res.json({ message: 'Success', data: result.rows[0] });
  } catch (err) {
    console.error('Error saving thought record:', err);
    res.status(500).json({ error: 'Database error while saving thought record' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, situation, emotion, automatic_thought, rational_thought, created_at FROM thought_records WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching thought records:', err);
    res.status(500).json({ error: 'Database error while fetching thought records' });
  }
});

module.exports = router;
