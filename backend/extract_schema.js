const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'butabika',
  password: 'admin123',
  port: 5432,
});

async function extractSchema() {
  await client.connect();
  
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  `);
  
  let schemaSql = '-- Butabika Cares Database Schema\n\n';
  schemaSql += 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n';
  
  for (let row of tablesRes.rows) {
    const tableName = row.table_name;
    const columnsRes = await client.query(`
      SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    schemaSql += `CREATE TABLE ${tableName} (\n`;
    
    const colDefs = columnsRes.rows.map(col => {
      let def = `  ${col.column_name} ${col.data_type === 'USER-DEFINED' ? 'UUID' : col.data_type === 'character varying' ? \`VARCHAR(\${col.character_maximum_length})\` : col.data_type === 'timestamp without time zone' ? 'TIMESTAMP' : col.data_type === 'time without time zone' ? 'TIME' : col.data_type}`;
      
      if (col.is_nullable === 'NO') def += ' NOT NULL';
      if (col.column_default) def += ` DEFAULT ${col.column_default}`;
      
      return def;
    });
    
    schemaSql += colDefs.join(',\n');
    schemaSql += '\n);\n\n';
  }
  
  fs.writeFileSync('db_schema.sql', schemaSql);
  console.log('Schema extracted to db_schema.sql');
  await client.end();
}

extractSchema().catch(console.error);
