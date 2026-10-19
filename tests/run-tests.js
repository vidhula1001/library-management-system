const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const app = require('../backend/server');
const seedDatabase = require('../database/seed');
const LibraryTestSuite = require('./library.test');

const TEST_PORT = 3888;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function run() {
  console.log('===============================================================');
  console.log('   ATHENA LIBRARY MANAGEMENT SYSTEM - AUTOMATED TEST RUNNER    ');
  console.log('===============================================================');

  // 1. Reset Database with Seed Data
  console.log('\n[1/4] Seeding test database...');
  seedDatabase();

  // 2. Start Application Server
  console.log('\n[2/4] Starting test server on port ' + TEST_PORT + '...');
  const server = await new Promise((resolve) => {
    const s = app.listen(TEST_PORT, () => {
      console.log(`Server listening on ${BASE_URL}`);
      resolve(s);
    });
  });

  // 3. Initialize Headless Chrome WebDriver
  console.log('\n[3/4] Initializing Chrome WebDriver...');
  const options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1280,900');

  let driver;
  let passedCount = 0;
  let failedCount = 0;
  const testResults = [];

  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    console.log('Chrome WebDriver launched successfully.\n');
    console.log('[4/4] Executing Selenium WebDriver Test Suite...');
    console.log('---------------------------------------------------------------');

    const suite = new LibraryTestSuite(driver, BASE_URL);

    const tests = [
      { name: 'Dashboard Initialization & Statistics', fn: () => suite.testDashboard() },
      { name: 'Book Catalog CRUD & Duplicate ISBN Validation', fn: () => suite.testBookManagement() },
      { name: 'Member Directory & Email Validation', fn: () => suite.testMemberManagement() },
      { name: 'Book Issue Circulation Flow', fn: () => suite.testIssueBook() },
      { name: 'Business Rule: Prevent Duplicate Active Loan', fn: () => suite.testDuplicateIssuePrevention() },
      { name: 'Book Return Flow & History Synchronization', fn: () => suite.testReturnBook() },
      { name: 'Fine Rule Configuration & Ledger', fn: () => suite.testFineManagement() }
    ];

    for (const test of tests) {
      try {
        await test.fn();
        testResults.push({ name: test.name, status: 'PASSED' });
        passedCount++;
      } catch (err) {
        console.error(`     [FAIL] ${test.name}:`, err.message);
        testResults.push({ name: test.name, status: 'FAILED', error: err.message });
        failedCount++;
      }
    }

  } catch (initErr) {
    console.error('Fatal initialization error:', initErr);
    failedCount++;
  } finally {
    // Teardown
    if (driver) {
      console.log('\nClosing Chrome WebDriver session...');
      await driver.quit();
    }

    console.log('Stopping test server...');
    server.close();
  }

  // Print Test Summary Report
  console.log('\n===============================================================');
  console.log('                     TEST EXECUTION REPORT                     ');
  console.log('===============================================================');
  testResults.forEach((t, i) => {
    const symbol = t.status === 'PASSED' ? '✔ PASS' : '✖ FAIL';
    console.log(`${(i + 1).toString().padStart(2)}. [${symbol}] ${t.name}`);
    if (t.error) {
      console.log(`     Error: ${t.error}`);
    }
  });

  console.log('---------------------------------------------------------------');
  console.log(`TOTAL: ${testResults.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log('===============================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  run();
}

module.exports = run;
