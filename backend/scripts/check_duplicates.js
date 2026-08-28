const db = require('../db'); 
     
async function checkDuplicates() {
  try {
    console.log('--- DB TRUTH LOG ---');
    const userRes = await db.query("SELECT id, display_id FROM users WHERE display_id = '1049-0626'");
    
    if (userRes.rows.length > 0) {
      const userId = userRes.rows[0].id;
      console.log(`Found User UUID: ${userId}`);
      
      const profRes = await db.query("SELECT id, first_name, last_name FROM profiles WHERE user_id = $1", [userId]);
      console.log("PROFILES TABLE ROWS FOR THIS USER:");
      console.table(profRes.rows);
    } else {
      console.log("User not found.");
    }
  } catch (err) {
    console.error('Database Error:', err.message);
  }
  process.exit();
}
checkDuplicates();
