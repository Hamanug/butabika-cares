const db = require('../db'); 

async function checkSchema() {
  try {
    const result = await db.query(`
      SELECT tc.constraint_name, tc.constraint_type 
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'profiles' AND ccu.column_name = 'user_id';
    `);
    
    console.log('--- SCHEMA VERIFICATION ---');
    console.log('Constraints on profiles.user_id:');
    console.log(result.rows.length > 0 ? result.rows : 'None (Array is empty)');
    console.log('---------------------------');
  } catch (err) {
    console.error('Database Error:', err.message);
  }
  process.exit();
}
checkSchema();
