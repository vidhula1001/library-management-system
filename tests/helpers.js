const { By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-results', 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Wait for an element to be located and visible
async function waitForElement(driver, locator, timeout = 5000) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

// Wait until an element's text content is non-empty
async function waitForText(driver, locator, timeout = 5000) {
  await driver.wait(async () => {
    try {
      const el = await driver.findElement(locator);
      const text = await el.getText();
      return text && text.trim().length > 0;
    } catch {
      return false;
    }
  }, timeout);
}

// Small sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Save a screenshot for test evidence
async function takeScreenshot(driver, filename) {
  try {
    const data = await driver.takeScreenshot();
    const filePath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(filePath, data, 'base64');
    return filePath;
  } catch (err) {
    console.warn(`[Screenshot Error] Could not capture ${filename}:`, err.message);
    return null;
  }
}

// Login as Librarian
async function loginAsLibrarian(driver, baseUrl, username = 'admin', password = 'admin123') {
  await driver.get(`${baseUrl}/login.html`);
  await sleep(200);

  // Ensure Librarian role tab is selected
  try {
    const libBtn = await waitForElement(driver, By.id('login-role-librarian'), 3000);
    await libBtn.click();
    await sleep(100);
  } catch {
    // Already on default role
  }

  const userInput = await waitForElement(driver, By.id('login-input-username'));
  const passInput = await waitForElement(driver, By.id('login-input-password'));
  const submitBtn = await waitForElement(driver, By.id('btn-login-submit'));

  await userInput.clear();
  await userInput.sendKeys(username);
  await passInput.clear();
  await passInput.sendKeys(password);
  await submitBtn.click();

  // Wait for dashboard to load
  await waitForElement(driver, By.id('stat-total-books'), 5000);
  await sleep(200);
}

// Login as Member
async function loginAsMember(driver, baseUrl, memberCode = 'MEM-1001', password = 'alice.johnson@example.com') {
  await driver.get(`${baseUrl}/login.html`);
  await sleep(200);

  const memBtn = await waitForElement(driver, By.id('login-role-member'));
  await memBtn.click();
  await sleep(150);

  const userInput = await waitForElement(driver, By.id('login-input-username'));
  const passInput = await waitForElement(driver, By.id('login-input-password'));
  const submitBtn = await waitForElement(driver, By.id('btn-login-submit'));

  await userInput.clear();
  await userInput.sendKeys(memberCode);
  await passInput.clear();
  await passInput.sendKeys(password);
  await submitBtn.click();

  // Wait for member view to load
  await waitForElement(driver, By.id('top-bar-user-chip'), 5000);
  await sleep(200);
}

// Logout
async function logout(driver, baseUrl) {
  try {
    const logoutBtn = await driver.findElement(By.id('btn-logout'));
    await logoutBtn.click();
    await waitForElement(driver, By.id('form-login'), 5000);
  } catch {
    // If not on page, navigate directly to login
    await driver.get(`${baseUrl}/login.html`);
  }
  await sleep(200);
}

// Close any open modals to ensure a clean state
async function closeAnyModal(driver) {
  try {
    await driver.executeScript(`
      document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
    `);
    await sleep(100);
  } catch {}
}

// Ensure librarian is logged in before performing operations
async function ensureLibrarianLoggedIn(driver, baseUrl) {
  try {
    const url = await driver.getCurrentUrl();
    if (url.includes('/index.html')) {
      const userChip = await driver.findElement(By.id('top-bar-user-chip'));
      const chipText = await userChip.getText();
      if (chipText.toLowerCase().includes('librarian') || chipText.toLowerCase().includes('admin')) {
        return;
      }
    }
  } catch {}
  await loginAsLibrarian(driver, baseUrl, 'admin', 'admin123');
}

// Ensure user is on a specific tab in the librarian view
async function ensureTab(driver, baseUrl, tabName) {
  await closeAnyModal(driver);
  await ensureLibrarianLoggedIn(driver, baseUrl);
  try {
    const section = await driver.findElement(By.id(`section-${tabName}`));
    if (await section.isDisplayed()) {
      return;
    }
  } catch {}
  const tab = await waitForElement(driver, By.id(`nav-tab-${tabName}`));
  await tab.click();
  await waitForElement(driver, By.id(`section-${tabName}`));
  await sleep(150);
}

// Ensure login page is displayed
async function ensureLoginPage(driver, baseUrl) {
  try {
    const url = await driver.getCurrentUrl();
    if (url.includes('login.html')) {
      const form = await driver.findElement(By.id('form-login'));
      if (await form.isDisplayed()) return;
    }
  } catch {}
  await driver.get(`${baseUrl}/login.html`);
  await waitForElement(driver, By.id('form-login'), 5000);
  await sleep(200);
}

// Ensure add book modal is open
async function ensureAddBookModalOpen(driver, baseUrl) {
  if (baseUrl) {
    await ensureTab(driver, baseUrl, 'books');
  }
  try {
    const modal = await driver.findElement(By.id('modal-book'));
    if (await modal.isDisplayed()) return;
  } catch {}
  const btn = await waitForElement(driver, By.id('btn-open-add-book-modal'));
  await btn.click();
  await waitForElement(driver, By.id('modal-book'));
  await sleep(150);
}

// Ensure add member modal is open
async function ensureAddMemberModalOpen(driver, baseUrl) {
  if (baseUrl) {
    await ensureTab(driver, baseUrl, 'members');
  }
  try {
    const modal = await driver.findElement(By.id('modal-member'));
    if (await modal.isDisplayed()) return;
  } catch {}
  const btn = await waitForElement(driver, By.id('btn-open-add-member-modal'));
  await btn.click();
  await waitForElement(driver, By.id('modal-member'));
  await sleep(150);
}

module.exports = {
  waitForElement,
  waitForText,
  sleep,
  takeScreenshot,
  loginAsLibrarian,
  loginAsMember,
  logout,
  closeAnyModal,
  ensureLibrarianLoggedIn,
  ensureTab,
  ensureLoginPage,
  ensureAddBookModalOpen,
  ensureAddMemberModalOpen,
  SCREENSHOT_DIR
};
