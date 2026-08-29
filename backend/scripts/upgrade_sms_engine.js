require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../db');

async function runMigration() {
  try {
    console.log('Connecting to database...');
    
    // Add sms_notified to messages
    await db.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS sms_notified BOOLEAN DEFAULT FALSE;`);
    console.log('✅ Added sms_notified to messages table');

    // Check if reminders_sent exists
    const checkCol = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' AND column_name = 'reminders_sent';
    `);

    if (checkCol.rows.length === 0) {
      await db.query(`ALTER TABLE appointments ADD COLUMN reminders_sent JSONB DEFAULT '{}'::jsonb;`);
      console.log('✅ Added reminders_sent to appointments table');
    } else {
      console.log('✅ reminders_sent already exists, skipping addition.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

runMigration();
