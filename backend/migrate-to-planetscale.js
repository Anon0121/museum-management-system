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

// PlanetScale configuration (update with your actual credentials)
const planetscaleConfig = {
  host: 'gateway.planetscale.com',
  user: 'your-planetscale-username',
  password: 'your-planetscale-password',
  database: 'museum-database',
  port: 3306,
  ssl: {
    rejectUnauthorized: false
  }
};

async function migrateToPlanetscale() {
  console.log('🌍 Starting migration to PlanetScale...');
  
  try {
    // Connect to local database
    const localPool = mysql.createPool(localConfig);
    const localConnection = await localPool.getConnection();
    
    // Connect to PlanetScale database
    const planetscalePool = mysql.createPool(planetscaleConfig);
    const planetscaleConnection = await planetscalePool.getConnection();
    
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
        
        // Create table on PlanetScale
        await planetscaleConnection.execute(`DROP TABLE IF EXISTS ${tableName}`);
        
        // Recreate table structure
        let createTableSQL = `CREATE TABLE ${tableName} (`;
        const columns = [];
        
        for (const column of structure) {
          columns.push(`${column.Field} ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Extra || ''}`);
        }
        
        createTableSQL += columns.join(', ') + ')';
        await planetscaleConnection.execute(createTableSQL);
        
        // Insert data
        if (data.length > 0) {
          const columns_str = structure.map(col => col.Field).join(', ');
          const values = data.map(row => {
            return Object.values(row).map(val => 
              val === null ? 'NULL' : `'${val.toString().replace(/'/g, "\\'")}'`
            );
          });
          
          const insertSQL = `INSERT INTO ${tableName} (${columns_str}) VALUES (${values.map(v => '?').join(', ')})`;
          
          for (const valueSet of values) {
            await planetscaleConnection.execute(insertSQL, valueSet);
          }
        }
        
        console.log(`✅ Migrated ${tableName}: ${data.length} rows`);
        
      } catch (error) {
        console.error(`❌ Error migrating ${tableName}:`, error.message);
      }
    }
    
    console.log('🎉 Migration completed!');
    
    // Close connections
    localConnection.release();
    planetscaleConnection.release();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

// Run migration
migrateToPlanetscale();
