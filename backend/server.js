require('dotenv').config();
process.env.TZ = 'Africa/Kampala';
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
const db = require('./db');
require('./services/cronService');

// Auto-migrate appointments table
db.query(`
  CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES users(id) ON DELETE CASCADE,
    therapist_id INT REFERENCES users(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    meeting_link TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
`).then(() => console.log('✅ Appointments table verified'))
  .catch(err => console.error('❌ Migration failed:', err));

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

// Mount auth routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/screenings', require('./routes/screenings'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/therapists', require('./routes/therapists'));


// Route: Get Current Session (Me)
app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userResult = await db.query(
      'SELECT id, email, phone_number, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: userResult.rows[0] });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Route: Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out successfully' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
