const crypto = require('crypto');
const db = require('../db');

async function generateUniqueDisplayId(db) {
  let isUnique = false;
  let displayId = '';

  while (!isUnique) {
    const num = crypto.randomInt(10000000, 100000000).toString();
    displayId = `${num.slice(0, 4)}-${num.slice(4)}`;

    const result = await db.query(
      'SELECT id FROM users WHERE display_id = $1', 
      [displayId]
    );

    if (result.rows.length === 0) {
      isUnique = true;
    }
  }
  return displayId;
}

async function forceMigrate() {
  try {
    const legacyUsers = await db.query(`
      SELECT id, display_id 
      FROM users 
      WHERE role = 'patient' 
      AND display_id !~ '^\\d{4}-\\d{4}$'
    `);
    
    console.log(`Found ${legacyUsers.rows.length} users with legacy IDs.`);
    
    for (const user of legacyUsers.rows) {
      const newPin = await generateUniqueDisplayId(db);
      await db.query('UPDATE users SET display_id = $1 WHERE id = $2', [newPin, user.id]);
      console.log(`Updated user ${user.id}: legacy ID '${user.display_id}' -> new PIN '${newPin}'`);
    }
    
    console.log('Force migration complete.');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    process.exit(0);
  }
}

forceMigrate();
