const cron = require('node-cron');
const axios = require('axios');
const db = require('../db');

// Runs every hour at the top of the hour
cron.schedule('0 * * * *', async () => {
  try {
    // 1. Fetch EgoSMS Balance
    const payload = {
      method: "GetBalance",
      userdata: {
        username: process.env.EGOSMS_USERNAME,
        password: process.env.EGOSMS_PASSWORD
      }
    };
    const response = await axios.post('https://www.egosms.co/api/v1/json/', payload);
    const currentBalance = parseFloat(response.data?.Balance || 0);

    // 2. Check the Database Flag
    const flagResult = await db.query("SELECT setting_value FROM platform_settings WHERE setting_key = 'sms_low_balance_10k'");
    let isFlagTriggered = false;
    
    // Fallback if the flag wasn't migrated correctly
    if (flagResult.rows.length > 0) {
      isFlagTriggered = flagResult.rows[0].setting_value === 'true' || flagResult.rows[0].setting_value === true;
    } else {
      await db.query("INSERT INTO platform_settings (setting_key, setting_value) VALUES ('sms_low_balance_10k', false)");
    }

    // 3. Logic: Trigger SMS if below 10k AND flag is false (Debounce)
    if (currentBalance < 10000 && !isFlagTriggered) {
      // Find the IT Admin's phone number
      const adminRes = await db.query("SELECT phone_number FROM users WHERE role = 'it_admin' LIMIT 1");
      if (adminRes.rows.length === 0) return; // No IT Admin to notify

      const itAdminPhone = adminRes.rows[0].phone_number;
      const eatTime = new Date().toLocaleString("en-GB", { timeZone: "Africa/Kampala", dateStyle: "short", timeStyle: "short" });
      
      const smsPayload = {
        method: "SendSMS",
        userdata: {
          username: process.env.EGOSMS_USERNAME,
          password: process.env.EGOSMS_PASSWORD
        },
        msgdata: [{
          number: itAdminPhone,
          message: `CRITICAL ALERT: Butabika Cares EgoSMS balance has dropped to UGX ${currentBalance} as of ${eatTime} EAT. Please recharge immediately to maintain OTP and Crisis services.`
        }]
      };

      // Send the SMS
      await axios.post('https://www.egosms.co/api/v1/json/', smsPayload);
      
      // Flip the flag so we don't spam them next hour
      await db.query("UPDATE platform_settings SET setting_value = true, updated_at = CURRENT_TIMESTAMP WHERE setting_key = 'sms_low_balance_10k'");
      console.log(`[SYSTEM] Low SMS balance alert sent to IT Admin at ${eatTime} EAT.`);
    }

    // 4. Logic: Reset the flag if balance is recharged above 10k
    if (currentBalance >= 10000 && isFlagTriggered) {
      await db.query("UPDATE platform_settings SET setting_value = false, updated_at = CURRENT_TIMESTAMP WHERE setting_key = 'sms_low_balance_10k'");
      console.log('[SYSTEM] EgoSMS balance recharged. Resetting low balance flag.');
    }

  } catch (error) {
    console.error('[SYSTEM ERROR] Failed to run SMS balance monitor:', error.message);
  }
});

module.exports = {
  start: () => console.log('[SYSTEM] EgoSMS Background Monitor initialized.')
};
