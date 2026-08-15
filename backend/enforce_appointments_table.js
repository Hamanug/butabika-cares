const db = require('./db');

async function createTable() {
  console.log('Ensuring appointments table exists...');
  try {
    await db.query(`
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

      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_joined_at TIMESTAMP;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS therapist_joined_at TIMESTAMP;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS alert_5m_sent BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ appointments table verified/created with presence tracking columns.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Failed to create table:', e);
    process.exit(1);
  }
}

createTable();
