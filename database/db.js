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

// WAL mode: faster writes and readers don't block writers
db.pragma('journal_mode = WAL');

// Enforce foreign key constraints
db.pragma('foreign_keys = ON');

const SCHEMA_VERSION = 1;

// Password hashing utility using Node built-in crypto (no extra packages)
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

// Upgrade a pre-v1 database: rebuild tables so new CHECK/UNIQUE constraints apply,
// copying all existing rows. Fails (and rolls back) if existing data violates the rules.
function migrateToV1(schemaSql) {
  const tables = ['books', 'members', 'transactions', 'fines', 'users'];
  const backupPath = `${DB_PATH}.pre-v1.bak`;
  if (DB_PATH !== ':memory:' && !fs.existsSync(backupPath)) {
    db.exec(`VACUUM INTO '${backupPath.replace(/'/g, "''")}'`);
    console.log(`  [DB] Backup saved to ${backupPath}`);
  }

  db.pragma('foreign_keys = OFF');
  try {
    db.transaction(() => {
      const oldIndexes = db.prepare(
        "SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%'"
      ).all();
      oldIndexes.forEach(({ name }) => db.exec(`DROP INDEX IF EXISTS "${name}"`));

      const existingTables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(r => r.name);
      const tablesToMigrate = tables.filter(t => existingTables.includes(t));
      tablesToMigrate.forEach(t => db.exec(`ALTER TABLE ${t} RENAME TO ${t}_old`));
      db.exec(schemaSql);
      tablesToMigrate.forEach(t => {
        const cols = db.prepare(`PRAGMA table_info(${t}_old)`).all().map(c => c.name).join(', ');
        db.exec(`INSERT INTO ${t} (${cols}) SELECT ${cols} FROM ${t}_old`);
      });
      [...tablesToMigrate].reverse().forEach(t => db.exec(`DROP TABLE ${t}_old`));

      const fkErrors = db.pragma('foreign_key_check');
      if (fkErrors.length) throw new Error(`Foreign key violations: ${JSON.stringify(fkErrors)}`);
      db.pragma(`user_version = ${SCHEMA_VERSION}`);
    })();
    console.log('  [DB] Migrated database to schema v1');
  } finally {
    db.pragma('foreign_keys = ON');
  }
}

// Initialize database tables from schema.sql
function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const version = db.pragma('user_version', { simple: true });
  const hasTables = db.prepare(
    "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'books'"
  ).get();

  if (hasTables && version < SCHEMA_VERSION) {
    migrateToV1(schemaSql);
  } else {
    db.exec(schemaSql);
    if (version < SCHEMA_VERSION) db.pragma(`user_version = ${SCHEMA_VERSION}`);
  }

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
