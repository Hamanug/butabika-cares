const db = require('../db');

async function migrate() {
  try {
    console.log('Creating screening_results table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS screening_results (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
          screening_type VARCHAR(50) NOT NULL,
          score NUMERIC NOT NULL,
          answers JSONB,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ screening_results table created.');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
