const { Client } = require('pg');

let bcrypt;
try {
    bcrypt = require('bcrypt');
} catch (e) {
    bcrypt = require('bcryptjs');
}

async function seedAdmins() {
    const plainTextPassword = "stevkell12@gmail.com kyakyo115@gmail.com";

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'butabika',
        password: 'butabika2026',
        port: 5432,
    });

    try {
        await client.connect();
        console.log("Connected to database. Inserting admin accounts...");

        const query = `
            INSERT INTO users (email, password_hash, role)
            VALUES
            ('stevkell12@gmail.com', $1, 'admin'),
            ('kyakyo115@gmail.com', $1, 'admin')
            ON CONFLICT (email) DO NOTHING;
        `;

        await client.query(query, [hashedPassword]);
        console.log("Success! Admin accounts have been seeded.");

    } catch (error) {
        console.error("Database Error:", error.message);
    } finally {
        await client.end();
    }
}

seedAdmins();
