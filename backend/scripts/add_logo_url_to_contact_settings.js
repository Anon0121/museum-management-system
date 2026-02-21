const mysql = require('mysql2/promise');
require('dotenv').config();

async function addLogoUrlColumn() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'museosmart'
    });

    console.log('✅ Connected to database');

    // Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'contact_settings' AND COLUMN_NAME = 'logo_url'
    `, [process.env.DB_NAME || 'museosmart']);

    if (columns.length === 0) {
      console.log('📋 Adding logo_url column to contact_settings table...');
      await connection.query(`
        ALTER TABLE contact_settings 
        ADD COLUMN logo_url VARCHAR(500) NULL
      `);
      console.log('✅ logo_url column added successfully!');
    } else {
      console.log('✅ logo_url column already exists');
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addLogoUrlColumn();

