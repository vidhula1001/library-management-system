// ==========================================================================
// Auth Routes: /api/auth
// Handles login, logout, and session verification
// ==========================================================================

const express = require('express');
const crypto = require('crypto');
const db = require('../../database/db');
const { createToken, requireAuth } = require('../authMiddleware');

const router = express.Router();

// Helper: hash password with stored salt using the same algo as db.js
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// --------------------------------------------------------------------------
// POST /api/auth/login
// Body: { username, password }
// --------------------------------------------------------------------------
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const trimmedUsername = String(username).trim();
  const trimmedPassword = String(password);

  // Look up user
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(trimmedUsername);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  // Verify password
  const hash = hashPassword(trimmedPassword, user.salt);
  const isValid = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(user.password_hash));

  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  // If MEMBER user, fetch their member record for extra info
  let memberInfo = null;
  if (user.role === 'MEMBER' && user.member_id) {
    memberInfo = db.prepare('SELECT member_code, name, email FROM members WHERE id = ?').get(user.member_id);
  }

  // Issue token
  const tokenPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    memberId: user.member_id || null
  };

  const token = createToken(tokenPayload);

  return res.json({
    success: true,
    message: 'Login successful.',
    data: {
      token,
      role: user.role,
      username: user.username,
      memberId: user.member_id || null,
      memberName: memberInfo ? memberInfo.name : null,
      memberCode: memberInfo ? memberInfo.member_code : null
    }
  });
});

// --------------------------------------------------------------------------
// POST /api/auth/logout
// Stateless — client drops token. Server just acknowledges.
// --------------------------------------------------------------------------
router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// --------------------------------------------------------------------------
// GET /api/auth/me
// Returns current user info based on token (requires valid auth)
// --------------------------------------------------------------------------
router.get('/me', requireAuth, (req, res) => {
  const user = req.user;

  let memberInfo = null;
  if (user.role === 'MEMBER' && user.memberId) {
    memberInfo = db.prepare('SELECT member_code, name, email FROM members WHERE id = ?').get(user.memberId);
  }

  return res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      role: user.role,
      memberId: user.memberId,
      memberName: memberInfo ? memberInfo.name : null,
      memberCode: memberInfo ? memberInfo.member_code : null
    }
  });
});

module.exports = router;
