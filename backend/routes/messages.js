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

// GET /api/messages/unread-count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT count(*) FROM messages 
      WHERE recipient_id = $1 AND is_read = false
    `, [req.user.id]);
    const unreadCount = parseInt(result.rows[0].count, 10);
    res.json({ count: unreadCount });
  } catch (err) {
    console.error('Failed to fetch unread count:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// GET Contact List (Enforces Initiation Rules)
router.get('/contacts', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query = '';
    let params = [];

    if (role === 'patient') {
      // Patients only see therapists they have an existing message history with
      query = `
        SELECT DISTINCT u.id, p.first_name, p.last_name, u.display_id, tp.specialization as specialty, tp.profile_picture,
        (SELECT COUNT(*) FROM messages m2 WHERE m2.sender_id = u.id AND m2.recipient_id = $1 AND m2.is_read = FALSE)::int as unread_count
        FROM messages m
        JOIN users u ON (m.sender_id = u.id OR m.recipient_id = u.id)
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN therapist_profiles tp ON u.id = tp.user_id
        WHERE (m.recipient_id = $1 OR m.sender_id = $1) AND u.id != $1 AND u.role = 'therapist'
        ORDER BY p.first_name ASC
      `;
      params = [userId];
    } else if (role === 'therapist') {
      // Therapists see patients with active message history.
      // COALESCE ensures anonymous patients render safely as "Patient [DisplayID]".
      query = `
        SELECT DISTINCT u.id, 
        COALESCE(p.first_name, 'Patient') AS first_name, 
        COALESCE(p.last_name, u.display_id) AS last_name, 
        u.display_id,
        (SELECT COUNT(*) FROM messages m2 WHERE m2.sender_id = u.id AND m2.recipient_id = $1 AND m2.is_read = FALSE)::int as unread_count
        FROM messages m
        JOIN users u ON (m.sender_id = u.id OR m.recipient_id = u.id)
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE (m.recipient_id = $1 OR m.sender_id = $1) AND u.id != $1
      `;
      params = [userId];
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// GET chat history with a specific user
router.get('/:otherUserId', authenticate, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    const result = await db.query(`
      SELECT id, sender_id, recipient_id AS receiver_id, content, is_read, created_at FROM messages 
      WHERE (sender_id = $1 AND recipient_id = $2) 
         OR (sender_id = $2 AND recipient_id = $1)
      ORDER BY created_at ASC
    `, [currentUserId, otherUserId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST a new message
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    const result = await db.query(`
      INSERT INTO messages (sender_id, recipient_id, content) 
      VALUES ($1, $2, $3) RETURNING id, sender_id, recipient_id AS receiver_id, content, is_read, created_at
    `, [sender_id, receiver_id, content]);

    const newMessage = result.rows[0];
    const io = req.app.get('io');

    // If the receiver is online, emit the message directly to them
    const receiverSocketId = global.onlineUsers.get(parseInt(receiver_id, 10));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', newMessage);
    }

    res.json(newMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// PUT mark messages as read
router.put('/mark-read/:contactId', authenticate, async (req, res) => {
  try {
    const { contactId } = req.params;
    const currentUserId = req.user.id;
    
    await db.query(`
      UPDATE messages 
      SET is_read = true 
      WHERE sender_id = $1 AND recipient_id = $2 AND is_read = false
    `, [contactId, currentUserId]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;
