const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'museosmart',
  multipleStatements: true
};

async function runChatAvailabilityMigration() {
  let connection;
  
  try {
    console.log('🔄 Creating chat availability settings table...');
    
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database', 'create_chat_availability_settings.sql');
    const migrationSQL = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 Executing SQL migration...');
    
    // Split SQL into statements and execute
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.toUpperCase().startsWith('USE'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await connection.execute(statement);
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS' || error.code === 'ER_DUP_ENTRY') {
            console.log(`   ⚠️  Statement ${i + 1}: Table already exists or entry exists (skipping)`);
          } else {
            console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('✅ Chat availability settings table created successfully!');
    
    // Verify table was created
    const [tables] = await connection.query("SHOW TABLES LIKE 'chat_availability_settings'");
    if (tables.length > 0) {
      console.log('✅ Table verification: chat_availability_settings exists');
      
      // Check if default settings exist
      const [settings] = await connection.query('SELECT * FROM chat_availability_settings');
      if (settings.length > 0) {
        console.log('✅ Default settings inserted:', settings[0]);
      }
    }
    
    await connection.end();
    console.log('\n🎉 Migration completed successfully!');
    console.log('📋 You can now customize staff availability hours in the Chatbox section.');
    
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

runChatAvailabilityMigration();

