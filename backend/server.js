const path = require('path');
const express = require('express');
const { dbErrorMessage } = require('./dbErrors');
const cors = require('cors');
const config = require('./config');

// Initialize database (runs schema & default settings if needed)
require('../database/db');

// Import route modules
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');
const booksRouter = require('./routes/books');
const membersRouter = require('./routes/members');
const issuesRouter = require('./routes/issues');
const finesRouter = require('./routes/fines');
const transactionsRouter = require('./routes/transactions');

// Import auth middleware
const { requireAuth, requireRole } = require('./authMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Health check endpoint (public – no auth required)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Auth routes (public – no requireAuth wrapper)
app.use('/api/auth', authRouter);

// --------------------------------------------------------------------------
// Protected API routes – all require a valid Bearer token
// --------------------------------------------------------------------------

// Dashboard: both LIBRARIAN and MEMBER can read dashboard
app.use('/api/dashboard', requireAuth, dashboardRouter);

// Books: GET is open to both roles; write ops (POST, PUT, DELETE) are LIBRARIAN-only
// The route handlers themselves enforce granular RBAC via the router
app.use('/api/books', requireAuth, booksRouter);

// Members: LIBRARIAN-only management
app.use('/api/members', requireAuth, membersRouter);

// Issues & Returns: LIBRARIAN-only
app.use('/api/issues', requireAuth, issuesRouter);

// Fines: both roles can read; settings/pay/waive are LIBRARIAN-only
app.use('/api/fines', requireAuth, finesRouter);

// Transactions: both roles can read (member transactions filtered by backend)
app.use('/api/transactions', requireAuth, transactionsRouter);

// --------------------------------------------------------------------------
// Role enforcement on write operations (applied after requireAuth above)
// These are additional guards for HTTP methods that mutate data.
// --------------------------------------------------------------------------

// Protect book writes
app.use('/api/books', requireAuth, (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return requireRole('LIBRARIAN')(req, res, next);
  }
  next();
});

// Protect member writes
app.use('/api/members', requireAuth, (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return requireRole('LIBRARIAN')(req, res, next);
  }
  next();
});

// Issues & returns: all operations are LIBRARIAN-only
app.use('/api/issues', requireAuth, requireRole('LIBRARIAN'));

// Fine configuration & actions: LIBRARIAN-only writes
app.use('/api/fines', requireAuth, (req, res, next) => {
  // /settings PUT and fine pay/waive POST require LIBRARIAN
  const isLibrarianOnly =
    (req.method === 'PUT' && req.path.includes('settings')) ||
    (req.method === 'POST' && (req.path.includes('/pay') || req.path.includes('/waive')));

  if (isLibrarianOnly) {
    return requireRole('LIBRARIAN')(req, res, next);
  }
  next();
});

// --------------------------------------------------------------------------
// Single Page Application fallback
// --------------------------------------------------------------------------
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
  const friendly = dbErrorMessage(err);
  res.status(friendly ? friendly.status : 500).json({
    success: false,
    message: friendly ? friendly.message : 'Something went wrong on the server. Please try again.'
  });
});

// Start server if executed directly
if (require.main === module) {
  const server = app.listen(config.PORT, () => {
    console.log(`=======================================================`);
    console.log(`  Library Management System is running!`);
    console.log(`  URL: http://localhost:${config.PORT}`);
    console.log(`  Login: http://localhost:${config.PORT}/login.html`);
    console.log(`  API Health: http://localhost:${config.PORT}/api/health`);
    console.log(`=======================================================`);
    console.log(`  Librarian: admin / admin123`);
    console.log(`  Members:   MEM-XXXX / their-email@example.com`);
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
