const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

// Middleware to authenticate via cookie
const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.phone_number, u.role, u.email, u.display_id,
             p.first_name, p.last_name, p.bio, p.occupation, p.profile_picture 
      FROM users u 
      LEFT JOIN profiles p ON u.id = p.user_id 
      WHERE u.id = $1
    `, [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/', authenticate, async (req, res) => {
  const { first_name, last_name, email, occupation, bio } = req.body;
  try {
    await db.query('BEGIN');
    
    await db.query('UPDATE users SET email = $1 WHERE id = $2', [email, req.user.id]);
    
    const existing = await db.query('SELECT id FROM profiles WHERE user_id = $1', [req.user.id]);
    if (existing.rows.length > 0) {
      await db.query(`
        UPDATE profiles SET first_name = $1, last_name = $2, occupation = $3, bio = $4 
        WHERE user_id = $5
      `, [first_name, last_name, occupation, bio, req.user.id]);
    } else {
      await db.query(`
        INSERT INTO profiles (user_id, first_name, last_name, occupation, bio) 
        VALUES ($1, $2, $3, $4, $5)
      `, [req.user.id, first_name, last_name, occupation, bio]);
    }
    
    await db.query('COMMIT');
    
    const result = await db.query(`
      SELECT u.id, u.phone_number, u.role, u.email, u.display_id,
             p.first_name, p.last_name, p.bio, p.occupation, p.profile_picture 
      FROM users u 
      LEFT JOIN profiles p ON u.id = p.user_id 
      WHERE u.id = $1
    `, [req.user.id]);
    
    res.json({ message: 'Profile updated', user: result.rows[0] });
  } catch (error) { 
    await db.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' }); 
  }
});

router.post('/upload', authenticate, upload.single('profile_picture'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const filePath = `/uploads/${req.file.filename}`;
    
    // Check old picture
    const oldPicRes = await db.query('SELECT profile_picture FROM profiles WHERE user_id = $1', [req.user.id]);
    const oldPic = oldPicRes.rows[0]?.profile_picture;
    
    // Delete old picture if exists
    if (oldPic) {
      const oldPath = path.join(__dirname, '..', oldPic);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    // Update DB
    const existing = await db.query('SELECT id FROM profiles WHERE user_id = $1', [req.user.id]);
    if (existing.rows.length > 0) {
      await db.query('UPDATE profiles SET profile_picture = $1 WHERE user_id = $2', [filePath, req.user.id]);
    } else {
      await db.query('INSERT INTO profiles (user_id, profile_picture) VALUES ($1, $2)', [req.user.id, filePath]);
    }
    
    const result = await db.query(`
      SELECT u.id, u.phone_number, u.role, u.email, u.display_id,
             p.first_name, p.last_name, p.bio, p.occupation, p.profile_picture 
      FROM users u 
      LEFT JOIN profiles p ON u.id = p.user_id 
      WHERE u.id = $1
    `, [req.user.id]);
    
    res.json({ message: 'Profile picture updated', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
