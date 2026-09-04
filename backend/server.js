require('dotenv').config();
process.env.TZ = 'Africa/Kampala';
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const db = require('./db');
require('./services/cronService');
require('./services/healthMonitor');

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
  ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
  CREATE TABLE IF NOT EXISTS sleep_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS stress_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL,
    max_score INT NOT NULL,
    answers JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS thought_records (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    situation TEXT NOT NULL,
    emotion TEXT NOT NULL,
    automatic_thought TEXT NOT NULL,
    rational_thought TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS mindfulness_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
`).then(() => console.log('✅ DB Schema verified (appointments, users.is_active, sleep_tracking, stress_tracking, thought_records, mindfulness_tracking)'))
  .catch(err => console.error('❌ Migration failed:', err));

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://butabikacares.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

// Mount auth routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/appointments', require('./routes/appointments'));

const authenticateToken = require('./middleware/auth');
const requireTier = require('./middleware/requireTier');
const adminItRoutes = require('./routes/admin-it');
app.use('/api/admin/system', authenticateToken, requireTier(['admin']), adminItRoutes);

app.use('/api/admin-clinical', require('./routes/admin-clinical'));
app.use('/api/screenings', require('./routes/screenings'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/therapists', require('./routes/therapists'));
app.use('/api/sleep-tracking', require('./routes/sleep'));
app.use('/api/stress-tracking', require('./routes/stress'));
app.use('/api/thought-records', require('./routes/thought_records'));
app.use('/api/mindfulness', require('./routes/mindfulness'));


// Route: Get Current Session (Me)
app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.json({ authenticated: false, user: null });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userResult = await db.query(
      `SELECT u.id, u.email, u.phone_number, u.role, u.display_id, u.gender, u.nationality, p.first_name, p.last_name 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.json({ authenticated: false, user: null });
    }

    res.json({ authenticated: true, user: userResult.rows[0] });
  } catch (error) {
    res.json({ authenticated: false, user: null });
  }
});

// Route: Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out successfully' });
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: ["http://localhost:5173", "https://butabikacares.com"], methods: ["GET", "POST"] }
});

// Map to track online users: Map<userId, socketId>
global.onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a user logs in / connects
  socket.on('register_user', (userId) => {
    global.onlineUsers.set(userId, socket.id);
    // Broadcast the updated online users list to everyone
    io.emit('online_users_update', Array.from(global.onlineUsers.keys()));
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    for (let [userId, socketId] of global.onlineUsers.entries()) {
      if (socketId === socket.id) {
        global.onlineUsers.delete(userId);
        io.emit('online_users_update', Array.from(global.onlineUsers.keys()));
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Attach io to the app so routes can use it
app.set('io', io);

// Initialize Background Daemons
const smsMonitor = require('./services/smsMonitor');
smsMonitor.start();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
