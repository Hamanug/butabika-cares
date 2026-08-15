const db = require('./db');

async function run() {
  try {
    const result = await db.query(`
      SELECT *
      FROM appointments 
      ORDER BY id DESC LIMIT 3;
    `);
    
    // Filter down to the requested columns (plus ended_at in case completed_at is a typo)
    const filtered = result.rows.map(r => ({
      id: r.id,
      status: r.status,
      therapist_id: r.therapist_id,
      patient_id: r.patient_id,
      appointment_date: r.appointment_date,
      appointment_time: r.appointment_time,
      patient_joined_at: r.patient_joined_at,
      therapist_joined_at: r.therapist_joined_at,
      completed_at: r.completed_at,
      ended_at: r.ended_at,
      notes: r.notes
    }));
    console.table(filtered);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
