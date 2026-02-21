const mysql = require('mysql2/promise');

// Test Railway connection with different usernames
const possibleConfigs = [
  {
    host: 'crossover.proxy.rlwy.net',
    user: 'root',
    password: process.env.DB_PASSWORD || 'r5A8k7v4M2C5w9',
    database: 'railway',
    port: 55517,
    ssl: { rejectUnauthorized: false }
  },
  {
    host: 'crossover.proxy.rlwy.net',
    user: 'railway',
    password: process.env.DB_PASSWORD || 'r5A8k7v4M2C5w9',
    database: 'railway',
    port: 55517,
    ssl: { rejectUnauthorized: false }
  },
  {
    host: 'crossover.proxy.rlwy.net',
    user: process.env.DB_USER || 'railway',
    password: process.env.DB_PASSWORD || 'r5A8k7v4M2C5w9',
    database: 'railway',
    port: 55517,
    ssl: { rejectUnauthorized: false }
  }
];

async function testRailwayConnection() {
  console.log('🚂 Testing Railway MySQL connection with different usernames...');
  
  for (let i = 0; i < possibleConfigs.length; i++) {
    const config = possibleConfigs[i];
    console.log(`\n🔍 Testing with username: ${config.user}`);
    
    try {
      const connection = await mysql.createConnection(config);
      console.log('✅ Railway connection successful with:', config.user);
      
      // Test a simple query
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('✅ Query test passed:', rows[0]);
      
      await connection.end();
      console.log(`\n🎉 SUCCESS! Use these credentials:`);
      console.log(`User: ${config.user}`);
      console.log(`Password: ${config.password}`);
      console.log(`Host: ${config.host}`);
      console.log(`Database: ${config.database}`);
      console.log(`Port: ${config.port}`);
      break;
      
    } catch (error) {
      console.error(`❌ Failed with ${config.user}:`, error.message);
    }
  }
}

// Run test
testRailwayConnection();
