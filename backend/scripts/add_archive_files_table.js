const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function addArchiveFilesTable() {
  let connection;
  
  try {
    // Database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'museosmart'
    });

    console.log('Connected to database successfully');

    // Read and execute the SQL migration
    const sqlPath = path.join(__dirname, '../database/add_archive_files_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements and filter out comments
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        // Remove comments and empty statements
        const cleaned = stmt.replace(/--.*$/gm, '').trim();
        return cleaned.length > 0 && !cleaned.startsWith('--');
      });
    
    for (const statement of statements) {
      // Remove inline comments
      const cleanStatement = statement.replace(/--.*$/gm, '').trim();
      if (cleanStatement) {
        console.log('Executing:', cleanStatement.substring(0, 100) + (cleanStatement.length > 100 ? '...' : ''));
        await connection.execute(cleanStatement);
      }
    }

    console.log('✅ Archive files table migration completed successfully!');
    
    // Verify the changes
    const [rows] = await connection.execute('DESCRIBE archive_files');
    console.log('\n📋 Current archive_files table structure:');
    rows.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${row.Default ? `DEFAULT ${row.Default}` : ''}`);
    });

    // Show count of files in table
    const [countRows] = await connection.execute('SELECT COUNT(*) as count FROM archive_files');
    console.log(`\n📊 Total files in archive_files table: ${countRows[0].count}`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration
addArchiveFilesTable();

