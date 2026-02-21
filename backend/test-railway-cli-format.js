const mysql = require('mysql2/promise');

// Test Railway connection using CLI format
async function testRailwayCliFormat() {
  console.log('🚂 Testing Railway MySQL connection (CLI format)...');
  
  try {
    // Use exact CLI connection format
    const connection = await mysql.createConnection({
      host: 'yamabiko.proxy.rlwy.net',
      port: 3306,
      user: 'root',
      password: 'VzuVdcJENLoTsSOnbhhsoZrEAZtdmWlE',
      database: 'railway',
      ssl: {
        rejectUnauthorized: false
      },
      // Add connection timeout
      connectTimeout: 10000,  // 10 seconds timeout
      // Add keep alive
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
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
testRailwayCliFormat();
