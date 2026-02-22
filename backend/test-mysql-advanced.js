const mysql = require('mysql2/promise');

async function testAdvancedConnection() {
  console.log('🚂 Testing advanced MySQL connection...');
  
  const configs = [
    {
      name: 'Basic connection',
      config: {
        host: 'yamabiko.proxy.rlwy.net',
        port: 41347,
        user: 'root',
        password: 'VzuVdcJENLoTsSOnbhhsoZrEAZtdmWlE',
        database: 'railway',
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: 'With timeout settings',
      config: {
        host: 'yamabiko.proxy.rlwy.net',
        port: 41347,
        user: 'root',
        password: 'VzuVdcJENLoTsSOnbhhsoZrEAZtdmWlE',
        database: 'railway',
        ssl: { rejectUnauthorized: false },
        connectTimeout: 20000,
        timeout: 20000
      }
    },
    {
      name: 'Without SSL',
      config: {
        host: 'yamabiko.proxy.rlwy.net',
        port: 41347,
        user: 'root',
        password: 'VzuVdcJENLoTsSOnbhhsoZrEAZtdmWlE',
        database: 'railway'
      }
    }
  ];
  
  for (const test of configs) {
    console.log(`\n🔍 Testing: ${test.name}`);
    try {
      const connection = await mysql.createConnection(test.config);
      console.log('✅ Connection successful!');
      
      const [rows] = await connection.execute('SELECT 1 as test, VERSION() as version');
      console.log('✅ Query result:', rows[0]);
      
      await connection.end();
      break; // Stop on first success
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
      if (error.code) console.log('🔧 Error code:', error.code);
    }
  }
}

testAdvancedConnection();
