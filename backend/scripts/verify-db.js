const db = require('../db');
async function verify() {
  const result = await db.query("SELECT display_id FROM users WHERE phone_number = '256742760000'");
  console.log(result.rows);
  process.exit(0);
}
verify();
