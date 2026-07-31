const db = require('./db');

const migrate = async () => {
  try {
    // 1. Timezone Standardization (EAT)
    await db.query(`ALTER DATABASE butabika SET timezone TO 'Africa/Kampala';`);
    console.log('✅ Default timezone set to Africa/Kampala');

    // 2. Clinical Notes Schema & reminder status
    await db.query(`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS reminder_status VARCHAR(20) DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS private_notes TEXT,
      ADD COLUMN IF NOT EXISTS shared_notes TEXT;
    `);
    console.log('✅ appointments table updated with reminder_status, private_notes, shared_notes');

    // Create messages table if it doesn't exist for the cron job
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sender_id UUID REFERENCES users(id),
        recipient_id UUID REFERENCES users(id),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ messages table ensured');

    // 4. Admin Authentication Foundation
    await db.query(`
      CREATE TABLE IF NOT EXISTS pre_approved_admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL
      );
    `);
    console.log('✅ pre_approved_admins table created');

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) UNIQUE NOT NULL
      );
    `);
    console.log('✅ user_roles table created');
    
    // Add default admin role if empty
    await db.query(`
      INSERT INTO user_roles (role_name) 
      VALUES ('patient'), ('therapist'), ('admin')
      ON CONFLICT DO NOTHING;
    `);

    // Ensure users table has role column (it probably does, but let's be safe)
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'patient';
    `);

    console.log('✅ Schema migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
};

migrate();
