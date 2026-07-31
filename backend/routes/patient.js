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

// GET /api/patient/dashboard-stats
router.get('/dashboard-stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get total completed assessments
    const assessments = await db.query(`SELECT COUNT(*) FROM screening_results WHERE patient_id = $1`, [userId]);
    
    // Get mood stats (average of last 5 entries)
    const moods = await db.query(`
      SELECT AVG(mood_rating) as avg_mood, COUNT(*) as total_entries 
      FROM (SELECT mood_rating FROM journal_entries WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 5) as recent_moods
    `, [userId]);

    res.json({
      assessmentsCompleted: parseInt(assessments.rows[0].count),
      avgMood: moods.rows[0].avg_mood ? parseFloat(moods.rows[0].avg_mood).toFixed(1) : 0,
      journalEntries: parseInt(moods.rows[0].total_entries)
    });
  } catch (err) {
    console.error('Failed to fetch stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});
module.exports = router;
