const cron = require('node-cron');
const db = require('../db');

// Job 1: Runs every minute to check for sessions exactly 24h or 1h away
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    // Get all scheduled appointments
    const appointments = await db.query(`
      SELECT * FROM appointments 
      WHERE status = 'scheduled' AND reminder_status != 'both'
    `);

    for (let appt of appointments.rows) {
      if (!appt.appointment_date || !appt.appointment_time) continue;
      
      const [timeStr, modifier] = appt.appointment_time.split(' ');
      let [hours, minutes] = timeStr.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      
      const sessionDateStr = appt.appointment_date.toLocaleDateString('en-CA', { timeZone: 'Africa/Kampala' });
      const sessionStart = new Date(`${sessionDateStr}T${hours.toString().padStart(2, '0')}:${minutes}:00`);
      
      const diffMins = Math.floor((sessionStart - now) / 60000);
      
      // 24 hours = 1440 mins. Check if between 23.9 and 24 hours (roughly exactly 24h away)
      if (diffMins <= 1440 && diffMins > 1438 && appt.reminder_status !== '24h' && appt.reminder_status !== 'both') {
        console.log(`[SMS STUB] Reminder: Session ${appt.id} is 24 hours away!`);
        const newStatus = appt.reminder_status === '1h' ? 'both' : '24h';
        await db.query(`UPDATE appointments SET reminder_status = $1 WHERE id = $2`, [newStatus, appt.id]);
      }
      
      // 1 hour = 60 mins. Check if between 59 and 60 mins away
      if (diffMins <= 60 && diffMins > 58 && appt.reminder_status !== '1h' && appt.reminder_status !== 'both') {
        console.log(`[SMS STUB] Reminder: Session ${appt.id} is 1 hour away!`);
        const newStatus = appt.reminder_status === '24h' ? 'both' : '1h';
        await db.query(`UPDATE appointments SET reminder_status = $1 WHERE id = $2`, [newStatus, appt.id]);
      }
    }
  } catch (error) {
    console.error('Cron Error (Appointments):', error);
  }
});

// Job 2: Runs every 30 minutes to query unread messages older than 15 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    const result = await db.query(`
      SELECT recipient_id, COUNT(*) as unread_count 
      FROM messages 
      WHERE is_read = FALSE 
      AND created_at < NOW() - INTERVAL '15 minutes'
      GROUP BY recipient_id
    `);

    for (let row of result.rows) {
      console.log(`[SMS STUB] Recipient ${row.recipient_id} has ${row.unread_count} unread messages older than 15 minutes.`);
    }
  } catch (error) {
    console.error('Cron Error (Messages):', error);
  }
});

console.log('Cron services initialized.');
