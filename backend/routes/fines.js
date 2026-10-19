const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// GET /api/fines - List all fines with member and transaction information
router.get('/', (req, res) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT 
        f.id AS fine_id,
        f.transaction_id,
        f.member_id,
        f.days_overdue,
        f.amount,
        f.status,
        f.paid_date,
        f.notes,
        f.created_at,
        m.name AS member_name,
        m.member_code,
        m.email AS member_email,
        b.title AS book_title,
        b.isbn,
        t.issue_date,
        t.due_date,
        t.return_date
      FROM fines f
      JOIN members m ON f.member_id = m.id
      JOIN transactions t ON f.transaction_id = t.id
      JOIN books b ON t.book_id = b.id
    `;

    const conditions = [];
    const params = [];

    if (status && ['PENDING', 'PAID', 'WAIVED'].includes(status.toUpperCase())) {
      conditions.push('f.status = ?');
      params.push(status.toUpperCase());
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(m.name LIKE ? OR m.member_code LIKE ? OR b.title LIKE ?)');
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY f.id DESC';

    const fines = db.prepare(query).all(...params);

    // Summary calculations
    const statsRow = db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END), 0) AS pending_total,
        COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) AS collected_total,
        COALESCE(SUM(CASE WHEN status = 'WAIVED' THEN amount ELSE 0 END), 0) AS waived_total,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) AS pending_count
      FROM fines
    `).get();

    res.json({
      success: true,
      count: fines.length,
      stats: statsRow,
      data: fines
    });
  } catch (error) {
    console.error('Fetch fines error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve fines list' });
  }
});

// GET /api/fines/settings - Get configurable fine rule and loan settings
router.get('/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT key, value, description FROM settings').all();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    res.json({
      success: true,
      data: {
        fine_rate_per_day: parseFloat(settingsMap['fine_rate_per_day'] || '2.00'),
        default_loan_days: parseInt(settingsMap['default_loan_days'] || '14', 10),
        currency_symbol: settingsMap['currency_symbol'] || '$',
        max_books_per_member: parseInt(settingsMap['max_books_per_member'] || '5', 10)
      }
    });
  } catch (error) {
    console.error('Fetch fine settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve fine settings' });
  }
});

// PUT /api/fines/settings - Update configurable fine rule
router.put('/settings', (req, res) => {
  try {
    const { fine_rate_per_day, default_loan_days } = req.body;

    const rate = parseFloat(fine_rate_per_day);
    if (isNaN(rate) || rate < 0) {
      return res.status(400).json({ success: false, message: 'Fine rate per day must be a valid non-negative number' });
    }

    const loanDays = parseInt(default_loan_days, 10);
    if (isNaN(loanDays) || loanDays <= 0) {
      return res.status(400).json({ success: false, message: 'Default loan duration must be a positive integer (minimum 1 day)' });
    }

    const updateStmt = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
    updateStmt.run(rate.toFixed(2), 'fine_rate_per_day');
    updateStmt.run(loanDays.toString(), 'default_loan_days');

    res.json({
      success: true,
      message: `Fine rule updated: $${rate.toFixed(2)}/day, ${loanDays} days default loan period`,
      data: {
        fine_rate_per_day: rate,
        default_loan_days: loanDays
      }
    });
  } catch (error) {
    console.error('Update fine settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update fine settings' });
  }
});

// POST /api/fines/:id/pay - Mark fine as paid
router.post('/:id/pay', (req, res) => {
  try {
    const fineId = parseInt(req.params.id, 10);
    const { notes } = req.body;

    const fine = db.prepare('SELECT * FROM fines WHERE id = ?').get(fineId);
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine record not found' });
    }

    if (fine.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'This fine has already been paid' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const finalNotes = notes ? notes.trim() : 'Payment received';

    db.prepare(`
      UPDATE fines 
      SET status = 'PAID', paid_date = ?, notes = ?
      WHERE id = ?
    `).run(todayStr, finalNotes, fineId);

    const updated = db.prepare('SELECT * FROM fines WHERE id = ?').get(fineId);

    res.json({
      success: true,
      message: `Fine of $${fine.amount.toFixed(2)} marked as PAID`,
      data: updated
    });
  } catch (error) {
    console.error('Pay fine error:', error);
    res.status(500).json({ success: false, message: 'Failed to process fine payment' });
  }
});

// POST /api/fines/:id/waive - Waive a fine
router.post('/:id/waive', (req, res) => {
  try {
    const fineId = parseInt(req.params.id, 10);
    const { notes } = req.body;

    const fine = db.prepare('SELECT * FROM fines WHERE id = ?').get(fineId);
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine record not found' });
    }

    if (fine.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Cannot waive an already paid fine' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const finalNotes = notes ? notes.trim() : 'Waived by administrator';

    db.prepare(`
      UPDATE fines 
      SET status = 'WAIVED', paid_date = ?, notes = ?
      WHERE id = ?
    `).run(todayStr, finalNotes, fineId);

    const updated = db.prepare('SELECT * FROM fines WHERE id = ?').get(fineId);

    res.json({
      success: true,
      message: `Fine of $${fine.amount.toFixed(2)} was successfully WAIVED`,
      data: updated
    });
  } catch (error) {
    console.error('Waive fine error:', error);
    res.status(500).json({ success: false, message: 'Failed to waive fine' });
  }
});

module.exports = router;
