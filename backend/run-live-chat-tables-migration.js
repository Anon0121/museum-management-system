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

async function runLiveChatTablesMigration() {
  let connection;
  
  try {
    console.log('🔄 Creating live chat tables...');
    
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database', 'create_live_chat_tables.sql');
    const migrationSQL = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 Executing SQL migration...');
    
    // Execute the entire SQL file using query (supports multiple statements)
    try {
      await connection.query(migrationSQL);
      console.log('   ✅ All SQL statements executed successfully');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS' || error.code === 'ER_DUP_ENTRY') {
        console.log('   ⚠️  Some tables may already exist (continuing...)');
      } else {
        console.error('   ❌ Error executing SQL:', error.message);
        throw error;
      }
    }
    
    console.log('✅ Live chat tables created successfully!');
    
    // Verify tables were created
    const [tables] = await connection.query("SHOW TABLES LIKE 'chat_%'");
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log('\n📊 Created Tables:');
    if (tableNames.length > 0) {
      tableNames.forEach(table => {
        console.log(`   ✅ ${table}`);
      });
    } else {
      console.log('   ⚠️  No chat tables found');
    }
    
    // Also check for chat_requests and chat_messages specifically
    const [allTables] = await connection.query("SHOW TABLES");
    const allTableNames = allTables.map(t => Object.values(t)[0]);
    
    if (allTableNames.includes('chat_requests')) {
      console.log('   ✅ chat_requests table exists');
    } else {
      console.log('   ❌ chat_requests table NOT found - creating manually...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS chat_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          visitor_name VARCHAR(255) NOT NULL,
          visitor_email VARCHAR(255) NOT NULL,
          inquiry_purpose ENUM('schedule_visit', 'donation', 'event_participation', 'other') NOT NULL,
          purpose_details TEXT,
          status ENUM('pending', 'accepted', 'in_progress', 'closed', 'cancelled') DEFAULT 'pending',
          assigned_staff_id INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          accepted_at TIMESTAMP NULL,
          closed_at TIMESTAMP NULL,
          FOREIGN KEY (assigned_staff_id) REFERENCES system_user(user_ID) ON DELETE SET NULL,
          INDEX idx_status (status),
          INDEX idx_assigned_staff (assigned_staff_id),
          INDEX idx_created_at (created_at)
        )
      `);
      console.log('   ✅ chat_requests table created');
    }
    
    if (allTableNames.includes('chat_messages')) {
      console.log('   ✅ chat_messages table exists');
    } else {
      console.log('   ❌ chat_messages table NOT found - creating manually...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          chat_request_id INT NOT NULL,
          sender_type ENUM('visitor', 'staff') NOT NULL,
          sender_id INT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (chat_request_id) REFERENCES chat_requests(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES system_user(user_ID) ON DELETE SET NULL,
          INDEX idx_chat_request (chat_request_id),
          INDEX idx_created_at (created_at),
          INDEX idx_is_read (is_read)
        )
      `);
      console.log('   ✅ chat_messages table created');
    }
    
    await connection.end();
    console.log('\n🎉 Migration completed successfully!');
    console.log('📋 You can now use the live chat feature.');
    
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    console.error('Full error:', err);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

runLiveChatTablesMigration();
