require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../db');
const crypto = require('crypto');

// Generates a unique 8-digit display ID (e.g., "4921-8832")
async function generateUniqueDisplayId(db) {
  let isUnique = false;
  let displayId = '';

  while (!isUnique) {
    // Generate a secure random number between 10000000 and 99999999
    const num = crypto.randomInt(10000000, 100000000).toString();
    // Format with a hyphen for readability
    displayId = `${num.slice(0, 4)}-${num.slice(4)}`;

    // Check PostgreSQL to ensure no collision exists
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

async function migrateLegacyIds() {
  try {
    console.log('Starting migration for legacy display_ids...');
    const result = await db.query("SELECT id, display_id FROM users WHERE role = 'patient'");
    
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;

    for (const row of result.rows) {
      const displayId = row.display_id || '';
      // Check if legacy ID: contains letters or doesn't match XXXX-XXXX
      const isLegacy = /[a-zA-Z]/.test(displayId) || !/^\\d{4}-\\d{4}$/.test(displayId);
      
      if (isLegacy) {
        try {
          const newDisplayId = await generateUniqueDisplayId(db);
          await db.query('UPDATE users SET display_id = $1 WHERE id = $2', [newDisplayId, row.id]);
          successCount++;
        } catch (err) {
          console.error(`Failed to update user ${row.id}:`, err);
          failureCount++;
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log(`Migration Complete!`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failureCount}`);
    console.log(`Skipped: ${skippedCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrateLegacyIds();
