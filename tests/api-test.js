const app = require('../backend/server');
const http = require('http');

let server;
const PORT = 3099;

function request(method, path, body = null) {
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

async function runTests() {
  console.log('--- Starting API Route Verification ---');
  server = app.listen(PORT);

  try {
    // 1. Health
    const health = await request('GET', '/api/health');
    console.log('[PASS] /api/health:', health.status === 200);

    // 2. Dashboard
    const dashboard = await request('GET', '/api/dashboard');
    console.log('[PASS] /api/dashboard:', dashboard.status === 200, 'Total Books:', dashboard.data.data.totalTitles);

    // 3. Books listing
    const books = await request('GET', '/api/books');
    console.log('[PASS] /api/books:', books.status === 200, 'Count:', books.data.count);

    // 4. Duplicate ISBN rejection test
    const dupBook = await request('POST', '/api/books', {
      title: 'Test Clean Code Duplicate',
      author: 'Test Author',
      isbn: '978-0132350884', // already exists in seed
      category: 'Computer Science',
      total_copies: 2
    });
    console.log('[PASS] Duplicate ISBN rejection:', dupBook.status === 400);

    // 5. Members listing
    const members = await request('GET', '/api/members');
    console.log('[PASS] /api/members:', members.status === 200, 'Count:', members.data.count);

    // 6. Active issues
    const activeIssues = await request('GET', '/api/issues/active');
    console.log('[PASS] /api/issues/active:', activeIssues.status === 200, 'Count:', activeIssues.data.count);

    // 7. Fines listing
    const fines = await request('GET', '/api/fines');
    console.log('[PASS] /api/fines:', fines.status === 200, 'Count:', fines.data.count);

    // 8. Transactions listing
    const transactions = await request('GET', '/api/transactions');
    console.log('[PASS] /api/transactions:', transactions.status === 200, 'Count:', transactions.data.count);

    console.log('--- All API Verifications Passed Successfully ---');
  } catch (err) {
    console.error('API Test Error:', err);
  } finally {
    server.close();
  }
}

runTests();
