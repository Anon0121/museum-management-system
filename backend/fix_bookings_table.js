const mysql = require('mysql2/promise');

async function fixBookingsTable() {
  try {
    console.log('🔄 Fixing bookings table...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    await connection.query('USE museosmart');
    
    // Try to discard tablespace and drop table
    try {
      console.log('🗑️  Discarding tablespace...');
      await connection.query('ALTER TABLE bookings DISCARD TABLESPACE');
    } catch (err) {
      console.log('⚠️  Could not discard tablespace (table may not exist)');
    }
    
    try {
      console.log('🗑️  Dropping bookings table...');
      await connection.query('DROP TABLE IF EXISTS bookings');
    } catch (err) {
      console.log('⚠️  Could not drop table');
    }
    
    // Create the bookings table fresh
    console.log('📝 Creating bookings table...');
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
    
    console.log('✅ Bookings table created successfully!');
    
    // Verify the table
    const [structure] = await connection.query('DESCRIBE bookings');
    console.log('📋 Bookings table structure:');
    structure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixBookingsTable();
