const mysql = require('mysql2/promise');

// Simple Railway connection test
async function testRailwaySimple() {
  console.log('🚂 Testing Railway MySQL connection (simple)...');
  
  try {
    // Direct connection with your current Railway details
    const connection = await mysql.createConnection({
      host: 'yamabiko.proxy.rlwy.net',
      port: 41347,
      user: 'root',
      password: 'VzuVdcJENLoTsSOnbhhsoZrEAZtdmWlE',
      database: 'railway',
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ Railway connection successful!');
    
    // Test simple query
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
testRailwaySimple();
