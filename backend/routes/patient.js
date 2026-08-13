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

// GET /api/patient/dashboard-stats
router.get('/dashboard-stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get total completed assessments
    const assessments = await db.query(`SELECT COUNT(*) FROM screening_results WHERE patient_id = $1`, [userId]);
    
    // Get total journal entries for dashboard stats
    const totalEntries = await db.query(`SELECT COUNT(*) FROM journal_entries WHERE patient_id = $1 AND deleted_at IS NULL`, [userId]);
    
    // Get mood stats (last 7 days of journal entries)
    const recentEntries = await db.query(`
      SELECT mood_rating, entry_text 
      FROM journal_entries 
      WHERE patient_id = $1 AND deleted_at IS NULL AND created_at >= NOW() - INTERVAL '7 days'
    `, [userId]);

    let moodStatus = 'No recent data';
    
    if (recentEntries.rows.length > 0) {
      let totalBlended = 0;
      let dissonantCount = 0;

      recentEntries.rows.forEach(entry => {
        const explicitPolarity = parseInt(entry.mood_rating) - 3; // 1-5 maps to -2 to +2
        const nlpScore = sentiment.analyze(entry.entry_text || '').score;
        
        // Cap nlpScore to prevent extreme outliers from skewing the blend too much
        let nlpPolarity = nlpScore;
        if (nlpPolarity > 3) nlpPolarity = 3;
        if (nlpPolarity < -3) nlpPolarity = -3;

        // Check for dissonance: e.g. rated 5 (polarity +2) but text is very negative (-2)
        // A difference of 3 or more is quite significant
        if (Math.abs(explicitPolarity - nlpPolarity) >= 3) {
          dissonantCount++;
        }
        
        const blended = (explicitPolarity + nlpPolarity) / 2;
        totalBlended += blended;
      });

      const avgBlended = totalBlended / recentEntries.rows.length;
      
      if (dissonantCount > 0 && dissonantCount >= recentEntries.rows.length / 2) {
        moodStatus = 'Dissonant / Conflicting';
      } else if (avgBlended > 0.5) {
        moodStatus = 'Consistently Positive';
      } else if (avgBlended < -0.5) {
        moodStatus = 'Trending Down';
      } else {
        moodStatus = 'Mixed/Fluctuating';
      }
    }

    res.json({
      assessmentsCompleted: parseInt(assessments.rows[0].count),
      moodStatus,
      journalEntries: parseInt(totalEntries.rows[0].count)
    });
  } catch (err) {
    console.error('Failed to fetch stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});
module.exports = router;
