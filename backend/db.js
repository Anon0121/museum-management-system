if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mysql = require('mysql2/promise');

// Use Railway's MYSQL_URL if available, otherwise fallback to individual vars
const useRailwayInternal = process.env.MYSQL_URL || process.env.DATABASE_URL;

const poolConfig = useRailwayInternal ? {
  // Parse Railway's MYSQL_URL or use individual variables
  ...(useRailwayInternal.includes('mysql://') ? 
    (() => {
      const url = new URL(useRailwayInternal);
      return {
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1),
        port: url.port || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 20000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        connectTimeout: 20000,
        timeout: 20000,
        ssl: {
          rejectUnauthorized: false
        }
      };
    })() : {
      // Fallback to individual Railway variables
      host: process.env.RAILWAY_MYSQL_HOST || 'mysql.railway.internal',
      user: process.env.RAILWAY_MYSQL_USERNAME || 'root',
      password: process.env.RAILWAY_MYSQL_PASSWORD || 'VzuVdcJENLoTsSOnbhhsoZrEAZtdmWlE',
      database: process.env.RAILWAY_MYSQL_NAME || 'railway',
      port: process.env.RAILWAY_MYSQL_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 20000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 20000,
      timeout: 20000,
      ssl: {
        rejectUnauthorized: false
      }
    })
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
  acquireTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
  ssl: {
    rejectUnauthorized: false
  }
};

console.log(`🔧 Database Config: ${useRailwayInternal ? 'Railway Internal' : 'Local MySQL'}`);

const pool = mysql.createPool(poolConfig);

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ DATABASE CONNECTION ERROR:', err.message);
    console.error('❌ Error Code:', err.code);
    console.error('❌ Error Details:', err);
    
    // Specific Railway error diagnosis
    if (err.code === 'ENOTFOUND') {
      console.error('🔧 FIX: Cannot find MySQL host. Check RAILWAY_MYSQL_HOST variable.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('🔧 FIX: Connection refused. Check port (should be 3306) and MySQL service status.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔧 FIX: Access denied. Check username/password in environment variables.');
    } else if (err.code === 'ETIMEDOUT') {
      console.error('🔧 FIX: Connection timeout. Check network and firewall settings.');
    }
    
    console.log('\n🔧 Current Database Config:');
    console.log('Host:', poolConfig.host);
    console.log('Port:', poolConfig.port);
    console.log('User:', poolConfig.user);
    console.log('Database:', poolConfig.database);
  });

module.exports = pool;
