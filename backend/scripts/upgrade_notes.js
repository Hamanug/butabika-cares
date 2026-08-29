const db = require('../db');

async function upgradeNotes() {
  console.log('Upgrading notes schema...');
  try {
    await db.query(`
      ALTER TABLE appointments RENAME COLUMN notes TO private_notes;
      ALTER TABLE appointments ADD COLUMN shared_notes TEXT;
    `);
    console.log('✅ Successfully upgraded appointments table to dual-category notes.');
    process.exit(0);
  } catch (e) {
    if (e.code === '42703' && e.message.includes('column "notes" does not exist')) {
       console.log('⚠️ It seems the notes column was already renamed. Verifying...');
    } else if (e.code === '42701') {
       console.log('⚠️ Column shared_notes already exists.');
    } else {
       console.error('❌ Failed to upgrade schema:', e);
       process.exit(1);
    }
    process.exit(0);
  }
}

upgradeNotes();
