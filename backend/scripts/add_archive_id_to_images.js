const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function addArchiveIdToImages() {
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
    const sqlPath = path.join(__dirname, '../database/add_archive_id_to_images.sql');
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
        console.log('Executing:', cleanStatement.substring(0, 100) + (cleanStatement.length > 100 ? '...' : ''));
        await connection.execute(cleanStatement);
      }
    }

    console.log('✅ Archive ID column added to images table successfully!');
    
    // Verify the changes
    const [rows] = await connection.execute('DESCRIBE images');
    console.log('\n📋 Current images table structure:');
    rows.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

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
addArchiveIdToImages();

