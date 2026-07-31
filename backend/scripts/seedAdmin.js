const bcrypt = require('bcrypt');
const db = require('../db');

async function seedAdmin() {
  try {
    console.log('Seeding Master Admin...');
    
    const email = 'humphrey@butabikacares.com';
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    
    // 1. Insert into pre_approved_admins
    await db.query(`
      INSERT INTO pre_approved_admins (email) 
      VALUES ($1) 
      ON CONFLICT (email) DO NOTHING;
    `, [email]);
    console.log('Inserted into pre_approved_admins');

    // 2. Insert strictly into the flattened users table
    const userRes = await db.query(`
      INSERT INTO users (email, first_name, last_name, role, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET 
        first_name = $2, 
        last_name = $3, 
        role = $4, 
        password_hash = $5
      RETURNING id;
    `, [email, 'Kanyenya', 'Humphrey', 'admin', passwordHash]);
    
    const userId = userRes.rows[0].id;
    console.log(`User inserted/updated with ID: ${userId}`);

    // 3. Sync the user_roles table for secondary checks
    await db.query(`
      INSERT INTO user_roles (user_id, role_name)
      VALUES ($1, $2)
    `, [userId, 'admin']);
    console.log('Linked admin role in user_roles');

    console.log('✅ Admin seeding completed securely and schema-accurately!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
