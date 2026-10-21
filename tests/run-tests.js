const fs = require('fs');
const path = require('path');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const app = require('../backend/server');
const seedDatabase = require('../database/seed');
const { takeScreenshot, SCREENSHOT_DIR } = require('./helpers');
const PartATestSuite = require('./part-a.test');
const PartBTestSuite = require('./part-b.test');
const TEST_DEFINITIONS = require('./test-definitions');

const TEST_PORT = 3888;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Parse CLI flags
const args = process.argv.slice(2);
let targetPart = 'all'; // 'a', 'b', or 'all'
for (const arg of args) {
  if (arg.startsWith('--part=')) {
    targetPart = arg.split('=')[1].toLowerCase();
  } else if (arg === '--part-a') {
    targetPart = 'a';
  } else if (arg === '--part-b') {
    targetPart = 'b';
  } else if (arg === '--all') {
    targetPart = 'all';
  }
}

async function run() {
  console.log('========================================================================');
  console.log('     ATHENA LIBRARY MANAGEMENT SYSTEM - 100 AUTOMATED TEST RUNNER       ');
  console.log('          DA3 Testing Assignment | JavaScript + Selenium WebDriver      ');
  console.log('========================================================================');
  console.log(`Execution Scope: ${targetPart === 'all' ? 'ALL 100 TESTS (Part A + Part B)' : `PART ${targetPart.toUpperCase()} (50 Tests)`}\n`);

  // 1. Reset Database
  console.log('[1/4] Seeding test database with pristine test state...');
  seedDatabase();

  // 2. Start Application Server
  console.log(`\n[2/4] Starting isolated test server on port ${TEST_PORT}...`);
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
  const executionRecords = [];

  // Filter tests based on target scope
  const selectedTests = TEST_DEFINITIONS.filter(t => {
    if (targetPart === 'a') return t.id.localeCompare('TC051') < 0;
    if (targetPart === 'b') return t.id.localeCompare('TC050') > 0;
    return true; // 'all'
  });

  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    console.log('Chrome WebDriver launched successfully.\n');
    console.log(`[4/4] Executing ${selectedTests.length} Selenium Automation Test Cases...`);
    console.log('------------------------------------------------------------------------');

    const suiteA = new PartATestSuite(driver, BASE_URL);
    const suiteB = new PartBTestSuite(driver, BASE_URL);

    for (let i = 0; i < selectedTests.length; i++) {
      const test = selectedTests[i];
      process.stdout.write(`  [${(i + 1).toString().padStart(3, ' ')}/${selectedTests.length}] ${test.id}: ${test.name.padEnd(52, ' ')} `);

      const record = {
        id: test.id,
        category: test.category,
        name: test.name,
        preconditions: test.preconditions,
        testData: test.testData,
        expected: test.expected,
        actual: '',
        status: 'PENDING',
        evidence: '-',
        error: null
      };

      try {
        const result = await test.fn(suiteA, suiteB);
        record.status = 'PASSED';
        record.actual = (result && result.actual) || test.expected;
        if (result && result.evidence) {
          record.evidence = result.evidence;
        }
        passedCount++;
        console.log('[PASS]');
      } catch (err) {
        record.status = 'FAILED';
        record.actual = `Error: ${err.message}`;
        record.error = err.message;
        failedCount++;
        console.log('[FAIL]');
        console.log(`         -> Error: ${err.message}`);

        // Capture evidence screenshot on failure
        const failPic = `FAIL_${test.id}.png`;
        await takeScreenshot(driver, failPic);
        record.evidence = failPic;
      }

      executionRecords.push(record);
    }

  } catch (initErr) {
    console.error('Fatal initialization error:', initErr);
    failedCount++;
  } finally {
    // Teardown
    if (driver) {
      console.log('\nClosing Chrome WebDriver session...');
      try { await driver.quit(); } catch {}
    }

    console.log('Stopping test server...');
    try { server.close(); } catch {}
  }

  // Generate Reports
  const resultsDir = path.join(__dirname, '..', 'test-results');
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  // 1. JSON Execution Record
  fs.writeFileSync(
    path.join(resultsDir, `execution-record-${targetPart}.json`),
    JSON.stringify(executionRecords, null, 2)
  );

  // 2. Markdown Execution Record matching Assignment PDF table format
  let markdown = `# Athena Library Management System - Selenium Automation Execution Record\n\n`;
  markdown += `**Execution Date:** ${new Date().toISOString()}\n`;
  markdown += `**Scope:** ${targetPart.toUpperCase()} (${executionRecords.length} Test Cases)\n`;
  markdown += `**Summary:** Total: ${executionRecords.length} | Passed: ${passedCount} | Failed: ${failedCount}\n\n`;
  markdown += `| Test ID | Category | Preconditions | Test Data | Expected Result | Actual Result | Status | Evidence |\n`;
  markdown += `| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |\n`;

  executionRecords.forEach(r => {
    const statusBadge = r.status === 'PASSED' ? '**PASS**' : '**FAIL**';
    const evidenceLink = r.evidence !== '-' ? `[${r.evidence}](screenshots/${r.evidence})` : '-';
    markdown += `| ${r.id} | ${r.category} | ${r.preconditions} | ${r.testData} | ${r.expected} | ${r.actual} | ${statusBadge} | ${evidenceLink} |\n`;
  });

  const mdPath = path.join(resultsDir, `execution-record-${targetPart}.md`);
  fs.writeFileSync(mdPath, markdown);

  // Print Summary Report
  console.log('\n========================================================================');
  console.log('                          TEST EXECUTION REPORT                         ');
  console.log('========================================================================');
  console.log(`TOTAL EXECUTED : ${executionRecords.length}`);
  console.log(`PASSED         : ${passedCount}`);
  console.log(`FAILED         : ${failedCount}`);
  console.log('------------------------------------------------------------------------');
  console.log(`Markdown Report Saved : ${mdPath}`);
  console.log(`Screenshots Directory : ${SCREENSHOT_DIR}`);
  console.log('========================================================================\n');

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
