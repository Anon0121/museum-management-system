const mysql = require('mysql2/promise');

// Simple Railway connection test
async function testRailwaySimple() {
  console.log('🚂 Testing Railway MySQL connection (simple)...');
  
  try {
    // Direct connection with your Railway details
    const connection = await mysql.createConnection({
      host: 'containers-us-west-1.railway.app',
      port: 3306,
      user: 'root',
      password: 'r5A8k7v4M2C5w9',
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
