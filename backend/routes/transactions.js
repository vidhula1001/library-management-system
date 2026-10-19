const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// GET /api/transactions - Full transaction history with filters and search
router.get('/', (req, res) => {
  try {
    const { status, search } = req.query;
    const today = new Date().toISOString().split('T')[0];

    let query = `
      SELECT 
        t.id AS transaction_id,
        t.book_id,
        t.member_id,
        t.issue_date,
        t.due_date,
        t.return_date,
        t.status,
        t.created_at,
        b.title AS book_title,
        b.author AS book_author,
        b.isbn,
        b.category,
        m.name AS member_name,
        m.member_code,
        m.email AS member_email,
        m.phone AS member_phone,
        f.id AS fine_id,
        f.amount AS fine_amount,
        f.status AS fine_status,
        f.days_overdue
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      JOIN members m ON t.member_id = m.id
      LEFT JOIN fines f ON t.id = f.transaction_id
    `;

    const conditions = [];
    const params = [];

    if (status && status !== 'ALL') {
      if (status.toUpperCase() === 'OVERDUE') {
        conditions.push("t.status = 'ISSUED' AND t.due_date < ?");
        params.push(today);
      } else if (['ISSUED', 'RETURNED'].includes(status.toUpperCase())) {
        conditions.push('t.status = ?');
        params.push(status.toUpperCase());
      }
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(b.title LIKE ? OR b.isbn LIKE ? OR m.name LIKE ? OR m.member_code LIKE ?)');
      params.push(term, term, term, term);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.id DESC';

    const transactions = db.prepare(query).all(...params);

    // Compute display status
    const enriched = transactions.map(tx => {
      let displayStatus = tx.status;
      if (tx.status === 'ISSUED' && tx.due_date < today) {
        displayStatus = 'OVERDUE';
      }
      return {
        ...tx,
        display_status: displayStatus
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve transaction history' });
  }
});

module.exports = router;
