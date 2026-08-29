const cron = require('node-cron');
const axios = require('axios');
const db = require('../db');
const { sendOTP } = require('./smsService');

const IT_ADMIN_PHONE = process.env.IT_ADMIN_PHONE || '256700000000'; // Default placeholder

async function checkHealth() {
  let dbFailed = false;
  let smsEmpty = false;
  let errors = [];

  // Check DB
  try {
    const res = await db.query('SELECT 1 AS ok');
    if (res.rows[0].ok !== 1) {
      dbFailed = true;
      errors.push('DB returned unexpected result.');
    }
  } catch (err) {
    dbFailed = true;
    errors.push(`DB Error: ${err.message}`);
  }

  // Check SMS Balance
  try {
    const payload = {
      method: "GetBalance",
      userdata: {
        username: process.env.EGOSMS_USERNAME,
        password: process.env.EGOSMS_PASSWORD
      }
    };
    const response = await axios.post('https://www.egosms.co/api/v1/json/', payload);
    const balance = parseFloat(response.data?.Balance || 0);
    if (balance <= 0) {
      smsEmpty = true;
      errors.push('EgoSMS balance is 0 or less.');
    }
  } catch (err) {
    smsEmpty = true;
    errors.push(`SMS API Error: ${err.message}`);
  }

  if (dbFailed || smsEmpty) {
    console.error('CRITICAL HEALTH CHECK FAILED:', errors);
    
    // Attempt to log to system_logs if DB is not entirely dead
    if (!dbFailed) {
      try {
        await db.query('INSERT INTO system_logs (level, message) VALUES ($1, $2)', ['CRITICAL', `Health Check Failed: ${errors.join(' | ')}`]);
      } catch (e) {
        console.error('Failed to write to system_logs:', e);
      }
    }

    // Try to send an SMS via standard EgoSMS payload directly
    try {
      const payload = {
        method: "SendSMS",
        userdata: {
          username: process.env.EGOSMS_USERNAME,
          password: process.env.EGOSMS_PASSWORD
        },
        msgdata: [{
          number: IT_ADMIN_PHONE,
          message: `URGENT (Butabika Cares): System health check failed. Issues: ${errors.join(', ')}`
        }]
      };
      await axios.post('https://www.egosms.co/api/v1/json/', payload);
      console.log('Fired critical alert SMS to IT Admin.');
    } catch (err) {
      console.error('Failed to send critical alert SMS:', err);
    }
  } else {
    console.log('System health check passed.');
  }
}

// Run every 24 hours (at midnight)
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled health check...');
  checkHealth();
});

// Also hook into unhandled exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception detected:', error);
  
  // Try to write to system_logs
  try {
    await db.query('INSERT INTO system_logs (level, message) VALUES ($1, $2)', ['FATAL', `Uncaught Exception: ${error.message}`]);
  } catch (e) {}

  // Run full health check which might trigger SMS
  await checkHealth();
  
  // Exit appropriately
  process.exit(1);
});

module.exports = { checkHealth };
