const mysql = require('mysql2/promise');

async function testArchiveAccess() {
  try {
    console.log('🔍 Testing archive access...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    await connection.query('USE museosmart');
    
    // Check admin user
    const [admin] = await connection.query(
      'SELECT user_ID, username, role FROM system_user WHERE username = ?', 
      ['Anon']
    );
    
    console.log('👤 Admin user:', admin[0]);
    
    // Check if archives table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'archives'");
    console.log('📋 Archives table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Check archives table structure
      const [structure] = await connection.query('DESCRIBE archives');
      console.log('📋 Archives table structure:');
      structure.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
      
      // Check if there are any archives
      const [count] = await connection.query('SELECT COUNT(*) as total FROM archives');
      console.log('📊 Total archives:', count[0].total);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error testing archive access:', error.message);
  }
}

testArchiveAccess();
