const path = require('path');
const fs = require('fs');
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
}

// Run schema initialization immediately on load
initDb();

module.exports = db;
