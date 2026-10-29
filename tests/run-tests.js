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

const TEST_PORT = process.env.TEST_PORT || 3888;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// All valid test IDs in the system
const VALID_TEST_IDS = TEST_DEFINITIONS.map(t => t.id);

// Parse CLI flags
const args = process.argv.slice(2);
let targetPart = 'all'; // 'a', 'b', 'all', or test id
let isHeaded = false;
let filterTestIds = null;
let stepDelay = 0;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--all') {
    targetPart = 'all';
  } else if (arg === '--part-a' || arg === '--part=a' || arg === '-a') {
    targetPart = 'a';
  } else if (arg === '--part-b' || arg === '--part=b' || arg === '-b') {
    targetPart = 'b';
  } else if (arg.startsWith('--part=')) {
    targetPart = arg.split('=')[1].toLowerCase();
  } else if (arg === '--headed' || arg === '--demo') {
    isHeaded = true;
  } else if (arg.startsWith('--delay=')) {
    stepDelay = parseInt(arg.split('=')[1], 10) || 0;
  } else if (arg.startsWith('--test=') || arg.startsWith('--id=') || arg.startsWith('--case=')) {
    const rawVal = arg.split('=')[1];
    filterTestIds = rawVal.split(',').map(s => s.trim().toUpperCase());
  } else if (arg === '--test' || arg === '--id' || arg === '--case' || arg === '-t') {
    if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
      filterTestIds = args[i + 1].split(',').map(s => s.trim().toUpperCase());
      i++;
    } else {
      console.error(`\n[ERROR] Missing test ID argument after ${arg}.`);
      console.error(`Usage: npm run test:case -- <TEST_ID>`);
      console.error(`Example: npm run test:case -- TC001\n`);
      process.exit(1);
    }
  } else if (/^TC\d{3}$/i.test(arg)) {
    filterTestIds = [arg.trim().toUpperCase()];
  } else if (!arg.startsWith('-')) {
    // Non-flag argument, assume test ID
    filterTestIds = [arg.trim().toUpperCase()];
  }
}

// When in visual demo mode without explicit delay, add a 250ms breather between tests
if (isHeaded && stepDelay === 0 && !args.some(a => a.startsWith('--delay='))) {
  stepDelay = 250;
}

// Validate supplied test IDs
if (filterTestIds && filterTestIds.length > 0) {
  const invalidIds = filterTestIds.filter(id => !VALID_TEST_IDS.includes(id));
  if (invalidIds.length > 0) {
    console.error(`\n========================================================================`);
    console.error(`[ERROR] Invalid test ID(s): ${invalidIds.join(', ')}`);
    console.error(`Valid test IDs are TC001 through TC100.`);
    console.error(`Example usage: npm run test:case -- TC001`);
    console.error(`========================================================================\n`);
    process.exit(1);
  }
  targetPart = filterTestIds.length === 1 ? filterTestIds[0].toLowerCase() : 'custom';
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function run() {
  console.log('========================================================================');
  console.log('     ATHENA LIBRARY MANAGEMENT SYSTEM - 100 AUTOMATED TEST RUNNER       ');
  console.log('          DA3 Testing Assignment | JavaScript + Selenium WebDriver      ');
  console.log('========================================================================');
  const scopeLabel = filterTestIds
    ? `Custom Test Filter (${filterTestIds.join(', ')})`
    : targetPart === 'all'
    ? 'ALL 100 TESTS (Part A + Part B)'
    : `PART ${targetPart.toUpperCase()} (50 Tests)`;
  console.log(`Execution Scope: ${scopeLabel}`);
  console.log(`Execution Mode : ${isHeaded ? 'LIVE VISUAL DEMO (Headed Chrome Window)' : 'HEADLESS (Background Execution)'}\n`);

  // 1. Reset Database with Seed Data
  console.log('[1/4] Seeding test database with pristine test state...');
  seedDatabase();

  // 2. Start Application Server on isolated test port
  console.log(`\n[2/4] Starting isolated test server on port ${TEST_PORT}...`);
  let server;
  try {
    server = await new Promise((resolve, reject) => {
      const s = app.listen(TEST_PORT, () => {
        console.log(`Server listening on ${BASE_URL}`);
        resolve(s);
      });
      s.on('error', reject);
    });
  } catch (err) {
    console.error(`[ERROR] Failed to start test server on port ${TEST_PORT}:`, err.message);
    process.exit(1);
  }

  // 3. Initialize Chrome WebDriver
  console.log(`\n[3/4] Initializing Chrome WebDriver (${isHeaded ? 'Headed Window' : 'Headless'})...`);
  const options = new chrome.Options();
  if (!isHeaded) {
    //options.addArguments('--headless=new');
  }
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1280,900');

  let driver;
  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  const executionRecords = [];

  // Filter tests based on target scope
  const selectedTests = TEST_DEFINITIONS.filter(t => {
    if (filterTestIds && filterTestIds.length > 0) {
      return filterTestIds.includes(t.id);
    }
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
      const startMs = Date.now();
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
        duration: '0.000',
        error: null
      };

      try {
        const result = await test.fn(suiteA, suiteB);
        const durationSec = ((Date.now() - startMs) / 1000).toFixed(3);
        record.duration = durationSec;
        record.status = 'PASSED';
        record.actual = (result && result.actual) || test.expected;
        if (result && result.evidence) {
          record.evidence = result.evidence;
        } else {
          const picName = `${test.id}.png`;
          try {
            await takeScreenshot(driver, picName);
            record.evidence = picName;
          } catch {
            record.evidence = '-';
          }
        }
        passedCount++;
        console.log(`[PASS] (${durationSec}s)`);

        if (stepDelay > 0) {
          await new Promise(r => setTimeout(r, stepDelay));
        }
      } catch (err) {
        const durationSec = ((Date.now() - startMs) / 1000).toFixed(3);
        record.duration = durationSec;
        record.status = 'FAILED';
        record.actual = `Error: ${err.message}`;
        record.error = err.message;
        failedCount++;
        console.log(`[FAIL] (${durationSec}s)`);
        console.error(`         -> Error: ${err.message.split('\n')[0]}`);

        // Capture evidence screenshot on failure
        const failPic = `FAIL_${test.id}.png`;
        try {
          await takeScreenshot(driver, failPic);
          record.evidence = failPic;
        } catch {
          record.evidence = '-';
        }
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

    if (server) {
      console.log('Stopping test server...');
      try { server.close(); } catch {}
    }
  }

  // Generate Reports
  const resultsDir = path.join(__dirname, '..', 'test-results');
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  const fileKey = targetPart === 'all' ? 'all' : targetPart.toLowerCase();

  // 1. JSON Execution Record
  const jsonPath = path.join(resultsDir, `execution-record-${fileKey}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(executionRecords, null, 2));

  // 2. Markdown Execution Record matching Assignment PDF table format
  let markdown = `# Athena Library Management System - Selenium Automation Execution Record\n\n`;
  markdown += `**Execution Date:** ${new Date().toISOString()}\n`;
  markdown += `**Scope:** ${scopeLabel}\n`;
  markdown += `**Summary:** Total: ${executionRecords.length} | Passed: ${passedCount} | Failed: ${failedCount} | Skipped: ${skippedCount}\n\n`;
  markdown += `| Test ID | Category | Preconditions | Test Data | Expected Result | Actual Result | Status | Duration | Evidence |\n`;
  markdown += `| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |\n`;

  executionRecords.forEach(r => {
    const statusBadge = r.status === 'PASSED' ? '**PASS**' : '**FAIL**';
    const evidenceLink = r.evidence !== '-' ? `[${r.evidence}](screenshots/${r.evidence})` : '-';
    markdown += `| ${r.id} | ${r.category} | ${r.preconditions} | ${r.testData} | ${r.expected} | ${r.actual} | ${statusBadge} | ${r.duration}s | ${evidenceLink} |\n`;
  });

  const mdPath = path.join(resultsDir, `execution-record-${fileKey}.md`);
  fs.writeFileSync(mdPath, markdown);

  // 3. JUnit XML Report
  const xmlPath = path.join(resultsDir, `junit-${fileKey}.xml`);
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<testsuites name="Athena LMS Automation Suite" tests="${executionRecords.length}" failures="${failedCount}" errors="0" skipped="${skippedCount}">\n`;
  xml += `  <testsuite name="${escapeXml(scopeLabel)}" tests="${executionRecords.length}" failures="${failedCount}" errors="0" skipped="${skippedCount}" timestamp="${new Date().toISOString()}">\n`;
  executionRecords.forEach(r => {
    xml += `    <testcase classname="${escapeXml(r.category)}" name="${escapeXml(r.id + ': ' + r.name)}" time="${r.duration}">\n`;
    if (r.status === 'FAILED') {
      xml += `      <failure message="${escapeXml(r.error || r.actual)}">${escapeXml(r.error || r.actual)}</failure>\n`;
    } else if (r.status === 'SKIPPED') {
      xml += `      <skipped/>\n`;
    }
    xml += `    </testcase>\n`;
  });
  xml += `  </testsuite>\n`;
  xml += `</testsuites>\n`;
  fs.writeFileSync(xmlPath, xml, 'utf8');

  // Format summary line matching Phase 7 format
  let summaryLine = '';
  if (targetPart === 'a') {
    summaryLine = `PART A: TOTAL ${selectedTests.length} | PASSED ${passedCount} | FAILED ${failedCount} | SKIPPED ${skippedCount}`;
  } else if (targetPart === 'b') {
    summaryLine = `PART B: TOTAL ${selectedTests.length} | PASSED ${passedCount} | FAILED ${failedCount} | SKIPPED ${skippedCount}`;
  } else if (targetPart === 'all') {
    summaryLine = `ALL TESTS: TOTAL ${selectedTests.length} | PASSED ${passedCount} | FAILED ${failedCount} | SKIPPED ${skippedCount}`;
  } else if (filterTestIds && filterTestIds.length === 1) {
    summaryLine = `TEST ${filterTestIds[0]}: TOTAL ${selectedTests.length} | PASSED ${passedCount} | FAILED ${failedCount} | SKIPPED ${skippedCount}`;
  } else {
    summaryLine = `TESTS: TOTAL ${selectedTests.length} | PASSED ${passedCount} | FAILED ${failedCount} | SKIPPED ${skippedCount}`;
  }

  // Print Summary Report
  console.log('\n========================================================================');
  console.log('                          TEST EXECUTION REPORT                         ');
  console.log('========================================================================');
  console.log(summaryLine);
  console.log('------------------------------------------------------------------------');
  console.log(`TOTAL EXECUTED : ${executionRecords.length}`);
  console.log(`PASSED         : ${passedCount}`);
  console.log(`FAILED         : ${failedCount}`);
  console.log(`SKIPPED        : ${skippedCount}`);
  console.log('------------------------------------------------------------------------');
  console.log(`JSON Report Saved     : ${jsonPath}`);
  console.log(`Markdown Report Saved : ${mdPath}`);
  console.log(`JUnit XML Saved       : ${xmlPath}`);
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
