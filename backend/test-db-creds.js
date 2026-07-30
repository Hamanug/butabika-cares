const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const users = ['postgres'];
const passwords = ['postgres', 'admin', 'root', 'password', '1234', '123456', ''];

async function testCredentials() {
  for (const user of users) {
    for (const password of passwords) {
      console.log(`Testing user: "${user}" with password: "${password}"...`);
      const client = new Client({
        user,
        password,
        host: 'localhost',
        database: 'postgres',
        port: 5432,
      });

      try {
        await client.connect();
        console.log(`\nSUCCESS! Connected with user: "${user}", password: "${password}"`);
        
        // Update .env file
        const envPath = path.join(__dirname, '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(/^DB_USER=.*$/m, `DB_USER=${user}`);
        envContent = envContent.replace(/^DB_PASSWORD=.*$/m, `DB_PASSWORD=${password}`);
        fs.writeFileSync(envPath, envContent);
        
        // Try creating butabika DB if it doesn't exist
        try {
            await client.query('CREATE DATABASE butabika');
            console.log('Database "butabika" created.');
        } catch(e) {
            if (e.code === '42P04') {
               console.log('Database "butabika" already exists.');
            } else {
               console.log('Error creating "butabika" database:', e.message);
            }
        }
        
        await client.end();
        process.exit(0);
      } catch (err) {
        // failed auth, continue
      }
    }
  }
  console.log('\nFAILED. None of the tested credentials worked.');
  process.exit(1);
}

testCredentials();
