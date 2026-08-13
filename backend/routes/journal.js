const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

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
      WHERE patient_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `, [req.user.id]);
    
    const rows = result.rows.map(entry => {
      const explicitPolarity = parseInt(entry.mood_rating) - 3;
      const nlpScore = sentiment.analyze(entry.entry_text || '').score;
      let nlpPolarity = nlpScore;
      if (nlpPolarity > 3) nlpPolarity = 3;
      if (nlpPolarity < -3) nlpPolarity = -3;
      
      const isDissonant = (explicitPolarity >= 1 && nlpPolarity <= 0) || Math.abs(explicitPolarity - nlpPolarity) >= 3;
      let analysisTag = 'Aligned';
      if (isDissonant) analysisTag = 'Dissonant';
      else if (Math.abs(nlpPolarity) <= 1 && Math.abs(explicitPolarity) <= 1) analysisTag = 'Neutral Trend';
      
      return {
        ...entry,
        isDissonant,
        nlpScore,
        analysisTag
      };
    });
    
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch journal entries:', err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// DELETE /api/journal/entries/:id
router.delete('/entries/:id', authenticate, async (req, res) => {
  try {
    await db.query(`
      UPDATE journal_entries 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND patient_id = $2
    `, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete entry:', err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;
