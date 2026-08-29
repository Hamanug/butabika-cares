const cron = require('node-cron');
const db = require('../db');
const { sendGenericSMS } = require('./smsService');

// Job 1: Pre-Session Reminders & Late Warning System
cron.schedule('* * * * *', async () => {
  try {
    const upcoming = await db.query(`
      SELECT 
        a.id, a.patient_joined_at, a.therapist_joined_at, a.reminders_sent,
        EXTRACT(EPOCH FROM ((a.appointment_date + a.appointment_time::time) - (NOW() AT TIME ZONE 'Africa/Nairobi'))) / 60 as mins_to_start,
        p.phone_number as patient_phone, 
        t.phone_number as therapist_phone
      FROM appointments a
      LEFT JOIN users p ON a.patient_id = p.id
      LEFT JOIN users t ON a.therapist_id = t.id
      WHERE a.status IN ('scheduled', 'accepted')
    `);

    for (let appt of upcoming.rows) {
      if (appt.mins_to_start === null) continue;
      
      const diffMins = parseFloat(appt.mins_to_start);
      let reminders = typeof appt.reminders_sent === 'object' && appt.reminders_sent !== null ? appt.reminders_sent : {};
      let updated = false;

      // 24-HOUR REMINDER
      if (diffMins <= 1440 && diffMins > 1430 && !reminders['24h']) {
        const msg = `Reminder: Your teletherapy session is exactly 24 hours away. Please log in on time.`;
        if (appt.patient_phone) await sendGenericSMS(appt.patient_phone, msg);
        if (appt.therapist_phone) await sendGenericSMS(appt.therapist_phone, msg);
        reminders['24h'] = true;
        updated = true;
      }
      
      // 1-HOUR REMINDER
      else if (diffMins <= 60 && diffMins > 50 && !reminders['1h']) {
        const msg = `Alert: Your teletherapy session starts in 1 hour. Get your environment ready.`;
        if (appt.patient_phone) await sendGenericSMS(appt.patient_phone, msg);
        if (appt.therapist_phone) await sendGenericSMS(appt.therapist_phone, msg);
        reminders['1h'] = true;
        updated = true;
      }

      // 10-MINUTE REMINDER
      else if (diffMins <= 10 && diffMins > 0 && !reminders['10m']) {
        const msg = `Alert: Your teletherapy session starts in 10 minutes. Log in now to join the room.`;
        if (appt.patient_phone) await sendGenericSMS(appt.patient_phone, msg);
        if (appt.therapist_phone) await sendGenericSMS(appt.therapist_phone, msg);
        reminders['10m'] = true;
        updated = true;
      }

      // LATE WARNING (T+10 mins)
      else if (diffMins <= -10 && diffMins > -20 && !reminders['late_warning']) {
        const patientWaiting = appt.patient_joined_at && !appt.therapist_joined_at;
        const therapistWaiting = appt.therapist_joined_at && !appt.patient_joined_at;
        const bothMissing = !appt.patient_joined_at && !appt.therapist_joined_at;

        if (patientWaiting && appt.therapist_phone) {
          await sendGenericSMS(appt.therapist_phone, `Urgent: Your patient is waiting for you in the session room.`);
        } else if (therapistWaiting && appt.patient_phone) {
          await sendGenericSMS(appt.patient_phone, `Urgent: Your therapist is waiting for you in the session room.`);
        } else if (bothMissing) {
          const bothMsg = `Alert: Your session started 10 minutes ago and will be automatically cancelled in 10 minutes if unattended.`;
          if (appt.patient_phone) await sendGenericSMS(appt.patient_phone, bothMsg);
          if (appt.therapist_phone) await sendGenericSMS(appt.therapist_phone, bothMsg);
        }
        
        reminders['late_warning'] = true;
        updated = true;
      }

      if (updated) {
        await db.query(`UPDATE appointments SET reminders_sent = $1 WHERE id = $2`, [JSON.stringify(reminders), appt.id]);
      }
    }
  } catch (error) {
    console.error('Cron Error (Job 1 - Reminders):', error);
  }
});

// Job 2: Session Expirations (20 mins past start)
cron.schedule('*/5 * * * *', async () => {
  try {
    const expiredRes = await db.query(`
      SELECT id, patient_joined_at, therapist_joined_at
      FROM appointments
      WHERE status IN ('pending', 'scheduled', 'accepted')
        AND (NOW() AT TIME ZONE 'Africa/Nairobi') > (appointment_date + appointment_time::time + INTERVAL '20 minutes')
    `);

    let expiredCount = 0;
    let missedCount = 0;

    for (let appt of expiredRes.rows) {
      if (!appt.patient_joined_at && !appt.therapist_joined_at) {
        await db.query(`UPDATE appointments SET status = 'expired' WHERE id = $1`, [appt.id]);
        expiredCount++;
      } else {
        await db.query(`UPDATE appointments SET status = 'missed' WHERE id = $1`, [appt.id]);
        missedCount++;
      }
    }

    if (expiredCount > 0 || missedCount > 0) {
      console.log(`Auto-resolved sessions: ${expiredCount} expired, ${missedCount} missed.`);
    }
  } catch (error) {
    console.error('Cron Error (Job 2 - Expirations):', error);
  }
});

// Job 3: Unread Chat Messages SMS
cron.schedule('*/30 * * * *', async () => {
  try {
    const result = await db.query(`
      SELECT recipient_id, COUNT(*) as unread_count, array_agg(id) as msg_ids
      FROM messages 
      WHERE is_read = FALSE AND sms_notified = FALSE
      AND created_at < NOW() - INTERVAL '2 hours'
      GROUP BY recipient_id
    `);

    for (let row of result.rows) {
      const userRes = await db.query(`SELECT phone_number FROM users WHERE id = $1`, [row.recipient_id]);
      const phone = userRes.rows[0]?.phone_number;
      
      if (phone) {
        const msg = `Butabika Cares: You have ${row.unread_count} unread messages. Log in to reply.`;
        await sendGenericSMS(phone, msg);
        await db.query(`UPDATE messages SET sms_notified = TRUE WHERE id = ANY($1::int[])`, [row.msg_ids]);
      }
    }
  } catch (error) {
    console.error('Cron Error (Job 3 - Messages):', error);
  }
});

console.log('Cron services initialized.');
