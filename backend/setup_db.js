const mysql = require('mysql2/promise');
const fs = require('fs');

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');
    
    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    // Read and execute the setup script
    const sqlScript = fs.readFileSync('./database/setup_database.sql', 'utf8');
    
    // Split script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    
    console.log('✅ Database setup completed successfully!');
    
    // Verify tables were created
    await connection.query('USE museosmart');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📋 Created tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  }
}

setupDatabase();
