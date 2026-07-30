const db = require('./db');

async function runMigration() {
  console.log('⏳ Starting forced database migration...');
  try {
    // 1. Ensure profile columns exist on users (failsafe)
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS occupation VARCHAR(100),
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS profile_picture TEXT;
    `);
    console.log('✅ Users table profile columns verified.');

    // 2. Create the appointments table
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
    console.log('✅ Appointments table successfully created!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MIGRATION FAILED. Read this error:', error);
    process.exit(1);
  }
}

runMigration();
