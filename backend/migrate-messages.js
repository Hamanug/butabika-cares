const db = require('./db');

async function migrate() {
  try {
    await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          sender_id INT REFERENCES users(id) ON DELETE CASCADE,
          receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Messages table created');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrate();
