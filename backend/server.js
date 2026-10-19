const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config');

// Initialize database (runs schema & default settings if needed)
require('../database/db');

// Import route modules
const dashboardRouter = require('./routes/dashboard');
const booksRouter = require('./routes/books');
const membersRouter = require('./routes/members');
const issuesRouter = require('./routes/issues');
const finesRouter = require('./routes/fines');
const transactionsRouter = require('./routes/transactions');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// API routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/books', booksRouter);
app.use('/api/members', membersRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/fines', finesRouter);
app.use('/api/transactions', transactionsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Single Page Application fallback - serve index.html for unknown frontend routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  const indexPath = path.join(publicPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('Library Management System API is running.');
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server if executed directly
if (require.main === module) {
  const server = app.listen(config.PORT, () => {
    console.log(`=======================================================`);
    console.log(`  Library Management System is running!`);
    console.log(`  URL: http://localhost:${config.PORT}`);
    console.log(`  API Health: http://localhost:${config.PORT}/api/health`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    server.close(() => {
      console.log('Server stopped gracefully.');
      process.exit(0);
    });
  });
}

module.exports = app;
