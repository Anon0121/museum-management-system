const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function forceCreateBookings() {
  try {
    console.log('🔄 Force creating bookings table...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    await connection.query('USE museosmart');
    
    // Get MySQL data directory
    const [variables] = await connection.query("SHOW VARIABLES LIKE 'datadir'");
    const dataDir = variables[0].Value;
    console.log('📁 MySQL data directory:', dataDir);
    
    // Try to remove physical table files
    const tableFiles = [
      path.join(dataDir, 'museosmart', 'bookings.ibd'),
      path.join(dataDir, 'museosmart', 'bookings.frm'),
      path.join(dataDir, 'museosmart', 'bookings.cfg'),
      path.join(dataDir, 'museosmart', 'bookings.par')
    ];
    
    tableFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log('🗑️  Removed:', file);
        }
      } catch (err) {
        console.log('⚠️  Could not remove:', file);
      }
    });
    
    // Now try to create the table
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

forceCreateBookings();
