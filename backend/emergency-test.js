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
  
  // Test 3: Can we create server?
  console.log('🌐 Creating HTTP server...');
  const server = require('http').createServer(app);
  console.log('✅ HTTP server created');
  
  // Test 4: Can we listen?
  const PORT = process.env.PORT || 3000;
  console.log('👂 Starting to listen on port:', PORT);
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log('🎉 SUCCESS! Server is running on port', PORT);
    console.log('🎉 Emergency test PASSED!');
  });
  
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
  });
  
} catch (error) {
  console.error('❌ Emergency test FAILED:', error);
  console.error('❌ Error details:', error.stack);
  process.exit(1);
}

console.log('🔄 Emergency test setup complete');
