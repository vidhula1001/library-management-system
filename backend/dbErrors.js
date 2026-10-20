// ==========================================================================
// Translates low-level SQLite constraint errors into friendly, user-facing
// messages. Returns null for non-database errors so callers can fall back
// to their own default message.
// ==========================================================================

const CHECK_MESSAGES = [
  [/available_copies <= total_copies/, 'Available copies cannot be more than the total number of copies.'],
  [/available_copies >= 0/, 'No copies of this book are available.'],
  [/total_copies >= 1/, 'A book must have at least 1 copy.'],
  [/due_date >= issue_date/, 'The due date cannot be before the issue date.'],
  [/return_date IS NULL OR return_date >= issue_date/, 'The return date cannot be before the issue date.'],
  [/status = 'RETURNED'/, 'Returned books must have a return date.'],
  [/amount >= 0/, 'Fine amount cannot be negative.'],
  [/days_overdue >= 0/, 'Overdue days cannot be negative.'],
  [/role IN/, 'Role must be either Librarian or Member.'],
  [/status IN \('ACTIVE'/, 'Member status must be Active or Inactive.'],
  [/status IN \('ISSUED'/, 'Transaction status must be Issued or Returned.'],
  [/status IN \('PENDING'/, 'Fine status must be Pending, Paid or Waived.']
];

const UNIQUE_MESSAGES = {
  'books.isbn': 'A book with this ISBN already exists.',
  'members.email': 'A member with this email address already exists.',
  'members.member_code': 'This member code is already in use.',
  'users.username': 'This username is already taken.',
  'users.member_id': 'This member already has a login account.',
  'fines.transaction_id': 'A fine has already been recorded for this transaction.'
};

function dbErrorMessage(error) {
  if (!error || typeof error.code !== 'string' || !error.code.startsWith('SQLITE_CONSTRAINT')) {
    return null;
  }
  const msg = error.message || '';
  // ON DELETE RESTRICT violations are reported as SQLITE_CONSTRAINT_TRIGGER
  const code = /FOREIGN KEY constraint failed/.test(msg) ? 'SQLITE_CONSTRAINT_FOREIGNKEY' : error.code;

  switch (code) {
    case 'SQLITE_CONSTRAINT_CHECK': {
      const match = CHECK_MESSAGES.find(([pattern]) => pattern.test(msg));
      return { status: 400, message: match ? match[1] : 'Some of the values entered are not valid.' };
    }
    case 'SQLITE_CONSTRAINT_UNIQUE':
    case 'SQLITE_CONSTRAINT_PRIMARYKEY': {
      const column = Object.keys(UNIQUE_MESSAGES).find(key => msg.includes(key));
      return { status: 409, message: column ? UNIQUE_MESSAGES[column] : 'This record already exists.' };
    }
    case 'SQLITE_CONSTRAINT_FOREIGNKEY':
      return {
        status: 409,
        message: 'This action is not allowed because the record is linked to other records (e.g. books still on loan or unpaid fines).'
      };
    case 'SQLITE_CONSTRAINT_NOTNULL':
      return { status: 400, message: 'A required field is missing.' };
    default:
      return { status: 400, message: 'The data entered breaks a database rule.' };
  }
}

// Sends a JSON error response, using a friendly DB message when available.
function sendError(res, error, fallbackMessage, fallbackStatus = 500) {
  const friendly = dbErrorMessage(error);
  if (friendly) {
    return res.status(friendly.status).json({ success: false, message: friendly.message });
  }
  return res.status(fallbackStatus).json({ success: false, message: fallbackMessage });
}

module.exports = { dbErrorMessage, sendError };
