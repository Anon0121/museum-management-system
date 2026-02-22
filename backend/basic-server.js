console.log('🚀 Starting basic HTTP server...');

const http = require('http');

const server = http.createServer((req, res) => {
  console.log('📥 Request received:', req.method, req.url);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Basic HTTP server is running',
    url: req.url
  }));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Basic server listening on port', PORT);
  console.log('✅ Server started successfully!');
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});
