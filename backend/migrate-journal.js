const db = require('./db');

async function migrate() {
    try {
        await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await db.query(`
            CREATE TABLE IF NOT EXISTS journal_entries (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
                mood_rating INT CHECK (mood_rating BETWEEN 1 AND 5),
                mood_label VARCHAR(50),
                entry_text TEXT NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Migration successful');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        process.exit(0);
    }
}

migrate();
