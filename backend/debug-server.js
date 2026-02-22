console.log('🚀 Starting debug server...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

try {
  const express = require('express');
  console.log('✅ Express loaded');
  
  const app = express();
  console.log('✅ Express app created');
  
  app.get('/api/health', (req, res) => {
    console.log('📥 Health check request received');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: 'Debug server is running',
      nodeVersion: process.version,
      port: process.env.PORT || 3000
    });
  });
  
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening on port ${PORT}`);
    console.log(`✅ Server started successfully at ${new Date().toISOString()}`);
  });
  
  console.log('🔄 Server setup complete, waiting for connection...');
  
} catch (error) {
  console.error('❌ Server startup error:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}
