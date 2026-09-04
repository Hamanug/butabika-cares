const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `therapist-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

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

router.get('/active', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id, 
        u.role,
        u.email,
        tp.title,
        COALESCE(p.first_name, 'New') AS first_name, 
        COALESCE(p.last_name, 'Therapist') AS last_name, 
        COALESCE(tp.specialization, 'Pending Assignment') as occupation, 
        tp.profile_picture,
        tp.bio,
        p.gender,
        COUNT(a.id) AS session_count
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN therapist_profiles tp ON u.id = tp.user_id
      LEFT JOIN appointments a ON u.id = a.therapist_id
      WHERE u.role = 'therapist'
      GROUP BY u.id, p.first_name, p.last_name, tp.title, tp.specialization, tp.profile_picture, tp.bio, p.gender
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch therapists:', err);
    res.status(500).json({ error: 'Failed to fetch therapists' });
  }
});


router.get('/roster', authenticate, async (req, res) => {
  if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Unauthorized' });
  
  try {
    const patientsQuery = await db.query(`
      SELECT DISTINCT u.id, u.display_id, p.first_name, p.last_name, p.user_id,
      (SELECT a.appointment_date FROM appointments a WHERE a.patient_id = u.id AND a.therapist_id = $1 AND a.status = 'scheduled' ORDER BY a.appointment_date ASC LIMIT 1) as next_session
      FROM appointments app
      JOIN users u ON app.patient_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE app.therapist_id = $1
    `, [req.user.id]);
    
    const patients = patientsQuery.rows;
    
    for (const patient of patients) {
      const recentEntries = await db.query(`
        SELECT mood_rating, entry_text 
        FROM journal_entries 
        WHERE patient_id = $1 AND deleted_at IS NULL AND created_at >= NOW() - INTERVAL '7 days'
      `, [patient.id]);
      
      let moodStatus = 'No recent data';
      let isDissonant = false;
      
      if (recentEntries.rows.length > 0) {
        let totalBlended = 0;
        let dissonantCount = 0;
  
        recentEntries.rows.forEach(entry => {
          const explicitPolarity = parseInt(entry.mood_rating) - 3;
          let nlpPolarity = sentiment.analyze(entry.entry_text || '').score;
          if (nlpPolarity > 3) nlpPolarity = 3;
          if (nlpPolarity < -3) nlpPolarity = -3;
  
          if (Math.abs(explicitPolarity - nlpPolarity) >= 3) {
            dissonantCount++;
          }
          
          totalBlended += (explicitPolarity + nlpPolarity) / 2;
        });
  
        const avgBlended = totalBlended / recentEntries.rows.length;
        
        if (dissonantCount > 0 && dissonantCount >= recentEntries.rows.length / 2) {
          moodStatus = 'Dissonant / Conflicting';
          isDissonant = true;
        } else if (avgBlended > 0.5) {
          moodStatus = 'Consistently Positive';
        } else if (avgBlended < -0.5) {
          moodStatus = 'Trending Down';
        } else {
          moodStatus = 'Mixed/Fluctuating';
        }
      }
      
      patient.clinical_trend = moodStatus;
      patient.isDissonant = isDissonant;
    }
    
    res.json(patients);
  } catch (err) {
    console.error('Failed to fetch roster:', err);
    res.status(500).json({ error: 'Failed to fetch roster' });
  }
});

router.get('/patient/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Unauthorized' });

  try {
    const patientId = req.params.id;

    // 1. Fetch core user data and profile
    const userQuery = await db.query(`
      SELECT u.id, u.display_id, u.email, u.date_of_birth, p.first_name, p.last_name, p.bio
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `, [patientId]);

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientData = userQuery.rows[0];

    // 2. Fetch journal entries
    const journalQuery = await db.query(`
      SELECT id, mood_rating, mood_label, entry_text, created_at
      FROM journal_entries
      WHERE patient_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `, [patientId]);

    const entries = journalQuery.rows.map(entry => {
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

    // 3. Fetch stress scores
    const stressQuery = await db.query(`
      SELECT id, score, max_score, answers, created_at
      FROM stress_tracking
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [patientId]);

    // 4. Fetch thought records
    const thoughtRecordsQuery = await db.query(`
      SELECT id, situation, emotion, automatic_thought, rational_thought, created_at
      FROM thought_records
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [patientId]);

    // 5. Fetch screenings
    const screeningsQuery = await db.query(`
      SELECT * 
      FROM screening_results 
      WHERE patient_id = $1 
      ORDER BY created_at DESC
    `, [patientId]);

    // 6. Fetch intake data
    const intakeQuery = await db.query(`
      SELECT therapy_type, device_count, prior_therapy, partner_ids, group_member_ids, dsm_5_assessment, notes
      FROM appointments 
      WHERE patient_id = $1 AND therapist_id = $2
      ORDER BY created_at DESC LIMIT 1
    `, [patientId, req.user.id]);

    res.json({
      ...patientData,
      entries,
      stressScores: stressQuery.rows,
      thoughtRecords: thoughtRecordsQuery.rows,
      screenings: screeningsQuery.rows,
      intakeData: intakeQuery.rows.length > 0 ? intakeQuery.rows[0] : null
    });

  } catch (err) {
    console.error('Failed to fetch patient data:', err);
    res.status(500).json({ error: 'Failed to fetch patient data' });
  }
});

router.post('/patient/:id/reveal-contact', authenticate, async (req, res) => {
  if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Unauthorized' });

  const patientId = req.params.id;
  
  try {
    // Log the event
    await db.query(`
      INSERT INTO audit_contact_views (therapist_id, patient_id) 
      VALUES ($1, $2)
    `, [req.user.id, patientId]);

    // Fetch the phone number
    const result = await db.query(`
      SELECT phone_number FROM users WHERE id = $1
    `, [patientId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ phone_number: result.rows[0].phone_number });
  } catch (err) {
    console.error('Failed to reveal contact:', err);
    res.status(500).json({ error: 'Failed to reveal contact' });
  }
});

// Therapist Profile Endpoints
router.get('/profile', authenticate, async (req, res) => {
  if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Unauthorized' });
  
  try {
    const result = await db.query(`
      SELECT u.id, u.phone_number, u.role, u.email, u.display_id,
             p.first_name, p.last_name,
             tp.specialization, tp.license_number, tp.bio, tp.profile_picture, tp.hourly_rate, tp.availability, tp.title
      FROM users u 
      LEFT JOIN profiles p ON u.id = p.user_id 
      LEFT JOIN therapist_profiles tp ON u.id = tp.user_id
      WHERE u.id = $1
    `, [req.user.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: 'Server error' }); 
  }
});

router.put('/profile', authenticate, async (req, res) => {
  if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Unauthorized' });

  const { first_name, last_name, email, specialization, license_number, bio, hourly_rate, title } = req.body;
  const rate = hourly_rate ? parseFloat(hourly_rate) : null;
  
  try {
    await db.query('BEGIN');
    
    await db.query('UPDATE users SET email = $1 WHERE id = $2', [email, req.user.id]);
    
    // Profiles UPSERT
    await db.query('ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);').catch(() => console.log('Constraint exists'));
    await db.query(`
      INSERT INTO profiles (user_id, first_name, last_name) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        first_name = EXCLUDED.first_name, 
        last_name = EXCLUDED.last_name
    `, [req.user.id, first_name, last_name]);
    
    // Therapist Profiles UPSERT
    const existingTherapist = await db.query('SELECT id FROM therapist_profiles WHERE user_id = $1', [req.user.id]);
    if (existingTherapist.rows.length > 0) {
      await db.query(`
        UPDATE therapist_profiles SET specialization = $1, license_number = $2, bio = $3, hourly_rate = $4, title = $5
        WHERE user_id = $6
      `, [specialization, license_number, bio, rate, title, req.user.id]);
    } else {
      await db.query(`
        INSERT INTO therapist_profiles (user_id, specialization, license_number, bio, hourly_rate, title)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [req.user.id, specialization, license_number, bio, rate, title]);
    }
    
    await db.query('COMMIT');
    
    const result = await db.query(`
      SELECT u.id, u.phone_number, u.role, u.email, u.display_id,
             p.first_name, p.last_name,
             tp.specialization, tp.license_number, tp.bio, tp.profile_picture, tp.hourly_rate, tp.availability, tp.title
      FROM users u 
      LEFT JOIN profiles p ON u.id = p.user_id 
      LEFT JOIN therapist_profiles tp ON u.id = tp.user_id
      WHERE u.id = $1
    `, [req.user.id]);
    
    res.json({ message: 'Profile updated', user: result.rows[0] });
  } catch (error) { 
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' }); 
  }
});

router.post('/profile/upload', authenticate, upload.single('profile_picture'), async (req, res) => {
  if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Unauthorized' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  try {
    const filePath = `/uploads/${req.file.filename}`;
    
    const oldPicRes = await db.query('SELECT profile_picture FROM therapist_profiles WHERE user_id = $1', [req.user.id]);
    const oldPic = oldPicRes.rows[0]?.profile_picture;
    
    if (oldPic) {
      const oldPath = path.join(__dirname, '..', oldPic);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    const existing = await db.query('SELECT id FROM therapist_profiles WHERE user_id = $1', [req.user.id]);
    if (existing.rows.length > 0) {
      await db.query('UPDATE therapist_profiles SET profile_picture = $1 WHERE user_id = $2', [filePath, req.user.id]);
    } else {
      await db.query('INSERT INTO therapist_profiles (user_id, profile_picture) VALUES ($1, $2)', [req.user.id, filePath]);
    }
    
    const result = await db.query(`
      SELECT u.id, u.phone_number, u.role, u.email, u.display_id,
             p.first_name, p.last_name,
             tp.specialization, tp.license_number, tp.bio, tp.profile_picture, tp.hourly_rate, tp.availability, tp.title
      FROM users u 
      LEFT JOIN profiles p ON u.id = p.user_id 
      LEFT JOIN therapist_profiles tp ON u.id = tp.user_id
      WHERE u.id = $1
    `, [req.user.id]);
    
    res.json({ message: 'Profile picture updated', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
