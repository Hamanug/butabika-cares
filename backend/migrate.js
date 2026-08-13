const db = require('./db');

async function migrate() {
  try {
    console.log('Running migration...');
    // Add columns to profiles
    await db.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT`);
    await db.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation VARCHAR(255)`);
    await db.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255)`);
    
    // Add columns to therapist_profiles
    await db.query(`ALTER TABLE therapist_profiles ADD COLUMN IF NOT EXISTS bio TEXT`);
    await db.query(`ALTER TABLE therapist_profiles ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255)`);
    await db.query(`ALTER TABLE therapist_profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2)`);
    await db.query(`ALTER TABLE therapist_profiles ADD COLUMN IF NOT EXISTS availability JSONB`);
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}
migrate();
