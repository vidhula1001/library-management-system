// ==========================================================================
// Authentication Middleware
// Token-based auth using Node.js built-in crypto (no external packages)
// Token format: base64(header).base64(payload).HMAC-SHA256-signature
// ==========================================================================

const crypto = require('crypto');

// Secret key for signing tokens – in production, use an env variable
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'athena_lms_secret_key_2024_do_not_share';

/**
 * Creates a signed auth token for a user.
 * @param {Object} payload - { id, username, role, memberId }
 * @param {number} expiresInSeconds - Token TTL (default 8 hours)
 */
function createToken(payload, expiresInSeconds = 8 * 60 * 60) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * Verifies a token and returns the payload, or null if invalid/expired.
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;

  // Verify signature
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  // Decode payload
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  // Check expiry
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    return null; // Token expired
  }

  return payload;
}

/**
 * Express middleware: requires a valid Bearer token.
 * Attaches req.user = { id, username, role, memberId } on success.
 * Returns 401 if missing or invalid.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }

  req.user = {
    id: payload.id,
    username: payload.username,
    role: payload.role,
    memberId: payload.memberId || null
  };

  next();
}

/**
 * Factory: creates a middleware that only allows specific roles.
 * Use after requireAuth.
 * @param {...string} roles - e.g. requireRole('LIBRARIAN') or requireRole('LIBRARIAN', 'MEMBER')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires ${roles.join(' or ')} role.`
      });
    }
    next();
  };
}

module.exports = { createToken, verifyToken, requireAuth, requireRole };
