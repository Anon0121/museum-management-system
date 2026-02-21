const mysql = require('mysql2/promise');

// Test Railway connection with port 3306
async function testRailwayPort3306() {
  console.log('🚂 Testing Railway MySQL connection (port 3306)...');
  
  try {
    // Use Railway connection with port 3306 instead of 41347
    const connection = await mysql.createConnection({
      host: 'yamabiko.proxy.rlwy.net',
      port: 3306,  // Try standard MySQL port
      user: 'root',
      password: 'VzuVdcJENLoTsSOnbhhsoZrEAZtdmWlE',
      database: 'railway',
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ Railway connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test passed:', rows[0]);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Railway connection failed:', error.message);
    console.error('🔧 Error code:', error.code);
    console.error('🔧 Error errno:', error.errno);
  }
}

// Run test
testRailwayPort3306();
