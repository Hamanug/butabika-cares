require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../db');

async function listTherapists() {
  try {
    const result = await db.query(`
      SELECT * 
      FROM users 
      WHERE role = 'therapist' 
      LIMIT 5;
    `);

    console.log('\n--- Therapist List ---');
    result.rows.forEach(row => {
      console.log(JSON.stringify(row, null, 2));
    });
    console.log('----------------------\n');
  } catch (error) {
    console.error('Error fetching therapists:', error);
  } finally {
    process.exit(0);
  }
}

listTherapists();
