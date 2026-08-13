const db = require('../db');
const { nanoid } = require('nanoid');

const migrateDisplayId = async () => {
  try {
    console.log('Adding display_id column if not exists...');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS display_id VARCHAR(10) UNIQUE;');
    
    console.log('Fetching users without display_id...');
    const result = await db.query('SELECT id FROM users WHERE display_id IS NULL');
    
    if (result.rows.length === 0) {
      console.log('No users found without display_id.');
      process.exit(0);
    }
    
    console.log(`Found ${result.rows.length} users. Backfilling...`);
    for (const user of result.rows) {
      const displayId = nanoid(6);
      await db.query('UPDATE users SET display_id = $1 WHERE id = $2', [displayId, user.id]);
    }
    
    console.log('Backfill complete!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    process.exit(0);
  }
};

migrateDisplayId();
