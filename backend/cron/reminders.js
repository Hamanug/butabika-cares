const cron = require('node-cron');
const db = require('../db');
const { sendGenericSMS } = require('../services/smsService');

// Runs every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const appointments = await db.query(`
      SELECT a.*, p.phone_number as patient_phone, p.first_name as patient_name, 
             t.first_name as doc_name, t.phone_number as doc_phone
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      LEFT JOIN users t ON a.therapist_id = t.id
      WHERE a.status = 'scheduled'
    `);

    for (let appt of appointments.rows) {
      // Parse session time
      const [timeStr, modifier] = appt.appointment_time.split(' ');
      let [hours, minutes] = timeStr.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      
      const sessionStart = new Date(`${appt.appointment_date.toISOString().split('T')[0]}T${hours.toString().padStart(2, '0')}:${minutes}:00`);
      const diffMins = Math.floor((sessionStart - now) / 60000);
      let reminders = appt.reminders_sent || [];
      let alertTriggered = null;

      // Check thresholds
      if (diffMins <= 720 && diffMins > 120 && !reminders.includes('12h')) alertTriggered = '12h';
      else if (diffMins <= 120 && diffMins > 30 && !reminders.includes('2h')) alertTriggered = '2h';
      else if (diffMins <= 30 && diffMins > 10 && !reminders.includes('30m')) alertTriggered = '30m';
      else if (diffMins <= 10 && diffMins >= 0 && !reminders.includes('10m')) alertTriggered = '10m';

      if (alertTriggered) {
        const msg = `Butabika Cares: Reminder, your session starts in ${alertTriggered.replace('h', ' hours').replace('m', ' minutes')}. Log in to prepare.`;
        if (appt.patient_phone) await sendGenericSMS(appt.patient_phone, msg);
        if (appt.doc_phone) await sendGenericSMS(appt.doc_phone, msg);
        
        reminders.push(alertTriggered);
        await db.query(`UPDATE appointments SET reminders_sent = $1 WHERE id = $2`, [JSON.stringify(reminders), appt.id]);
      }

      // Flag missed sessions (60 minutes past start time)
      if (diffMins < -60) {
        await db.query(`UPDATE appointments SET status = 'missed' WHERE id = $1`, [appt.id]);
        console.log(`[SYSTEM] Session ${appt.id} marked as missed.`);
      }
    }
  } catch (error) { console.error('Cron Error:', error); }
});
