const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function removeArchiveFilesTable() {
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
    const sqlPath = path.join(__dirname, '../database/remove_archive_files_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements and filter out comments
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        const cleaned = stmt.replace(/--.*$/gm, '').trim();
        return cleaned.length > 0 && !cleaned.startsWith('--');
      });
    
    for (const statement of statements) {
      const cleanStatement = statement.replace(/--.*$/gm, '').trim();
      if (cleanStatement) {
        console.log('Executing:', cleanStatement);
        await connection.execute(cleanStatement);
      }
    }

    console.log('✅ Archive files table removed successfully!');

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
removeArchiveFilesTable();

