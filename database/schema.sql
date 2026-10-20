-- Library Management System Database Schema (SQLite)
-- Schema version: 1 (tracked via PRAGMA user_version, see db.js)

-- 1. Configuration & Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT
);

-- 2. Books Table
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  total_copies INTEGER NOT NULL CHECK(total_copies >= 1),
  available_copies INTEGER NOT NULL CHECK(available_copies >= 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CHECK(available_copies <= total_copies)
);

-- 3. Members Table
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  membership_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transactions Table (Issue & Return Records)
-- Note: 'OVERDUE' is computed at query time, never stored.
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status TEXT NOT NULL DEFAULT 'ISSUED' CHECK(status IN ('ISSUED', 'RETURNED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT,
  CHECK(due_date >= issue_date),
  CHECK(return_date IS NULL OR return_date >= issue_date),
  CHECK((status = 'RETURNED') = (return_date IS NOT NULL))
);

-- 5. Fines Table (at most one fine per transaction)
CREATE TABLE IF NOT EXISTS fines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL UNIQUE,
  member_id INTEGER NOT NULL,
  days_overdue INTEGER NOT NULL DEFAULT 0 CHECK(days_overdue >= 0),
  amount REAL NOT NULL DEFAULT 0.0 CHECK(amount >= 0),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PAID', 'WAIVED')),
  paid_date DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE RESTRICT,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT
);

-- 6. Users Table (for authentication; at most one login per member)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK(role IN ('LIBRARIAN', 'MEMBER')),
  member_id INTEGER UNIQUE,            -- nullable: links MEMBER users to their member record
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Remove redundant indexes (UNIQUE columns are already auto-indexed by SQLite)
DROP INDEX IF EXISTS idx_books_isbn;
DROP INDEX IF EXISTS idx_members_code;
DROP INDEX IF EXISTS idx_members_email;
DROP INDEX IF EXISTS idx_users_username;

-- Indexes for performance & quick searches
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_book ON transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_due ON transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status);
CREATE INDEX IF NOT EXISTS idx_fines_member ON fines(member_id);

-- Keep updated_at fresh automatically on any edit
CREATE TRIGGER IF NOT EXISTS trg_books_updated_at
AFTER UPDATE ON books
FOR EACH ROW WHEN NEW.updated_at IS OLD.updated_at
BEGIN
  UPDATE books SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_members_updated_at
AFTER UPDATE ON members
FOR EACH ROW WHEN NEW.updated_at IS OLD.updated_at
BEGIN
  UPDATE members SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
