const db = require('./db');
async function test() {
  try {
    const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log(res.rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
