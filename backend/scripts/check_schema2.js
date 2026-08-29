const db = require('../db');
async function check() {
  const result = await db.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'appointments'
  `);
  console.log(result.rows.map(r => r.column_name));
  process.exit(0);
}
check();
