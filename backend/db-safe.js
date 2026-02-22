const mysql = require('mysql2/promise');

// Safe database connection with fallback
let pool = null;

async function initializeDatabase() {
  try {
    console.log('🔗 Initializing database connection...');
    
    const poolConfig = {
      host: process.env.RAILWAY_MYSQL_HOST || 'yamabiko.proxy.rlwy.net',
      user: process.env.RAILWAY_MYSQL_USERNAME || 'root',
      password: process.env.RAILWAY_MYSQL_PASSWORD || 'VzuVdcJENLoTsSOnbhhsoZrEAZtdmWlE',
      database: process.env.RAILWAY_MYSQL_NAME || 'railway',
      port: process.env.RAILWAY_MYSQL_PORT || 41347,
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
    
    pool = mysql.createPool(poolConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    console.log('✅ Database connected successfully');
    return pool;
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Starting server without database...');
    return null; // Allow server to start without DB
  }
}

// Initialize database connection
initializeDatabase().then(p => {
  pool = p;
}).catch(err => {
  console.error('❌ Database initialization failed:', err);
});

module.exports = {
  async query(sql, params = []) {
    if (!pool) {
      throw new Error('Database not available');
    }
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  
  async getConnection() {
    if (!pool) {
      throw new Error('Database not available');
    }
    return pool.getConnection();
  }
};
