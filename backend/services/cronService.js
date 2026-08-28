const cron = require('node-cron');
const db = require('../db');
const { sendGenericSMS } = require('./smsService');

// Job 1: Runs every minute to handle 24h, 1h, and 5m no-show SMS alerts
cron.schedule('* * * * *', async () => {
  try {
    // 1. Fetch upcoming appointments with patient and therapist phone numbers
    const upcoming = await db.query(`
      SELECT 
        a.id, a.reminder_status, a.alert_5m_sent, a.patient_joined_at, a.therapist_joined_at,
        (a.appointment_date + a.appointment_time::time) as scheduled_start,
        p.phone_number as patient_phone, 
        t.phone_number as therapist_phone
      FROM appointments a
      LEFT JOIN users p ON a.patient_id = p.id
      LEFT JOIN users t ON a.therapist_id = t.id
      WHERE a.status IN ('scheduled', 'accepted')
    `);

    const now = new Date();

    for (let appt of upcoming.rows) {
      if (!appt.scheduled_start) continue;
      
      const sessionStart = new Date(appt.scheduled_start);
      const diffMins = Math.floor((sessionStart - now) / 60000);

      // --- 24-HOUR REMINDER ---
      if (diffMins <= 1440 && diffMins > 1438 && appt.reminder_status !== '24h' && appt.reminder_status !== 'both') {
        const msg = `Reminder: Your teletherapy session is exactly 24 hours away. Please log in on time.`;
        if (appt.patient_phone) await sendGenericSMS(appt.patient_phone, msg);
        if (appt.therapist_phone) await sendGenericSMS(appt.therapist_phone, msg);
        
        const newStatus = appt.reminder_status === '1h' ? 'both' : '24h';
        await db.query(`UPDATE appointments SET reminder_status = $1 WHERE id = $2`, [newStatus, appt.id]);
      }
      
      // --- 1-HOUR REMINDER ---
      if (diffMins <= 60 && diffMins > 58 && appt.reminder_status !== '1h' && appt.reminder_status !== 'both') {
        const msg = `Alert: Your teletherapy session starts in 1 hour. Get your environment ready.`;
        if (appt.patient_phone) await sendGenericSMS(appt.patient_phone, msg);
        if (appt.therapist_phone) await sendGenericSMS(appt.therapist_phone, msg);
        
        const newStatus = appt.reminder_status === '24h' ? 'both' : '1h';
        await db.query(`UPDATE appointments SET reminder_status = $1 WHERE id = $2`, [newStatus, appt.id]);
      }

      // --- 5-MINUTE NO-SHOW ALERT ---
      // Triggers if it's 5+ minutes PAST the start time, session isn't active, one person is waiting, and alert hasn't sent
      if (diffMins <= -5 && !appt.alert_5m_sent) {
        const patientWaiting = appt.patient_joined_at && !appt.therapist_joined_at;
        const therapistWaiting = appt.therapist_joined_at && !appt.patient_joined_at;

        if (patientWaiting) {
          if (appt.therapist_phone && appt.therapist_phone.trim().length >= 9) {
            await sendGenericSMS(appt.therapist_phone, `Urgent: Your patient has joined the session room and is waiting for you.`);
          } else {
            console.warn(`Skipping SMS: No valid phone number for therapist on appointment ${appt.id}`);
          }
          await db.query(`UPDATE appointments SET alert_5m_sent = TRUE WHERE id = $1`, [appt.id]);
        } 
        else if (therapistWaiting) {
          if (appt.patient_phone && appt.patient_phone.trim().length >= 9) {
            await sendGenericSMS(appt.patient_phone, `Urgent: Your therapist has started the session and is waiting for you in the room.`);
          } else {
            console.warn(`Skipping SMS: No valid phone number for patient on appointment ${appt.id}`);
          }
          await db.query(`UPDATE appointments SET alert_5m_sent = TRUE WHERE id = $1`, [appt.id]);
        }
      }
    }

    // --- SAFETY NET: AUTO-CLOSE ABANDONED SESSIONS ---
    const abandonedRes = await db.query(`
      UPDATE appointments 
      SET status = 'completed', 
          ended_at = last_ping_at 
      WHERE status = 'scheduled' 
        AND started_at IS NOT NULL 
        AND last_ping_at < NOW() - INTERVAL '6 minutes'
    `);
    if (abandonedRes.rowCount > 0) {
      console.log('Auto-closed', abandonedRes.rowCount, 'abandoned sessions');
    }

    // --- SWEEPER: EXPIRE 1-HOUR NO-SHOWS ---
    const expiredRes = await db.query(`
      UPDATE appointments 
      SET status = 'expired', 
          notes = CASE 
            WHEN therapist_joined_at IS NOT NULL AND patient_joined_at IS NULL THEN 'System Auto-Log: Session expired. Patient no-show; Therapist was present.'
            WHEN patient_joined_at IS NOT NULL AND therapist_joined_at IS NULL THEN 'System Auto-Log: Session expired. Therapist no-show; Patient was present.'
            ELSE 'System Auto-Log: Session expired. Neither party joined the room.'
          END
      WHERE status IN ('scheduled', 'accepted') 
        AND (appointment_date + appointment_time::time) < (NOW() - INTERVAL '1 hour')
    `);
    
    if (expiredRes.rowCount > 0) {
      console.log('Auto-expired', expiredRes.rowCount, 'sessions that passed the 1-hour mark.');
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
