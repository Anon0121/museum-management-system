const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

async function setupContactSettings() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'museosmart',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read and execute SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'create_contact_settings_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📋 Creating contact settings tables...');
    await connection.query(sql);
    console.log('✅ Contact settings tables created successfully!');
    
  } catch (err) {
    console.error('❌ Error setting up contact settings:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupContactSettings();

