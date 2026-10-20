const db = require('./db');
const { hashPassword, generateSalt } = require('./db');

function seedDatabase() {
  console.log('Seeding Library Management System database...');

  // Use a transaction for atomic and fast seeding
  const seedTransaction = db.transaction(() => {
    // 1. Clear existing transactional data in proper order
    db.prepare('DELETE FROM fines').run();
    db.prepare('DELETE FROM transactions').run();
    db.prepare('DELETE FROM books').run();
    // Remove only MEMBER-role users (keep the admin librarian)
    db.prepare("DELETE FROM users WHERE role = 'MEMBER'").run();
    db.prepare('DELETE FROM members').run();
    db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('books', 'members', 'transactions', 'fines')").run();

    // 2. Insert sample books
    const insertBook = db.prepare(`
      INSERT INTO books (title, author, isbn, category, total_copies, available_copies)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const bookIds = [];
    const sampleBooks = [
      ['Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'Computer Science', 5, 4],
      ['Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', '978-0201633610', 'Computer Science', 4, 3],
      ['The Pragmatic Programmer: Your Journey to Mastery', 'David Thomas, Andrew Hunt', '978-0135957059', 'Computer Science', 3, 2],
      ['Introduction to Algorithms (CLRS)', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', '978-0262033848', 'Algorithms', 6, 6],
      ['Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', '978-0134610993', 'Artificial Intelligence', 4, 4],
      ['Database System Concepts', 'Abraham Silberschatz, Henry Korth, S. Sudarshan', '978-0078022159', 'Database Systems', 5, 5],
      ['To Kill a Mockingbird', 'Harper Lee', '978-0060935467', 'Classic Literature', 3, 2],
      ['1984', 'George Orwell', '978-0451524935', 'Dystopian Fiction', 4, 4]
    ];

    for (const book of sampleBooks) {
      const res = insertBook.run(...book);
      bookIds.push(res.lastInsertRowid);
    }

    // 3. Insert sample members and corresponding user accounts
    const insertMember = db.prepare(`
      INSERT INTO members (member_code, name, email, phone, membership_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (username, password_hash, salt, role, member_id)
      VALUES (?, ?, ?, 'MEMBER', ?)
    `);

    const memberIds = [];
    const sampleMembers = [
      ['MEM-1001', 'Alice Johnson', 'alice.johnson@example.com', '555-0101', '2024-01-15', 'ACTIVE'],
      ['MEM-1002', 'Bob Smith', 'bob.smith@example.com', '555-0102', '2024-02-10', 'ACTIVE'],
      ['MEM-1003', 'Carol Davis', 'carol.davis@example.com', '555-0103', '2024-03-01', 'ACTIVE'],
      ['MEM-1004', 'David Wilson', 'david.wilson@example.com', '555-0104', '2024-03-22', 'ACTIVE'],
      ['MEM-1005', 'Emma Watson', 'emma.watson@example.com', '555-0105', '2024-04-05', 'ACTIVE']
    ];

    for (const member of sampleMembers) {
      const res = insertMember.run(...member);
      const memberId = res.lastInsertRowid;
      memberIds.push(memberId);

      // Create a MEMBER user account: username = member_code, password = email
      const [memberCode, , email] = member;
      const salt = generateSalt();
      const passwordHash = hashPassword(email, salt);
      insertUser.run(memberCode, passwordHash, salt, memberId);
    }

    // 4. Insert sample transactions and fines
    const now = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const dueInNineDays = new Date(now);
    dueInNineDays.setDate(dueInNineDays.getDate() + 9);

    // Transaction 1: Alice has Clean Code currently issued (active)
    db.prepare(`
      INSERT INTO transactions (book_id, member_id, issue_date, due_date, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(bookIds[0], memberIds[0], formatDate(fiveDaysAgo), formatDate(dueInNineDays), 'ISSUED');

    // Transaction 2: Bob has Design Patterns currently issued (active)
    db.prepare(`
      INSERT INTO transactions (book_id, member_id, issue_date, due_date, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(bookIds[1], memberIds[1], formatDate(fiveDaysAgo), formatDate(dueInNineDays), 'ISSUED');

    // Transaction 3: Carol has Pragmatic Programmer currently issued (active)
    db.prepare(`
      INSERT INTO transactions (book_id, member_id, issue_date, due_date, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(bookIds[2], memberIds[2], formatDate(fiveDaysAgo), formatDate(dueInNineDays), 'ISSUED');

    // Transaction 4: David borrowed and returned To Kill a Mockingbird on time
    const twentyDaysAgo = new Date(now);
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    const sixDaysAgo = new Date(now);
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    const eightDaysAgo = new Date(now);
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    db.prepare(`
      INSERT INTO transactions (book_id, member_id, issue_date, due_date, return_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(bookIds[6], memberIds[3], formatDate(twentyDaysAgo), formatDate(sixDaysAgo), formatDate(eightDaysAgo), 'RETURNED');

    // Transaction 5: Past transaction with fine (returned late by 4 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixteenDaysAgo = new Date(now);
    sixteenDaysAgo.setDate(sixteenDaysAgo.getDate() - 16);
    const twelveDaysAgo = new Date(now);
    twelveDaysAgo.setDate(twelveDaysAgo.getDate() - 12);

    const t5 = db.prepare(`
      INSERT INTO transactions (book_id, member_id, issue_date, due_date, return_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(bookIds[0], memberIds[1], formatDate(thirtyDaysAgo), formatDate(sixteenDaysAgo), formatDate(twelveDaysAgo), 'RETURNED');

    // Fine for t5: 4 days overdue * $2.00 = $8.00 (PENDING)
    db.prepare(`
      INSERT INTO fines (transaction_id, member_id, days_overdue, amount, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(t5.lastInsertRowid, memberIds[1], 4, 8.00, 'PENDING');
  });

  seedTransaction();
  console.log('Database seeded successfully with sample books, members, transactions, and fines.');
  console.log('\n  Member Login Credentials (username = Member Code, password = Email):');
  console.log('  MEM-1001 / alice.johnson@example.com');
  console.log('  MEM-1002 / bob.smith@example.com');
  console.log('  MEM-1003 / carol.davis@example.com');
  console.log('  MEM-1004 / david.wilson@example.com');
  console.log('  MEM-1005 / emma.watson@example.com');
  console.log('\n  Librarian Login: admin / admin123');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
