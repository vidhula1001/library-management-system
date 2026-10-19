const db = require('./db');

function seedDatabase() {
  console.log('Seeding Library Management System database...');

  // Use a transaction for atomic and fast seeding
  const seedTransaction = db.transaction(() => {
    // 1. Clear existing transactional data in proper order
    db.prepare('DELETE FROM fines').run();
    db.prepare('DELETE FROM transactions').run();
    db.prepare('DELETE FROM books').run();
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

    // 3. Insert sample members
    const insertMember = db.prepare(`
      INSERT INTO members (member_code, name, email, phone, membership_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
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
      memberIds.push(res.lastInsertRowid);
    }

    // 4. Insert sample transactions and fines
    // Today's date helpers
    const now = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    // Current date - 5 days ago (issued)
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    // Due in 9 days
    const dueInNineDays = new Date(now);
    dueInNineDays.setDate(dueInNineDays.getDate() + 9);

    // Transaction 1: Alice has Clean Code currently issued (active)
    const t1 = db.prepare(`
      INSERT INTO transactions (book_id, member_id, issue_date, due_date, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(bookIds[0], memberIds[0], formatDate(fiveDaysAgo), formatDate(dueInNineDays), 'ISSUED');

    // Transaction 2: Bob has Design Patterns currently issued (active)
    const t2 = db.prepare(`
      INSERT INTO transactions (book_id, member_id, issue_date, due_date, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(bookIds[1], memberIds[1], formatDate(fiveDaysAgo), formatDate(dueInNineDays), 'ISSUED');

    // Transaction 3: Carol has Pragmatic Programmer currently issued (active)
    const t3 = db.prepare(`
      INSERT INTO transactions (book_id, member_id, issue_date, due_date, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(bookIds[2], memberIds[2], formatDate(fiveDaysAgo), formatDate(dueInNineDays), 'ISSUED');

    // Transaction 4: David borrowed and returned To Kill a Mockingbird on time (returned)
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
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
