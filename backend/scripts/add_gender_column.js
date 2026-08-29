require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../db');

async function run() {
  try {
    await db.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT NULL;`);
    console.log('✅ Added gender column to profiles table');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

run();
