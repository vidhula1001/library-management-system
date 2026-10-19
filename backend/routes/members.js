const express = require('express');
const router = express.Router();
const db = require('../../database/db');

function isValidString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// GET /api/members - List all members with search and active loan count
router.get('/', (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        m.id,
        m.member_code,
        m.name,
        m.email,
        m.phone,
        m.membership_date,
        m.status,
        m.created_at,
        (
          SELECT COUNT(*) 
          FROM transactions t 
          WHERE t.member_id = m.id AND t.status = 'ISSUED'
        ) AS active_borrowed_count,
        (
          SELECT COALESCE(SUM(f.amount), 0)
          FROM fines f
          WHERE f.member_id = m.id AND f.status = 'PENDING'
        ) AS pending_fine_amount
      FROM members m
    `;
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += `
        WHERE m.member_code LIKE ? 
           OR m.name LIKE ? 
           OR m.email LIKE ? 
           OR m.phone LIKE ?
      `;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY m.name ASC';

    const members = db.prepare(query).all(...params);
    res.json({ success: true, count: members.length, data: members });
  } catch (error) {
    console.error('Fetch members error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve members' });
  }
});

// GET /api/members/:id - Get single member with their active borrowings
router.get('/:id', (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    const member = db.prepare(`
      SELECT 
        m.id,
        m.member_code,
        m.name,
        m.email,
        m.phone,
        m.membership_date,
        m.status,
        m.created_at
      FROM members m
      WHERE m.id = ?
    `).get(memberId);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Get active borrowings
    const activeLoans = db.prepare(`
      SELECT 
        t.id AS transaction_id,
        t.issue_date,
        t.due_date,
        b.id AS book_id,
        b.title,
        b.isbn
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      WHERE t.member_id = ? AND t.status = 'ISSUED'
    `).all(memberId);

    // Get pending fines
    const pendingFines = db.prepare(`
      SELECT 
        f.id AS fine_id,
        f.amount,
        f.days_overdue,
        f.status,
        f.created_at
      FROM fines f
      WHERE f.member_id = ? AND f.status = 'PENDING'
    `).all(memberId);

    res.json({
      success: true,
      data: {
        ...member,
        activeLoans,
        pendingFines
      }
    });
  } catch (error) {
    console.error('Fetch member error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve member details' });
  }
});

// POST /api/members - Register a new member
router.post('/', (req, res) => {
  try {
    let { member_code, name, email, phone, membership_date } = req.body;

    // Validation
    if (!isValidString(member_code)) {
      return res.status(400).json({ success: false, message: 'Member ID / Code is required and cannot be empty' });
    }
    if (!isValidString(name)) {
      return res.status(400).json({ success: false, message: 'Member name is required and cannot be empty' });
    }
    if (!isValidString(email)) {
      return res.status(400).json({ success: false, message: 'Email address is required and cannot be empty' });
    }
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address (e.g. name@example.com)' });
    }
    if (!isValidString(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number is required and cannot be empty' });
    }

    member_code = member_code.trim();
    name = name.trim();
    email = email.trim();
    phone = phone.trim();

    if (!membership_date || !membership_date.trim()) {
      membership_date = new Date().toISOString().split('T')[0];
    } else {
      membership_date = membership_date.trim();
    }

    // Check unique member_code
    const existingCode = db.prepare('SELECT id FROM members WHERE LOWER(member_code) = LOWER(?)').get(member_code);
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `Member ID / Code "${member_code}" is already in use by another member`
      });
    }

    // Check unique email
    const existingEmail = db.prepare('SELECT id FROM members WHERE LOWER(email) = LOWER(?)').get(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Email address "${email}" is already registered to another member`
      });
    }

    const insertStmt = db.prepare(`
      INSERT INTO members (member_code, name, email, phone, membership_date, status)
      VALUES (?, ?, ?, ?, ?, 'ACTIVE')
    `);

    const result = insertStmt.run(member_code, name, email, phone, membership_date);
    const newMember = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: `Member "${name}" (${member_code}) registered successfully`,
      data: newMember
    });
  } catch (error) {
    console.error('Register member error:', error);
    res.status(500).json({ success: false, message: 'Failed to register member' });
  }
});

// PUT /api/members/:id - Update member details
router.put('/:id', (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    const existingMember = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);

    if (!existingMember) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    let { name, email, phone, status } = req.body;

    if (!isValidString(name)) {
      return res.status(400).json({ success: false, message: 'Member name is required and cannot be empty' });
    }
    if (!isValidString(email)) {
      return res.status(400).json({ success: false, message: 'Email address is required and cannot be empty' });
    }
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!isValidString(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number is required and cannot be empty' });
    }

    name = name.trim();
    email = email.trim();
    phone = phone.trim();
    const updatedStatus = (status && status.trim() === 'INACTIVE') ? 'INACTIVE' : 'ACTIVE';

    // Check duplicate email for another member
    const emailConflict = db.prepare('SELECT id FROM members WHERE LOWER(email) = LOWER(?) AND id != ?').get(email, memberId);
    if (emailConflict) {
      return res.status(400).json({ success: false, message: `Email "${email}" is already used by another member` });
    }

    db.prepare(`
      UPDATE members
      SET name = ?, email = ?, phone = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, email, phone, updatedStatus, memberId);

    const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);

    res.json({
      success: true,
      message: 'Member profile updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ success: false, message: 'Failed to update member profile' });
  }
});

// DELETE /api/members/:id - Delete member
router.delete('/:id', (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // 1. Business rule: Cannot delete member with active borrowed books
    const activeLoans = db.prepare("SELECT COUNT(*) AS count FROM transactions WHERE member_id = ? AND status = 'ISSUED'").get(memberId);
    if (activeLoans && activeLoans.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete member "${member.name}". Member currently has ${activeLoans.count} active borrowed book(s).`
      });
    }

    // 2. Business rule: Cannot delete member with pending unpaid fines
    const pendingFines = db.prepare("SELECT COUNT(*) AS count FROM fines WHERE member_id = ? AND status = 'PENDING'").get(memberId);
    if (pendingFines && pendingFines.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete member "${member.name}". Member has ${pendingFines.count} unpaid fine(s). Clear fines before deletion.`
      });
    }

    // 3. Business rule: Foreign key protection for past transactions
    const pastTx = db.prepare('SELECT COUNT(*) AS count FROM transactions WHERE member_id = ?').get(memberId);
    if (pastTx && pastTx.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete member "${member.name}" because they have ${pastTx.count} past transaction record(s).`
      });
    }

    db.prepare('DELETE FROM members WHERE id = ?').run(memberId);

    res.json({
      success: true,
      message: `Member "${member.name}" (${member.member_code}) deleted successfully`
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete member' });
  }
});

module.exports = router;
