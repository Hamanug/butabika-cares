const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try { 
    req.user = jwt.verify(token, JWT_SECRET); 
    next(); 
  }
  catch { 
    res.status(401).json({ error: 'Invalid token' }); 
  }
};

// POST /api/screenings/submit
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { screening_type, score, answers } = req.body;
    const result = await db.query(`
      INSERT INTO screening_results (patient_id, screening_type, score, answers)
      VALUES ($1, $2, $3, $4)
      RETURNING id, score, created_at
    `, [req.user.id, screening_type, score, JSON.stringify(answers)]);
    
    res.json({ message: 'Screening saved', result: result.rows[0] });
  } catch (error) {
    console.error('Screening submission error:', error);
    res.status(500).json({ error: 'Failed to save screening' });
  }
});

module.exports = router;
