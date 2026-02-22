console.log('🚀 Emergency test starting...');

try {
  // Test 1: Can we even require express?
  console.log('📦 Testing express import...');
  const express = require('express');
  console.log('✅ Express imported successfully');
  
  // Test 2: Can we create app?
  console.log('🔧 Creating express app...');
  const app = express();
  console.log('✅ Express app created');
  
  // Test 3: Test database connection
  console.log('🗄️ Testing database connection...');
  const pool = require('./db');
  console.log('✅ Database module imported');
  
  // Test 4: Can we create server?
  console.log('🌐 Creating HTTP server...');
  const server = require('http').createServer(app);
  console.log('✅ HTTP server created');
  
  // Test 5: Add a simple route
  app.get('/', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'Emergency test is working!',
      timestamp: new Date().toISOString()
    });
  });
  
  // Test 6: Can we listen?
  const PORT = process.env.PORT || 3000;
  console.log('👂 Starting to listen on port:', PORT);
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log('🎉 SUCCESS! Server is running on port', PORT);
    console.log('🎉 Emergency test PASSED!');
    console.log('🌐 Test at: http://localhost:' + PORT);
  });
  
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    console.error('❌ Server error details:', err.stack);
  });
  
} catch (error) {
  console.error('❌ Emergency test FAILED:', error);
  console.error('❌ Error type:', error.constructor.name);
  console.error('❌ Error message:', error.message);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}

console.log('🔄 Emergency test setup complete');
