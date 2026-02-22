const mysql = require('mysql2/promise');

// Test with your current Railway variables
async function testMySQLConnection() {
  console.log('🔍 Testing MySQL connection with current variables...');
  
  // Test 1: Individual variables
  console.log('\n📋 Test 1: Individual Railway Variables');
  try {
    const connection1 = await mysql.createConnection({
      host: 'yamabiko.proxy.rlwy.net',
      port: 41347,
      user: 'root',
      password: 'VzuVdcJENLoTsSOnbhhsoZrEAZtdmWlE',
      database: 'railway',
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('✅ Individual variables: Connected!');
    
    const [rows] = await connection1.execute('SELECT 1 as test, NOW() as time');
    console.log('✅ Query result:', rows[0]);
    
    await connection1.end();
    
  } catch (error) {
    console.log('❌ Individual variables failed:', error.message);
  }
  
  // Test 2: MYSQL_URL format
  console.log('\n📋 Test 2: MYSQL_URL Format');
  const mysqlUrl = 'mysql://root:VzuVdcJENLoTsSOnbhhsoZrEAZtdmWlE@yamabiko.proxy.rlwy.net:41347/railway';
  console.log('🔗 Testing URL:', mysqlUrl);
  
  try {
    const url = new URL(mysqlUrl);
    const connection2 = await mysql.createConnection({
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('✅ MYSQL_URL format: Connected!');
    
    const [rows] = await connection2.execute('SELECT 1 as test, NOW() as time');
    console.log('✅ Query result:', rows[0]);
    
    await connection2.end();
    
  } catch (error) {
    console.log('❌ MYSQL_URL format failed:', error.message);
  }
}

testMySQLConnection();
