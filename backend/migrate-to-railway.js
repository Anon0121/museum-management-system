const mysql = require('mysql2/promise');
require('dotenv').config();

// Local database configuration
const localConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'museosmart',
  port: 3306
};

// Railway MySQL configuration
const railwayConfig = {
  host: 'crossover.proxy.rlwy.net',
  user: process.env.DB_USER || 'your-railway-username', // Usually not 'root' for external access
  password: process.env.DB_PASSWORD || 'your-railway-password',
  database: process.env.DB_NAME || 'railway',
  port: 55517,
  ssl: {
    rejectUnauthorized: false
  }
};

async function migrateToRailway() {
  console.log('🚂 Starting migration to Railway MySQL...');
  
  try {
    // Connect to local database
    const localPool = mysql.createPool(localConfig);
    const localConnection = await localPool.getConnection();
    
    // Connect to Railway database
    const railwayPool = mysql.createPool(railwayConfig);
    const railwayConnection = await railwayPool.getConnection();
    
    console.log('📋 Getting table structures from local database...');
    
    // Get all table names
    const [tables] = await localConnection.execute('SHOW TABLES');
    
    for (const table of tables) {
      const tableName = table[`Tables_in_museosmart`];
      console.log(`🔄 Migrating table: ${tableName}`);
      
      try {
        // Get table structure
        const [structure] = await localConnection.execute(`DESCRIBE ${tableName}`);
        
        // Get table data
        const [data] = await localConnection.execute(`SELECT * FROM ${tableName}`);
        
        // Create table on Railway
        await railwayConnection.execute(`DROP TABLE IF EXISTS ${tableName}`);
        
        // Recreate table structure
        let createTableSQL = `CREATE TABLE ${tableName} (`;
        const columns = [];
        
        for (const column of structure) {
          let columnDef = `${column.Field} ${column.Type}`;
          
          if (column.Null === 'YES') {
            columnDef += ' NULL';
          } else {
            columnDef += ' NOT NULL';
          }
          
          if (column.Default !== null) {
            columnDef += ` DEFAULT ${column.Default === null ? 'NULL' : `'${column.Default}'`}`;
          }
          
          if (column.Extra) {
            columnDef += ` ${column.Extra}`;
          }
          
          columns.push(columnDef);
        }
        
        createTableSQL += columns.join(', ') + ')';
        await railwayConnection.execute(createTableSQL);
        
        // Insert data
        if (data.length > 0) {
          const columns_str = structure.map(col => col.Field).join(', ');
          
          for (const row of data) {
            const values = Object.values(row).map(val => {
              if (val === null) return 'NULL';
              if (typeof val === 'string') {
                return `'${val.replace(/'/g, "\\'")}'`;
              }
              return val;
            });
            
            const insertSQL = `INSERT INTO ${tableName} (${columns_str}) VALUES (${values.map(() => '?').join(', ')})`;
            await railwayConnection.execute(insertSQL, Object.values(row));
          }
        }
        
        console.log(`✅ Migrated ${tableName}: ${data.length} rows`);
        
      } catch (error) {
        console.error(`❌ Error migrating ${tableName}:`, error.message);
      }
    }
    
    console.log('🎉 Migration to Railway completed!');
    
    // Close connections
    localConnection.release();
    railwayConnection.release();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

// Run migration
migrateToRailway();
