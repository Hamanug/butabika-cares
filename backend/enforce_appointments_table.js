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
    `);
    console.log('✅ appointments table verified/created.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Failed to create table:', e);
    process.exit(1);
  }
}

createTable();
