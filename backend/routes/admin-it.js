const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../db'); // Adjust path as necessary

// GET /api/admin/system/logs (Aggregates security & audit logs)
router.get('/logs', async (req, res) => {
  try {
    const securityQuery = await db.query(`SELECT id, created_at as timestamp, event_type as event, user_identifier as details, ip_address as ip, 'high' as severity FROM security_logs ORDER BY created_at DESC LIMIT 25`);
    const auditQuery = await db.query(`SELECT id, created_at as timestamp, 'AUDIT_PHONE_REVEAL' as event, 'Therapist: ' || therapist_id || ' Patient: ' || patient_id || ' Reason: ' || reason as details, 'N/A' as ip, 'warning' as severity FROM audit_phone_reveals ORDER BY created_at DESC LIMIT 25`);
    
    // Merge and sort descending
    const logs = [...securityQuery.rows, ...auditQuery.rows].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET /api/admin/system/staff (For the provisioning table)
router.get('/staff', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.email, u.role, u.requires_password_change, 
      COALESCE(p.first_name || ' ' || p.last_name, 'Pending Profile') as name 
      FROM users u LEFT JOIN profiles p ON u.id = p.user_id 
      WHERE u.role IN ('therapist', 'clinical_admin', 'admin')
    `);
    res.json({ staff: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// POST /api/admin/system/provision/:id
router.post('/provision/:id', async (req, res) => {
  try {
    const tempPassword = crypto.randomBytes(6).toString('hex'); // 12 char secure temp pass
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);
    
    await db.query(`UPDATE users SET password_hash = $1, requires_password_change = TRUE WHERE id = $2`, [hashedPassword, req.params.id]);
    
    res.json({ success: true, tempPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Provisioning failed' });
  }
});


// In-memory state for initial testing
let systemSwitches = {
  intakeOpen: true,
  smsRouting: true,
  maintenanceMode: false
};

// GET /api/admin/system/sms-balance
router.get('/sms-balance', (req, res) => {
  // Stubbed EgoSMS response
  res.json({ balance: 12500 });
});

// GET /api/admin/system/switches
router.get('/switches', (req, res) => {
  res.json({ switches: systemSwitches });
});

// PUT /api/admin/system/switches
router.put('/switches', (req, res) => {
  const { switchKey, state } = req.body;
  if (systemSwitches.hasOwnProperty(switchKey)) {
    systemSwitches[switchKey] = state;
    res.json({ success: true, switches: systemSwitches });
  } else {
    res.status(400).json({ error: 'Invalid switch key' });
  }
});

module.exports = router;
