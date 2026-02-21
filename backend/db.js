if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mysql = require('mysql2/promise');

// Check if using Railway (Railway host detected)
const useRailway = process.env.DB_HOST && process.env.DB_HOST.includes('rlwy.net');

const poolConfig = useRailway ? {
  // Railway MySQL configuration
  host: process.env.DB_HOST || 'crossover.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 55517,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Valid mysql2 pool options
  acquireTimeout: 60000, // Time to wait for a connection from the pool (in milliseconds)
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Add query timeout to prevent early failures
  connectTimeout: 60000, // Connection timeout in milliseconds
  // Note: mysql2 doesn't support queryTimeout directly, but we can set it per query
  // SSL for Railway
  ssl: {
    rejectUnauthorized: false
  }
} : {
  // Local MySQL configuration
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'museosmart',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Valid mysql2 pool options
  acquireTimeout: 60000, // Time to wait for a connection from the pool (in milliseconds)
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Add query timeout to prevent early failures
  connectTimeout: 60000, // Connection timeout in milliseconds
  // Note: mysql2 doesn't support queryTimeout directly, but we can set it per query
};

console.log(`🔧 Database Config: ${useRailway ? 'Railway MySQL' : 'Local MySQL'}`);

const pool = mysql.createPool(poolConfig);

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
    console.log('\n🔧 To fix this:');
    console.log('1. Make sure MySQL is installed and running');
    console.log('2. Check your .env or environment variables');
    console.log('3. Make sure the database exists and credentials are correct');
  });

module.exports = pool;
