const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// Helper to calculate difference in calendar days
function calculateDaysDifference(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// GET /api/issues/active - Get all currently active issued books
router.get('/active', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const activeIssues = db.prepare(`
      SELECT 
        t.id AS transaction_id,
        t.book_id,
        t.member_id,
        t.issue_date,
        t.due_date,
        t.status,
        b.title AS book_title,
        b.author AS book_author,
        b.isbn,
        b.category,
        m.member_code,
        m.name AS member_name,
        m.email AS member_email,
        m.phone AS member_phone
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      JOIN members m ON t.member_id = m.id
      WHERE t.status = 'ISSUED'
      ORDER BY t.due_date ASC
    `).all();

    // Attach overdue status and calculated days
    const enriched = activeIssues.map(issue => {
      const daysOverdue = calculateDaysDifference(issue.due_date, today);
      return {
        ...issue,
        is_overdue: daysOverdue > 0,
        days_overdue: Math.max(0, daysOverdue)
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    console.error('Fetch active issues error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve active issues' });
  }
});

// POST /api/issues - Issue a book to a member
router.post('/', (req, res) => {
  try {
    let { book_id, member_id, issue_date, due_date } = req.body;

    const bId = parseInt(book_id, 10);
    const mId = parseInt(member_id, 10);

    if (isNaN(bId) || bId <= 0) {
      return res.status(400).json({ success: false, message: 'A valid book must be selected' });
    }
    if (isNaN(mId) || mId <= 0) {
      return res.status(400).json({ success: false, message: 'A valid member must be selected' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const finalIssueDate = (issue_date && issue_date.trim()) ? issue_date.trim() : todayStr;

    // Default due date: standard borrowing period from settings
    let finalDueDate = due_date && due_date.trim();
    if (!finalDueDate) {
      const loanDaysRow = db.prepare("SELECT value FROM settings WHERE key = 'default_loan_days'").get();
      const loanDays = loanDaysRow ? parseInt(loanDaysRow.value, 10) : 14;
      const d = new Date(finalIssueDate);
      d.setDate(d.getDate() + loanDays);
      finalDueDate = d.toISOString().split('T')[0];
    }

    // Execute issue atomically in a transaction
    const executeIssue = db.transaction(() => {
      // 1. Verify book existence and availability
      const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bId);
      if (!book) {
        throw new Error('The selected book does not exist in the catalog');
      }
      if (book.available_copies <= 0) {
        throw new Error(`No copies of "${book.title}" are currently available for issue`);
      }

      // 2. Verify member existence and status
      const member = db.prepare('SELECT * FROM members WHERE id = ?').get(mId);
      if (!member) {
        throw new Error('The selected member is not registered in the system');
      }
      if (member.status !== 'ACTIVE') {
        throw new Error(`Member "${member.name}" is marked as ${member.status} and cannot borrow books`);
      }

      // 3. Prevent duplicate active borrowing of the same book
      const duplicateLoan = db.prepare(`
        SELECT id FROM transactions 
        WHERE book_id = ? AND member_id = ? AND status = 'ISSUED'
      `).get(bId, mId);

      if (duplicateLoan) {
        throw new Error(`Member "${member.name}" already has an active unreturned copy of "${book.title}"`);
      }

      // 4. Check max borrowing limit
      const maxLimitRow = db.prepare("SELECT value FROM settings WHERE key = 'max_books_per_member'").get();
      const maxLimit = maxLimitRow ? parseInt(maxLimitRow.value, 10) : 5;

      const currentLoansRow = db.prepare(`
        SELECT COUNT(*) AS count FROM transactions 
        WHERE member_id = ? AND status = 'ISSUED'
      `).get(mId);

      if (currentLoansRow && currentLoansRow.count >= maxLimit) {
        throw new Error(`Member "${member.name}" has reached the borrowing limit of ${maxLimit} books`);
      }

      // 5. Decrement available copies
      db.prepare(`
        UPDATE books 
        SET available_copies = available_copies - 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(bId);

      // 6. Record transaction
      const txResult = db.prepare(`
        INSERT INTO transactions (book_id, member_id, issue_date, due_date, status)
        VALUES (?, ?, ?, ?, 'ISSUED')
      `).run(bId, mId, finalIssueDate, finalDueDate);

      return {
        transactionId: txResult.lastInsertRowid,
        bookTitle: book.title,
        memberName: member.name,
        issueDate: finalIssueDate,
        dueDate: finalDueDate,
        remainingCopies: book.available_copies - 1
      };
    });

    const result = executeIssue();

    res.status(201).json({
      success: true,
      message: `Book "${result.bookTitle}" successfully issued to ${result.memberName}. Due date: ${result.dueDate}.`,
      data: result
    });
  } catch (error) {
    console.error('Issue book error:', error.message);
    res.status(400).json({ success: false, message: error.message || 'Failed to issue book' });
  }
});

// POST /api/issues/return - Return an issued book and calculate fine if overdue
router.post('/return', (req, res) => {
  try {
    let { transaction_id, return_date } = req.body;
    const txId = parseInt(transaction_id, 10);

    if (isNaN(txId) || txId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid transaction ID is required to return a book' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const finalReturnDate = (return_date && return_date.trim()) ? return_date.trim() : todayStr;

    // Execute return atomically in a transaction
    const executeReturn = db.transaction(() => {
      // 1. Fetch transaction with related book and member
      const tx = db.prepare(`
        SELECT 
          t.*,
          b.title AS book_title,
          m.name AS member_name,
          m.member_code
        FROM transactions t
        JOIN books b ON t.book_id = b.id
        JOIN members m ON t.member_id = m.id
        WHERE t.id = ?
      `).get(txId);

      if (!tx) {
        throw new Error(`Transaction #${txId} was not found in the system`);
      }

      if (tx.status === 'RETURNED') {
        throw new Error(`Book "${tx.book_title}" has already been returned on ${tx.return_date}`);
      }

      // 2. Mark transaction as RETURNED
      db.prepare(`
        UPDATE transactions 
        SET return_date = ?, status = 'RETURNED'
        WHERE id = ?
      `).run(finalReturnDate, txId);

      // 3. Increment available copies of book
      db.prepare(`
        UPDATE books 
        SET available_copies = available_copies + 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(tx.book_id);

      // 4. Calculate overdue days and fine
      const daysOverdue = calculateDaysDifference(tx.due_date, finalReturnDate);
      let fineAmount = 0;
      let fineId = null;

      if (daysOverdue > 0) {
        const rateRow = db.prepare("SELECT value FROM settings WHERE key = 'fine_rate_per_day'").get();
        const fineRate = rateRow ? parseFloat(rateRow.value) : 2.0;
        fineAmount = parseFloat((daysOverdue * fineRate).toFixed(2));

        const fineResult = db.prepare(`
          INSERT INTO fines (transaction_id, member_id, days_overdue, amount, status)
          VALUES (?, ?, ?, ?, 'PENDING')
        `).run(txId, tx.member_id, daysOverdue, fineAmount);

        fineId = fineResult.lastInsertRowid;
      }

      return {
        transactionId: txId,
        bookTitle: tx.book_title,
        memberName: tx.member_name,
        returnDate: finalReturnDate,
        dueDate: tx.due_date,
        daysOverdue: Math.max(0, daysOverdue),
        fineAmount,
        fineId
      };
    });

    const result = executeReturn();

    let message = `Book "${result.bookTitle}" returned successfully by ${result.memberName}.`;
    if (result.daysOverdue > 0) {
      message += ` The book was overdue by ${result.daysOverdue} day(s). A fine of $${result.fineAmount.toFixed(2)} has been recorded.`;
    } else {
      message += ' Returned on time with no fine.';
    }

    res.json({
      success: true,
      message,
      data: result
    });
  } catch (error) {
    console.error('Return book error:', error.message);
    res.status(400).json({ success: false, message: error.message || 'Failed to return book' });
  }
});

module.exports = router;
