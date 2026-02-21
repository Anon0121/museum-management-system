const mysql = require('mysql2/promise');

async function checkAllTables() {
  try {
    console.log('🔍 Checking all database tables...\n');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    await connection.query('USE museosmart');
    
    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables in museosmart database:\n`);
    
    let issues = [];
    let workingTables = [];
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      
      try {
        // Test if we can describe the table
        const [structure] = await connection.query(`DESCRIBE ${tableName}`);
        console.log(`✅ ${tableName} - ${structure.length} columns`);
        workingTables.push(tableName);
        
        // Try to count records
        try {
          const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`   📊 Records: ${count[0].count}`);
        } catch (countErr) {
          console.log(`   ⚠️  Cannot count records: ${countErr.message}`);
        }
        
      } catch (err) {
        console.log(`❌ ${tableName} - ERROR: ${err.message}`);
        issues.push({ table: tableName, error: err.message });
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`✅ Working tables: ${workingTables.length}`);
    console.log(`❌ Problem tables: ${issues.length}`);
    
    if (issues.length > 0) {
      console.log(`\n🚨 PROBLEMATIC TABLES:`);
      issues.forEach(issue => {
        console.log(`   - ${issue.table}: ${issue.error}`);
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkAllTables();
