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

// POST /api/journal/entries
router.post('/entries', authenticate, async (req, res) => {
  try {
    const { mood_rating, mood_label, entry_text } = req.body;
    const result = await db.query(`
      INSERT INTO journal_entries (patient_id, mood_rating, mood_label, entry_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.user.id, mood_rating, mood_label, entry_text]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Failed to create journal entry:', err);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
});

// GET /api/journal/entries (Patient's own history)
router.get('/entries', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM journal_entries 
      WHERE patient_id = $1 
      ORDER BY created_at DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch journal entries:', err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

module.exports = router;
