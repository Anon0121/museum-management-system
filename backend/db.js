if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mysql = require('mysql2/promise');

// Check if using Railway DATABASE_URL (internal Railway database)
const useRailwayInternal = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway.app');

// Parse DATABASE_URL if available
let dbConfig;
if (useRailwayInternal && process.env.DATABASE_URL) {
  // Parse Railway DATABASE_URL
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    dbConfig = {
      host: dbUrl.hostname,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1), // Remove leading slash
      port: 3306,  // Use standard MySQL port
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 10000, // 10 seconds timeout
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 10000, // 10 seconds timeout
      ssl: {
        rejectUnauthorized: false
      }
    };
  } catch (error) {
    console.error('❌ Error parsing DATABASE_URL:', error.message);
    // Fallback to individual variables
    dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'museosmart',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 60000,
      ssl: {
        rejectUnauthorized: false
      }
    };
  }
} else {
  // Local MySQL configuration
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'museosmart',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 60000,
    ssl: {
      rejectUnauthorized: false
    }
  };
}

console.log(`🔧 Database Config: ${useRailwayInternal ? 'Railway Internal' : 'Local MySQL'}`);

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
