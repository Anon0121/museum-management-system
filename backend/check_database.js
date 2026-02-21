const mysql = require('mysql2/promise');

async function checkDatabase() {
  try {
    // Connect without specifying database first
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('✅ Connected to MySQL server');
    
    // Check if database exists
    const [databases] = await connection.query('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === 'museosmart');
    
    if (!dbExists) {
      console.log('❌ Database "museosmart" does not exist');
      await connection.end();
      return;
    }
    
    console.log('✅ Database "museosmart" exists');
    
    // Switch to the database
    await connection.query('USE museosmart');
    
    // Check tables
    try {
      const [tables] = await connection.query('SHOW TABLES');
      console.log('📋 Tables in museosmart:');
      tables.forEach(table => {
        console.log(`  - ${Object.values(table)[0]}`);
      });
      
      // Check if bookings table exists
      const bookingsExists = tables.some(table => 
        Object.values(table)[0] === 'bookings'
      );
      
      if (!bookingsExists) {
        console.log('❌ Table "bookings" does not exist');
        
        // Try to create just the bookings table
        console.log('🔄 Creating bookings table...');
        await connection.query(`
          CREATE TABLE IF NOT EXISTS bookings (
            booking_id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            type ENUM('individual', 'group') NOT NULL,
            status ENUM('pending', 'approved', 'checked-in', 'cancelled') DEFAULT 'pending',
            date DATE NOT NULL,
            time_slot VARCHAR(20) NOT NULL,
            total_visitors INT NOT NULL,
            checkin_time TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ Bookings table created');
        
      } else {
        console.log('✅ Table "bookings" exists');
        
        // Check bookings table structure
        const [structure] = await connection.query('DESCRIBE bookings');
        console.log('📋 Bookings table structure:');
        structure.forEach(column => {
          console.log(`  - ${column.Field}: ${column.Type}`);
        });
      }
    } catch (error) {
      console.error('❌ Error with tables:', error.message);
      
      // Try to discard tablespace and recreate
      if (error.message.includes('tablespace')) {
        console.log('🔄 Attempting to fix tablespace issue...');
        try {
          await connection.query('DROP TABLE IF EXISTS bookings');
          await connection.query(`
            CREATE TABLE bookings (
              booking_id INT AUTO_INCREMENT PRIMARY KEY,
              first_name VARCHAR(50) NOT NULL,
              last_name VARCHAR(50) NOT NULL,
              type ENUM('individual', 'group') NOT NULL,
              status ENUM('pending', 'approved', 'checked-in', 'cancelled') DEFAULT 'pending',
              date DATE NOT NULL,
              time_slot VARCHAR(20) NOT NULL,
              total_visitors INT NOT NULL,
              checkin_time TIMESTAMP NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          console.log('✅ Bookings table recreated successfully');
        } catch (fixError) {
          console.error('❌ Could not fix tablespace issue:', fixError.message);
        }
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

checkDatabase();
