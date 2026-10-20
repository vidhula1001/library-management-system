const express = require('express');
const router = express.Router();
const db = require('../../database/db');
const { sendError } = require('../dbErrors');

// GET /api/dashboard - Summary statistics and recent activity
router.get('/', (req, res) => {
  try {
    // 1. Total distinct book titles
    const totalTitlesRow = db.prepare('SELECT COUNT(*) AS count FROM books').get();
    const totalTitles = totalTitlesRow ? totalTitlesRow.count : 0;

    // 2. Total physical copies
    const totalCopiesRow = db.prepare('SELECT COALESCE(SUM(total_copies), 0) AS total FROM books').get();
    const totalCopies = totalCopiesRow ? totalCopiesRow.total : 0;

    // 3. Available physical copies
    const availableCopiesRow = db.prepare('SELECT COALESCE(SUM(available_copies), 0) AS available FROM books').get();
    const availableCopies = availableCopiesRow ? availableCopiesRow.available : 0;

    // 4. Registered members
    const totalMembersRow = db.prepare("SELECT COUNT(*) AS count FROM members WHERE status = 'ACTIVE'").get();
    const registeredMembers = totalMembersRow ? totalMembersRow.count : 0;

    // 5. Currently issued books
    const issuedBooksRow = db.prepare("SELECT COUNT(*) AS count FROM transactions WHERE status = 'ISSUED'").get();
    const currentlyIssued = issuedBooksRow ? issuedBooksRow.count : 0;

    // 6. Overdue issued books (due date before today)
    const overdueRow = db.prepare(`
      SELECT COUNT(*) AS count 
      FROM transactions 
      WHERE status = 'ISSUED' AND due_date < date('now')
    `).get();
    const overdueBooks = overdueRow ? overdueRow.count : 0;

    // 7. Fines statistics
    const pendingFinesRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) AS total 
      FROM fines 
      WHERE status = 'PENDING'
    `).get();
    const pendingFines = pendingFinesRow ? pendingFinesRow.total : 0;

    const collectedFinesRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) AS total 
      FROM fines 
      WHERE status = 'PAID'
    `).get();
    const collectedFines = collectedFinesRow ? collectedFinesRow.total : 0;

    // 8. Recent transactions (last 6)
    const recentTransactions = db.prepare(`
      SELECT 
        t.id,
        t.issue_date,
        t.due_date,
        t.return_date,
        t.status,
        b.title AS book_title,
        b.isbn,
        m.name AS member_name,
        m.member_code
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      JOIN members m ON t.member_id = m.id
      ORDER BY t.id DESC
      LIMIT 6
    `).all();

    // 9. Fine rate setting
    const fineRateSetting = db.prepare("SELECT value FROM settings WHERE key = 'fine_rate_per_day'").get();
    const fineRate = fineRateSetting ? parseFloat(fineRateSetting.value) : 2.0;

    res.json({
      success: true,
      data: {
        totalTitles,
        totalCopies,
        availableCopies,
        registeredMembers,
        currentlyIssued,
        overdueBooks,
        pendingFines,
        collectedFines,
        fineRate,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return sendError(res, error, 'Failed to retrieve dashboard statistics');
  }
});

module.exports = router;
