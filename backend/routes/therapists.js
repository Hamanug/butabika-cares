const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/active', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.occupation, u.bio, u.profile_picture 
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.role = 'therapist' OR ur.role_name = 'therapist'
      ORDER BY u.last_name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch therapists:', err);
    res.status(500).json({ error: 'Failed to fetch therapists' });
  }
});

module.exports = router;
