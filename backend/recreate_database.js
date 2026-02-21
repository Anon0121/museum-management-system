const mysql = require('mysql2/promise');
const fs = require('fs');

async function recreateDatabase() {
  try {
    console.log('🔄 Recreating entire database...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    // Drop and recreate database completely
    console.log('🗑️  Dropping existing database...');
    await connection.query('DROP DATABASE IF EXISTS museosmart');
    
    console.log('📝 Creating new database...');
    await connection.query('CREATE DATABASE museosmart');
    await connection.query('USE museosmart');
    
    // Read and execute the complete setup script
    console.log('📋 Reading setup script...');
    const sqlScript = fs.readFileSync('./database/complete_database_setup.sql', 'utf8');
    
    // Split into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔄 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.query(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} completed`);
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} failed: ${err.message}`);
        }
      }
    }
    
    // Verify the recreation
    console.log('🔍 Verifying database...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Database recreated with ${tables.length} tables:`);
    
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    console.log('🎉 Database recreation completed successfully!');
    
  } catch (error) {
    console.error('❌ Database recreation failed:', error.message);
  }
}

recreateDatabase();
