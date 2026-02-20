// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();

// ✅ CORS Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:9004',
    'http://localhost:3001',
    'https://java-learn-k9o8.vercel.app',
    'https://reverse-engineer-of-w3-schools-ja-va-java-learn-f2oerxdog.vercel.app'
  ],
  credentials: true,
}));

// ✅ Body Parsers (Safe JSON Parsing)
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new Error("❌ Invalid JSON payload");
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/java_tutorials')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Create HTTP Server
const server = http.createServer(app);

// ✅ Setup WebSocket Compiler
const { setupWebSocketCompiler } = require('./src/server/websocketCompiler');
setupWebSocketCompiler(server);

// ✅ Routes (All inline requires)
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/compile', require('./src/routes/compile'));
app.use('/api/topics', require('./src/routes/topics'));
app.use('/api/tutorials', require('./src/routes/tutorials'));
app.use('/api/quizzes', require('./src/routes/quizzes'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/progress', require('./src/routes/progress'));
app.use('/api/admin', require('./src/routes/admin'));

// ✅ Test Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});
app.get('/api/admin/test', (req, res) => {
  res.json({ message: 'Admin routes are working!' });
});

// ✅ Debug Route: Lists all registered routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path:
              (middleware.regexp.source
                .replace('^\\', '/')
                .replace('\\/?(?=\\/|$)', '') || '') + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });

  res.json({ routes });
});

// ✅ 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    msg: 'Route not found',
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

// ✅ Global Error Handler (Handles invalid JSON gracefully)
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err.message);
  if (err.message.includes('Invalid JSON')) {
    return res.status(400).json({ msg: 'Invalid JSON format in request body' });
  }
  res.status(500).json({ msg: err.message });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🧩 WebSocket available at ws://localhost:${PORT}/ws/compile`);
});
