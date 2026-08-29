require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function runAuditMigration() {
  try {
    console.log("Setting up audit_contact_views table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_contact_views (
        id SERIAL PRIMARY KEY,
        therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
        patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Migration successful.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await db.end();
  }
}

runAuditMigration();
