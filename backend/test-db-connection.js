const mysql = require('mysql2/promise');

async function testDirectConnection() {
  console.log('🚂 Testing direct Railway MySQL connection...');
  
  try {
    // Try direct connection with Railway format
    const connection = await mysql.createConnection({
      host: 'yamabiko.proxy.rlwy.net',
      port: 41347,
      user: 'root',
      password: 'VzuVdcJENLoTsSOnbhhsoZrEAZtdmWlE',
      database: 'railway',
      ssl: { rejectUnauthorized: false },
      connectTimeout: 20000,
      timeout: 20000
    });
    
    console.log('✅ Connection successful!');
    
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as time');
    console.log('✅ Query result:', rows[0]);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔧 Error code:', error.code);
  }
}

testDirectConnection();
