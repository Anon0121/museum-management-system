const mysql = require('mysql2/promise');

// Test Railway connection using DATABASE_URL
async function testRailwayConnection() {
  console.log('🚂 Testing Railway MySQL connection...');
  
  try {
    // Use your correct Railway connection string
    const dbUrl = process.env.DATABASE_URL || 'mysql://root:r5A8k7v4M2C5w9@containers-us-west-1.railway.app:3306/railway';
    console.log('🔗 Using connection:', dbUrl);
    
    // Parse DATABASE_URL
    const url = new URL(dbUrl.replace('mysql://', 'mysql://'));
    
    const connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      port: url.port || 3306,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ Railway connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test passed:', rows[0]);
    
    // Test table creation
    await connection.execute('CREATE TABLE IF NOT EXISTS test_table (id INT PRIMARY KEY)');
    console.log('✅ Table creation test passed');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Railway connection failed:', error.message);
  }
}

// Run test
testRailwayConnection();
