const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../../../../../../../Documents/butabika cares/backend/.env' });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'butabika',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function patch() {
  try {
    await pool.query(`
      ALTER TABLE appointments 
      ALTER COLUMN partner_ids TYPE TEXT[] USING partner_ids::text[],
      ALTER COLUMN group_member_ids TYPE TEXT[] USING group_member_ids::text[];
    `);
    console.log("Schema patched successfully!");
  } catch (error) {
    console.error("Patch error:", error);
  } finally {
    pool.end();
  }
}

patch();
