const db = require('./db');

async function migrate() {
  try {
    console.log('Starting migration...');
    await db.query(`CREATE TABLE IF NOT EXISTS pre_approved_admins (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);
    
    await db.query(`ALTER TABLE pre_approved_admins ADD COLUMN IF NOT EXISTS admin_tier VARCHAR(50) DEFAULT 'clinical_admin';`);
    await db.query(`UPDATE users SET role = 'super_admin' WHERE role = 'admin';`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE;`);
    await db.query(`CREATE TABLE IF NOT EXISTS system_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      level VARCHAR(20) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
