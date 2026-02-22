const mysql = require('mysql2/promise');

// Test with environment variables (Railway standard)
async function testRailwayWithEnv() {
  console.log('🚂 Testing Railway MySQL with environment variables...');
  
  // Try Railway environment variables first
  const config = {
    host: process.env.RAILWAY_MYSQL_HOST || 'containers-us-west-1.railway.app',
    port: process.env.RAILWAY_MYSQL_PORT || 3306,
    user: process.env.RAILWAY_MYSQL_USERNAME || 'root',
    password: process.env.RAILWAY_MYSQL_PASSWORD || '',
    database: process.env.RAILWAY_MYSQL_NAME || 'railway',
    ssl: {
      rejectUnauthorized: false
    },
    timeout: 10000,
    connectTimeout: 10000
  };
  
  console.log('🔧 Connection config:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
    password: config.password ? '[SET]' : '[NOT SET]'
  });
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Railway connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as time');
    console.log('✅ Query test passed:', rows[0]);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Railway connection failed:', error.message);
    console.error('🔧 Error code:', error.code);
    console.error('🔧 Error errno:', error.errno);
    
    // Additional troubleshooting
    if (error.code === 'ETIMEDOUT') {
      console.log('\n🔍 ETIMEDOUT Troubleshooting:');
      console.log('1. Check if Railway MySQL service is running');
      console.log('2. Verify host and port are correct');
      console.log('3. Check firewall settings');
      console.log('4. Try connecting from Railway dashboard first');
    }
  }
}

// Run test
testRailwayWithEnv();
