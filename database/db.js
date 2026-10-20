const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'library.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enforce foreign key constraints
db.pragma('foreign_keys = ON');

// Password hashing utility using Node built-in crypto (no extra packages)
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

// Initialize database tables from schema.sql
function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);

  // Initialize default settings if not exists
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value, description)
    VALUES (?, ?, ?)
  `);

  insertSetting.run('fine_rate_per_day', '2.00', 'Daily fine rate in dollars/currency units for overdue books');
  insertSetting.run('default_loan_days', '14', 'Default standard borrowing duration in days');
  insertSetting.run('currency_symbol', '$', 'Currency symbol used for displaying monetary amounts');
  insertSetting.run('max_books_per_member', '5', 'Maximum number of books a member can borrow at once');

  // Seed default librarian admin account if it doesn't exist
  const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const salt = generateSalt();
    const passwordHash = hashPassword('admin123', salt);
    db.prepare(`
      INSERT INTO users (username, password_hash, salt, role, member_id)
      VALUES (?, ?, ?, ?, NULL)
    `).run('admin', passwordHash, salt, 'LIBRARIAN');
    console.log('  [Auth] Default librarian account created: admin / admin123');
  }
}

// Run schema initialization immediately on load
initDb();

module.exports = db;
module.exports.hashPassword = hashPassword;
module.exports.generateSalt = generateSalt;
