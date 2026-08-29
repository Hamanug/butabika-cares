const db = require('../db');
async function fix() {
  await db.query(`UPDATE appointments SET private_notes = notes WHERE private_notes IS NULL AND notes IS NOT NULL;`);
  await db.query(`ALTER TABLE appointments DROP COLUMN IF EXISTS notes;`);
  console.log('Fixed');
  process.exit(0);
}
fix();
