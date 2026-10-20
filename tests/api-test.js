const app = require('../backend/server');
const http = require('http');

let server;
let authToken = null;
const PORT = 3099;

function request(method, path, body = null, token = authToken) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
        }
      },
      res => {
        let rawData = '';
        res.on('data', chunk => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: rawData });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

let failures = 0;
function check(name, condition, extra = '') {
  console.log(`[${condition ? 'PASS' : 'FAIL'}] ${name}${extra ? ' - ' + extra : ''}`);
  if (!condition) failures++;
}

async function runTests() {
  console.log('--- Starting API Route Verification ---');
  server = app.listen(PORT);

  try {
    // 1. Health (public)
    const health = await request('GET', '/api/health');
    check('/api/health', health.status === 200);

    // 2. Auth: protected routes reject anonymous requests
    const anon = await request('GET', '/api/dashboard', null, null);
    check('Anonymous request rejected', anon.status === 401, `status ${anon.status}`);

    // 3. Auth: wrong password rejected
    const badLogin = await request('POST', '/api/auth/login', { username: 'admin', password: 'wrong' }, null);
    check('Wrong password rejected', badLogin.status === 401);

    // 4. Auth: librarian login
    const login = await request('POST', '/api/auth/login', { username: 'admin', password: 'admin123' }, null);
    authToken = login.data && login.data.data && login.data.data.token;
    check('Librarian login', login.status === 200 && !!authToken);
    if (!authToken) throw new Error('Cannot continue without auth token');

    const me = await request('GET', '/api/auth/me');
    check('/api/auth/me', me.status === 200 && me.data.data.role === 'LIBRARIAN');

    // 5. Dashboard
    const dashboard = await request('GET', '/api/dashboard');
    check('/api/dashboard', dashboard.status === 200, `Total Books: ${dashboard.data.data && dashboard.data.data.totalTitles}`);

    // 6. Books listing
    const books = await request('GET', '/api/books');
    check('/api/books', books.status === 200, `Count: ${books.data.count}`);

    // 7. Duplicate ISBN rejection test
    const dupBook = await request('POST', '/api/books', {
      title: 'Test Clean Code Duplicate',
      author: 'Test Author',
      isbn: '978-0132350884', // already exists in seed
      category: 'Computer Science',
      total_copies: 2
    });
    check('Duplicate ISBN rejection', dupBook.status === 400);

    // 8. Members listing
    const members = await request('GET', '/api/members');
    check('/api/members', members.status === 200, `Count: ${members.data.count}`);

    // 9. Active issues
    const activeIssues = await request('GET', '/api/issues/active');
    check('/api/issues/active', activeIssues.status === 200, `Count: ${activeIssues.data.count}`);

    // 10. Fines listing
    const fines = await request('GET', '/api/fines');
    check('/api/fines', fines.status === 200, `Count: ${fines.data.count}`);

    // 11. Transactions listing
    const transactions = await request('GET', '/api/transactions');
    check('/api/transactions', transactions.status === 200, `Count: ${transactions.data.count}`);

    // 12. Friendly database error messages
    const { dbErrorMessage } = require('../backend/dbErrors');
    const db = require('../database/db');
    const tryDb = sql => { try { db.exec(`SAVEPOINT t; ${sql}`); return null; } catch (e) { return e; } finally { db.exec('ROLLBACK TO t; RELEASE t'); } };
    const negCopies = dbErrorMessage(tryDb('UPDATE books SET available_copies = total_copies + 1 WHERE id = 1'));
    check('Friendly CHECK message', negCopies && negCopies.status === 400 && /cannot be more than/.test(negCopies.message), negCopies && negCopies.message);
    const dupIsbn = dbErrorMessage(tryDb("INSERT INTO books (title, author, isbn, category, total_copies, available_copies) SELECT 'x','y',isbn,'z',1,1 FROM books LIMIT 1"));
    check('Friendly UNIQUE message', dupIsbn && dupIsbn.status === 409 && /ISBN/.test(dupIsbn.message), dupIsbn && dupIsbn.message);
    const fk = dbErrorMessage(tryDb('DELETE FROM members WHERE id = (SELECT member_id FROM transactions LIMIT 1)'));
    check('Friendly FOREIGN KEY message', fk && fk.status === 409 && /linked/.test(fk.message), fk && fk.message);
    check('Non-DB errors ignored', dbErrorMessage(new Error('boom')) === null);
  } catch (err) {
    console.error('API Test Error:', err);
    failures++;
  } finally {
    server.close();
  }

  if (failures) {
    console.log(`--- ${failures} API check(s) FAILED ---`);
    process.exitCode = 1;
  } else {
    console.log('--- All API Verifications Passed Successfully ---');
  }
}

runTests();
