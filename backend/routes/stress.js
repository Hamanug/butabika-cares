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
    const { score, maxScore, date, answers } = req.body;
    
    if (score === undefined || maxScore === undefined) {
      return res.status(400).json({ error: 'Score and maxScore are required' });
    }

    const result = await db.query(
      'INSERT INTO stress_tracking (user_id, score, max_score, created_at, answers) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, score, maxScore, date || new Date().toISOString(), answers ? JSON.stringify(answers) : null]
    );
    res.json({ message: 'Success', data: result.rows[0] });
  } catch (err) {
    console.error('Error saving stress score:', err);
    res.status(500).json({ error: 'Database error while saving stress score' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, score, max_score, answers, created_at FROM stress_tracking WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching stress scores:', err);
    res.status(500).json({ error: 'Database error while fetching stress scores' });
  }
});

module.exports = router;
