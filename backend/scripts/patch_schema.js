const db = require('../db');

(async () => {
  try {
    await db.query('ALTER TABLE therapist_profiles ADD COLUMN IF NOT EXISTS title VARCHAR(50);');
    await db.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS alert_5m_sent BOOLEAN DEFAULT FALSE;');
    await db.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS last_ping_at TIMESTAMP;');
    await db.query("ALTER DATABASE butabika SET timezone TO 'Africa/Kampala';");
    await db.query("CREATE UNIQUE INDEX IF NOT EXISTS enforce_single_active_session ON appointments (patient_id) WHERE status IN ('pending', 'scheduled', 'accepted');");
    console.log('Schema patched successfully');
  } catch (error) {
    console.error('Error patching schema:', error);
  } finally {
    process.exit(0);
  }
})();
