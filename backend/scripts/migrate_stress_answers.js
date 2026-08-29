require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../db');

async function run() {
  try {
    await db.query(`ALTER TABLE stress_tracking ADD COLUMN IF NOT EXISTS answers JSONB;`);
    console.log('✅ Added answers JSONB column to stress_tracking table');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

run();
