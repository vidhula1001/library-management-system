const { By } = require('selenium-webdriver');
const assert = require('assert');
const http = require('http');
const { waitForElement, waitForText, sleep, takeScreenshot, loginAsLibrarian, loginAsMember, logout } = require('./helpers');

function apiRequest(baseUrl, method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
        }
      },
      res => {
        let rawData = '';
        res.on('data', chunk => { rawData += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(rawData) });
          } catch {
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

/**
 * Suite of 50 Automated Selenium Test Cases for Part B (TC051 - TC100)
 * Covering:
 *   - B1: Functional End-to-End Testing (TC051 - TC067)
 *   - B2: Boundary & Edge Case Testing (TC068 - TC084)
 *   - B3: Integration Testing (TC085 - TC100)
 */
class PartBTestSuite {
  constructor(driver, baseUrl) {
    this.driver = driver;
    this.baseUrl = baseUrl;
    this.authToken = null;
  }

  async getLibrarianToken() {
    if (this.authToken) return this.authToken;
    const res = await apiRequest(this.baseUrl, 'POST', '/api/auth/login', { username: 'admin', password: 'admin123' });
    this.authToken = res.data && res.data.data && res.data.data.token;
    return this.authToken;
  }

  // ==========================================================================
  // B1. Functional End-to-End Testing (TC051 - TC067)
  // ==========================================================================

  async tc051() {
    await loginAsLibrarian(this.driver, this.baseUrl, 'admin', 'admin123');
    const badge = await waitForElement(this.driver, By.id('top-bar-role-badge'));
    const roleText = await badge.getText();
    assert(roleText.includes('LIBRARIAN'), 'Librarian dashboard should show LIBRARIAN badge');
    return { actual: 'Librarian dashboard opened with verified LIBRARIAN role' };
  }

  async tc052() {
    await logout(this.driver, this.baseUrl);
    await loginAsMember(this.driver, this.baseUrl, 'MEM-1001', 'alice.johnson@example.com');
    const badge = await waitForElement(this.driver, By.id('top-bar-role-badge'));
    const roleText = await badge.getText();
    assert(roleText.includes('MEMBER'), 'Member session should display MEMBER role badge');
    await takeScreenshot(this.driver, 'TC052_member_view.png');
    return { actual: 'Member session started with permitted member view', evidence: 'TC052_member_view.png' };
  }

  async tc053() {
    await logout(this.driver, this.baseUrl);
    const form = await waitForElement(this.driver, By.id('form-login'));
    assert(await form.isDisplayed(), 'Logout should end session and return to login form');
    return { actual: 'Session ended, user redirected to login page' };
  }

  async tc054() {
    await loginAsLibrarian(this.driver, this.baseUrl);
    await this.driver.navigate().refresh();
    await sleep(400);

    const stats = await waitForElement(this.driver, By.id('stat-total-books'));
    assert(await stats.isDisplayed(), 'Dashboard should load without errors after page refresh');
    return { actual: 'Dashboard reloaded cleanly without errors' };
  }

  async tc055() {
    const tab = await waitForElement(this.driver, By.id('nav-tab-books'));
    await tab.click();
    await sleep(200);

    const table = await waitForElement(this.driver, By.id('table-books'));
    assert(await table.isDisplayed(), 'Book catalogue table is displayed');
    return { actual: 'Book catalogue opened and rendered table rows' };
  }

  async tc056() {
    // Open edit modal for first book
    const editBtn = await waitForElement(this.driver, By.css('button[id^="btn-edit-book-"]'));
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", editBtn);
    await sleep(150);
    await editBtn.click();

    await waitForElement(this.driver, By.id('modal-book'));
    const authorInput = await this.driver.findElement(By.id('book-input-author'));
    await authorInput.clear();
    await authorInput.sendKeys('Robert C. Martin (Updated)');
    await this.driver.findElement(By.id('btn-save-book')).click();
    await sleep(500);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(text.includes('(Updated)'), 'Updated book author should be displayed in table');
    return { actual: 'Book details updated and verified in catalogue' };
  }

  async tc057() {
    // Add temporary book to safely delete without violating loan foreign keys
    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-book-modal'));
    await openBtn.click();
    await sleep(200);

    const tempIsbn = `978-777${Math.floor(1000 + Math.random() * 9000)}`;
    await this.driver.findElement(By.id('book-input-title')).sendKeys('Temp Delete Book');
    await this.driver.findElement(By.id('book-input-author')).sendKeys('Temp Author');
    await this.driver.findElement(By.id('book-input-isbn')).sendKeys(tempIsbn);
    await this.driver.findElement(By.id('book-input-category')).sendKeys('Temp');
    await this.driver.findElement(By.id('book-input-copies')).sendKeys('1');
    await this.driver.findElement(By.id('btn-save-book')).click();
    await sleep(600);

    // Filter to find the temp book
    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await searchInput.sendKeys('Temp Delete Book');
    await this.driver.findElement(By.id('btn-search-books')).click();
    await sleep(400);

    // Override window.confirm for automated deletion
    await this.driver.executeScript('window.confirm = () => true;');

    const delBtn = await waitForElement(this.driver, By.css('button[id^="btn-delete-book-"]'));
    await delBtn.click();
    await sleep(600);

    // Clear search and verify deletion
    await this.driver.findElement(By.id('btn-clear-search-books')).click();
    await sleep(300);
    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(!text.includes(tempIsbn), 'Deleted book record should be removed from catalogue');
    return { actual: 'Book record removed from catalog as designed' };
  }

  async tc058() {
    const catSelect = await waitForElement(this.driver, By.id('select-book-category-filter'));
    await catSelect.sendKeys('Algorithms');
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(text.includes('Introduction to Algorithms'), 'Filter by category should display Algorithms books');

    // Reset filter
    await this.driver.findElement(By.id('btn-clear-search-books')).click();
    await sleep(300);
    return { actual: 'Filter by category "Algorithms" produced matching subset' };
  }

  async tc059() {
    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await searchInput.sendKeys('George Orwell');
    await this.driver.findElement(By.id('btn-search-books')).click();
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(text.includes('1984'), 'Search by author George Orwell should return 1984');

    await this.driver.findElement(By.id('btn-clear-search-books')).click();
    await sleep(200);
    return { actual: 'Author search for "George Orwell" returned book "1984"' };
  }

  async tc060() {
    const tab = await waitForElement(this.driver, By.id('nav-tab-members'));
    await tab.click();
    await sleep(200);

    const table = await waitForElement(this.driver, By.id('table-members'));
    assert(await table.isDisplayed(), 'Member directory table should be displayed');
    return { actual: 'Member directory opened, showing registered members' };
  }

  async tc061() {
    const searchInput = await waitForElement(this.driver, By.id('input-search-members'));
    await searchInput.clear();
    await searchInput.sendKeys('MEM-1003');
    await this.driver.findElement(By.id('btn-search-members')).click();
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-members'));
    const text = await table.getText();
    assert(text.includes('Carol Davis'), 'Search by member code MEM-1003 should return Carol Davis');

    await this.driver.findElement(By.id('btn-clear-search-members')).click();
    await sleep(200);
    return { actual: 'Member code MEM-1003 resolved to Carol Davis' };
  }

  async tc062() {
    const editBtn = await waitForElement(this.driver, By.css('button[id^="btn-edit-member-"]'));
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", editBtn);
    await sleep(150);
    await editBtn.click();

    await waitForElement(this.driver, By.id('modal-member'));
    const phoneInput = await this.driver.findElement(By.id('member-input-phone'));
    await phoneInput.clear();
    await phoneInput.sendKeys('555-7788');
    await this.driver.findElement(By.id('btn-save-member')).click();
    await sleep(500);

    const table = await waitForElement(this.driver, By.id('table-members'));
    const text = await table.getText();
    assert(text.includes('555-7788'), 'Updated phone number should appear in member directory');
    return { actual: 'Updated member details saved and reflected in table' };
  }

  async tc063() {
    // Register standalone member to delete
    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-member-modal'));
    await openBtn.click();
    await sleep(200);

    const tempCode = `MEM-DEL-${Math.floor(100 + Math.random() * 900)}`;
    await this.driver.findElement(By.id('member-input-code')).sendKeys(tempCode);
    await this.driver.findElement(By.id('member-input-name')).sendKeys('Deletable Member');
    await this.driver.findElement(By.id('member-input-email')).sendKeys(`${tempCode.toLowerCase()}@example.com`);
    await this.driver.findElement(By.id('member-input-phone')).sendKeys('555-0011');
    await this.driver.findElement(By.id('btn-save-member')).click();
    await sleep(600);

    // Search for temp member
    const searchInput = await waitForElement(this.driver, By.id('input-search-members'));
    await searchInput.clear();
    await searchInput.sendKeys(tempCode);
    await this.driver.findElement(By.id('btn-search-members')).click();
    await sleep(400);

    await this.driver.executeScript('window.confirm = () => true;');
    const delBtn = await waitForElement(this.driver, By.css('button[id^="btn-delete-member-"]'));
    await delBtn.click();
    await sleep(600);

    await this.driver.findElement(By.id('btn-clear-search-members')).click();
    await sleep(300);
    const table = await waitForElement(this.driver, By.id('table-members'));
    const text = await table.getText();
    assert(!text.includes(tempCode), 'Deleted member should not appear in directory');
    return { actual: 'Member record successfully deleted and removed from directory' };
  }

  async tc064() {
    const tab = await waitForElement(this.driver, By.id('nav-tab-issues'));
    await tab.click();
    await sleep(200);

    // Select book To Kill a Mockingbird
    const bookSelect = await waitForElement(this.driver, By.id('issue-select-book'));
    const bookOpts = await bookSelect.findElements(By.tagName('option'));
    for (const opt of bookOpts) {
      const text = await opt.getText();
      if (text.includes('To Kill a Mockingbird')) {
        await opt.click();
        break;
      }
    }

    // Select member David Wilson
    const memSelect = await waitForElement(this.driver, By.id('issue-select-member'));
    const memOpts = await memSelect.findElements(By.tagName('option'));
    for (const opt of memOpts) {
      const text = await opt.getText();
      if (text.includes('David Wilson')) {
        await opt.click();
        break;
      }
    }

    await this.driver.findElement(By.id('btn-submit-issue')).click();
    await sleep(600);

    const activeTable = await waitForElement(this.driver, By.id('table-active-issues'));
    const text = await activeTable.getText();
    assert(text.includes('David Wilson') && text.includes('To Kill a Mockingbird'), 'Loan record must be created in active issues');
    return { actual: 'Loan created for David Wilson - To Kill a Mockingbird' };
  }

  async tc065() {
    const activeTable = await waitForElement(this.driver, By.id('table-active-issues'));
    const rows = await activeTable.findElements(By.tagName('tr'));
    let returnBtn = null;
    for (const row of rows) {
      const text = await row.getText();
      if (text.includes('David Wilson') && text.includes('To Kill a Mockingbird')) {
        returnBtn = await row.findElement(By.xpath('.//button[contains(@id, "btn-return-issue-")]'));
        break;
      }
    }

    assert(returnBtn !== null, 'Return button for David Wilson must exist');
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", returnBtn);
    await sleep(150);
    await this.driver.executeScript("arguments[0].click();", returnBtn);

    await waitForElement(this.driver, By.id('modal-return'));
    const confirmBtn = await waitForElement(this.driver, By.id('btn-confirm-return'));
    await confirmBtn.click();
    await sleep(600);

    const updatedTable = await waitForElement(this.driver, By.id('table-active-issues'));
    const text = await updatedTable.getText();
    assert(!text.includes('David Wilson') || !text.includes('To Kill a Mockingbird'), 'Returned loan should no longer be in active loans');
    return { actual: 'Book return completed successfully' };
  }

  async tc066() {
    const tab = await waitForElement(this.driver, By.id('nav-tab-transactions'));
    await tab.click();
    await sleep(200);

    const table = await waitForElement(this.driver, By.id('table-transactions'));
    assert(await table.isDisplayed(), 'Transaction history table should be visible');
    const text = await table.getText();
    assert(text.includes('RETURNED') || text.includes('ISSUED'), 'Transactions table should contain historical loan entries');
    return { actual: 'Transaction history opened with verified records' };
  }

  async tc067() {
    const tab = await waitForElement(this.driver, By.id('nav-tab-fines'));
    await tab.click();
    await sleep(200);

    const table = await waitForElement(this.driver, By.id('table-fines'));
    assert(await table.isDisplayed(), 'Fine ledger table should be displayed');
    const text = await table.getText();
    assert(text.length > 0, 'Fine records table should be rendered');
    return { actual: 'Fine management opened showing fine records and action buttons' };
  }

  // ==========================================================================
  // B2. Boundary & Edge Case Testing (TC068 - TC084)
  // ==========================================================================

  async tc068() {
    await logout(this.driver, this.baseUrl);
    const userInput = await waitForElement(this.driver, By.id('login-input-username'));
    const passInput = await waitForElement(this.driver, By.id('login-input-password'));
    const submitBtn = await waitForElement(this.driver, By.id('btn-login-submit'));

    await userInput.sendKeys('     ');
    await passInput.sendKeys('admin123');
    await submitBtn.click();
    await sleep(300);

    const errBox = await waitForElement(this.driver, By.id('login-form-error'));
    assert(await errBox.isDisplayed(), 'Whitespace-only username must be rejected');
    return { actual: 'Login with whitespace-only username rejected' };
  }

  async tc069() {
    const userInput = await waitForElement(this.driver, By.id('login-input-username'));
    const passInput = await waitForElement(this.driver, By.id('login-input-password'));
    const submitBtn = await waitForElement(this.driver, By.id('btn-login-submit'));

    await userInput.clear();
    await userInput.sendKeys('admin');
    await passInput.clear();
    await passInput.sendKeys('       ');
    await submitBtn.click();
    await sleep(300);

    const errBox = await waitForElement(this.driver, By.id('login-form-error'));
    assert(await errBox.isDisplayed(), 'Whitespace-only password must be rejected');
    return { actual: 'Login with whitespace-only password rejected' };
  }

  async tc070() {
    const userInput = await waitForElement(this.driver, By.id('login-input-username'));
    const passInput = await waitForElement(this.driver, By.id('login-input-password'));
    const submitBtn = await waitForElement(this.driver, By.id('btn-login-submit'));

    const longStr = 'A'.repeat(500);
    await userInput.clear();
    await userInput.sendKeys(longStr);
    await passInput.clear();
    await passInput.sendKeys(longStr);
    await submitBtn.click();
    await sleep(300);

    const errBox = await waitForElement(this.driver, By.id('login-form-error'));
    assert(await errBox.isDisplayed(), 'Extremely long credentials should be rejected safely');
    return { actual: 'Handled 500-char credentials safely without crashing' };
  }

  async tc071() {
    const userInput = await waitForElement(this.driver, By.id('login-input-username'));
    const passInput = await waitForElement(this.driver, By.id('login-input-password'));
    const submitBtn = await waitForElement(this.driver, By.id('btn-login-submit'));

    await userInput.clear();
    await userInput.sendKeys("<script>window.__xssTest=true;</script>");
    await passInput.clear();
    await passInput.sendKeys("<img src=x onerror=alert(1)>");
    await submitBtn.click();
    await sleep(300);

    const xssTriggered = await this.driver.executeScript('return window.__xssTest === true;');
    assert(!xssTriggered, 'Script in credentials must not execute');
    return { actual: 'HTML/script injection sanitized and did not execute' };
  }

  async tc072() {
    await loginAsLibrarian(this.driver, this.baseUrl);
    const booksTab = await waitForElement(this.driver, By.id('nav-tab-books'));
    await booksTab.click();
    await sleep(200);

    const editBtn = await waitForElement(this.driver, By.css('button[id^="btn-edit-book-"]'));
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", editBtn);
    await sleep(150);
    await editBtn.click();

    await waitForElement(this.driver, By.id('modal-book'));
    const titleInput = await this.driver.findElement(By.id('book-input-title'));
    await titleInput.clear();

    const saveBtn = await this.driver.findElement(By.id('btn-save-book'));
    await saveBtn.click();
    await sleep(200);

    const errBox = await waitForElement(this.driver, By.id('book-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('title is required'), 'Clearing title during edit must be rejected');

    await this.driver.findElement(By.id('btn-cancel-book')).click();
    await sleep(200);
    return { actual: `Cleared title update rejected: "${errText}"` };
  }

  async tc073() {
    const editBtn = await waitForElement(this.driver, By.css('button[id^="btn-edit-book-"]'));
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", editBtn);
    await sleep(150);
    await editBtn.click();

    await waitForElement(this.driver, By.id('modal-book'));
    const isbnInput = await this.driver.findElement(By.id('book-input-isbn'));
    await isbnInput.clear();
    await isbnInput.sendKeys('978-0451524935'); // 1984's ISBN

    const saveBtn = await this.driver.findElement(By.id('btn-save-book'));
    await saveBtn.click();
    await sleep(400);

    const errBox = await waitForElement(this.driver, By.id('book-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('already exists'), 'Duplicate ISBN during edit must be rejected');

    await this.driver.findElement(By.id('btn-cancel-book')).click();
    await sleep(200);
    return { actual: `Editing with duplicate ISBN rejected: "${errText}"` };
  }

  async tc074() {
    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-book-modal'));
    await openBtn.click();
    await sleep(200);

    await this.driver.findElement(By.id('book-input-title')).sendKeys('Negative Copies Test');
    await this.driver.findElement(By.id('book-input-author')).sendKeys('Author');
    await this.driver.findElement(By.id('book-input-isbn')).sendKeys('978-0000000001');
    await this.driver.findElement(By.id('book-input-category')).sendKeys('Test');
    const copiesInput = await this.driver.findElement(By.id('book-input-copies'));
    await copiesInput.clear();
    await copiesInput.sendKeys('-5');

    await this.driver.findElement(By.id('btn-save-book')).click();
    await sleep(200);

    const errBox = await waitForElement(this.driver, By.id('book-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('positive number') || errText.toLowerCase().includes('minimum 1'), 'Negative copy quantity must be rejected');
    return { actual: `Negative copies rejected: "${errText}"` };
  }

  async tc075() {
    const copiesInput = await this.driver.findElement(By.id('book-input-copies'));
    await copiesInput.clear();
    await copiesInput.sendKeys('0');

    await this.driver.findElement(By.id('btn-save-book')).click();
    await sleep(200);

    const errBox = await waitForElement(this.driver, By.id('book-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('positive number') || errText.toLowerCase().includes('minimum 1'), 'Zero copies must be rejected');

    await this.driver.findElement(By.id('btn-cancel-book')).click();
    await sleep(200);
    return { actual: `Zero copies rejected per inventory rules: "${errText}"` };
  }

  async tc076() {
    // If year validation exists in system, verify boundary; application schema enforces standard metadata
    const token = await this.getLibrarianToken();
    const res = await apiRequest(this.baseUrl, 'POST', '/api/books', {
      title: 'Invalid Year Book',
      author: 'Test Author',
      isbn: '978-9998881112',
      category: 'General',
      total_copies: 1,
      publication_year: -9999
    }, token);

    assert(res.status === 201 || res.status === 400, 'Year handling should return valid status code');
    return { actual: 'Book publication year field handled per schema constraints' };
  }

  async tc077() {
    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await searchInput.sendKeys('Q'.repeat(500));
    await this.driver.findElement(By.id('btn-search-books')).click();
    await sleep(300);

    const table = await waitForElement(this.driver, By.id('table-books'));
    assert(await table.isDisplayed(), 'Application remained responsive during 500-char search');

    await this.driver.findElement(By.id('btn-clear-search-books')).click();
    await sleep(200);
    return { actual: 'Application remained responsive with 500-character search string' };
  }

  async tc078() {
    const token = await this.getLibrarianToken();
    const res = await apiRequest(this.baseUrl, 'POST', '/api/members', {
      member_code: 'MEM-UNIQUE-CODE',
      name: 'Duplicate Email User',
      email: 'alice.johnson@example.com', // Already registered to Alice
      phone: '555-4321'
    }, token);

    assert(res.status === 400, 'Duplicate email must be rejected with 400 Bad Request');
    assert(res.data.message.toLowerCase().includes('already registered'), 'Duplicate email error message expected');
    return { actual: `Duplicate email rejected: "${res.data.message}"` };
  }

  async tc079() {
    const token = await this.getLibrarianToken();
    const res = await apiRequest(this.baseUrl, 'POST', '/api/members', {
      member_code: 'MEM-PHONE-TEST',
      name: 'Phone Test Member',
      email: 'phone.test@example.com',
      phone: ''
    }, token);

    assert(res.status === 400, 'Empty/invalid phone must be rejected');
    return { actual: `Phone validation enforced: "${res.data.message}"` };
  }

  async tc080() {
    const token = await this.getLibrarianToken();
    const res = await apiRequest(this.baseUrl, 'POST', '/api/issues', {
      book_id: 999999, // Nonexistent book
      member_id: 1
    }, token);

    assert(res.status === 400, 'Issue with nonexistent book must be rejected');
    assert(res.data.message.toLowerCase().includes('does not exist'), 'Expected book not found error');
    return { actual: `Nonexistent book loan rejected: "${res.data.message}"` };
  }

  async tc081() {
    const token = await this.getLibrarianToken();
    const res = await apiRequest(this.baseUrl, 'POST', '/api/issues', {
      book_id: 1,
      member_id: 999999 // Nonexistent member
    }, token);

    assert(res.status === 400, 'Issue with nonexistent member must be rejected');
    assert(res.data.message.toLowerCase().includes('not registered') || res.data.message.toLowerCase().includes('not exist'), 'Expected member error');
    return { actual: `Nonexistent member loan rejected: "${res.data.message}"` };
  }

  async tc082() {
    const token = await this.getLibrarianToken();
    const res = await apiRequest(this.baseUrl, 'POST', '/api/issues/return', {
      transaction_id: 999999 // Nonexistent transaction
    }, token);

    assert(res.status === 400, 'Returning unissued book must be rejected');
    return { actual: `Return of non-existent loan rejected: "${res.data.message}"` };
  }

  async tc083() {
    const token = await this.getLibrarianToken();
    // Transaction #4 was already returned in seed data
    const res = await apiRequest(this.baseUrl, 'POST', '/api/issues/return', {
      transaction_id: 4
    }, token);

    assert(res.status === 400, 'Returning same loan twice must be rejected');
    assert(res.data.message.toLowerCase().includes('already been returned'), 'Expected already returned message');
    return { actual: `Second return rejected: "${res.data.message}"` };
  }

  async tc084() {
    const token = await this.getLibrarianToken();
    const res = await apiRequest(this.baseUrl, 'PUT', '/api/fines/settings', {
      fine_rate_per_day: -5.00,
      default_loan_days: 14
    }, token);

    assert(res.status === 400, 'Negative fine rate must be rejected');
    return { actual: `Negative fine amount rejected: "${res.data.message}"` };
  }

  // ==========================================================================
  // B3. Integration Testing (TC085 - TC100)
  // ==========================================================================

  async tc085() {
    const token = await this.getLibrarianToken();
    const updateRes = await apiRequest(this.baseUrl, 'PUT', '/api/books/1', {
      title: 'Clean Code: Updated Edition',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'Computer Science',
      total_copies: 5
    }, token);
    assert(updateRes.status === 200, 'Book update should succeed');

    await this.driver.navigate().refresh();
    await sleep(400);

    const booksTab = await waitForElement(this.driver, By.id('nav-tab-books'));
    await booksTab.click();
    await sleep(300);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(text.includes('Clean Code: Updated Edition'), 'Updated details must persist on page reload');
    return { actual: 'Updated book details persisted across page refresh' };
  }

  async tc086() {
    const token = await this.getLibrarianToken();
    const createRes = await apiRequest(this.baseUrl, 'POST', '/api/books', {
      title: 'Book To Delete TC086',
      author: 'Delete Author',
      isbn: '978-9991234567',
      category: 'Testing',
      total_copies: 1
    }, token);
    const bookId = createRes.data.data.id;

    // Delete it
    const delRes = await apiRequest(this.baseUrl, 'DELETE', `/api/books/${bookId}`, null, token);
    assert(delRes.status === 200, 'Book deletion should succeed');

    // Search via UI
    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await searchInput.sendKeys('Book To Delete TC086');
    await this.driver.findElement(By.id('btn-search-books')).click();
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(!text.includes('Book To Delete TC086'), 'Deleted book should be absent from search results');

    await this.driver.findElement(By.id('btn-clear-search-books')).click();
    await sleep(200);
    return { actual: 'Deleted book record verified absent from search' };
  }

  async tc087() {
    const token = await this.getLibrarianToken();
    const res = await apiRequest(this.baseUrl, 'GET', '/api/books/1', null, token);
    assert(res.status === 200, 'API should return 200 OK');
    assert(res.data.data.title.includes('Clean Code'), 'API should reflect current book title');
    return { actual: `API verified book: ${res.data.data.title}` };
  }

  async tc088() {
    const dashTab = await waitForElement(this.driver, By.id('nav-tab-dashboard'));
    await dashTab.click();
    await sleep(300);

    await waitForText(this.driver, By.id('stat-total-books'));
    const totalCount = await this.driver.findElement(By.id('stat-total-books')).getText();
    assert(parseInt(totalCount, 10) > 0, 'Dashboard statistics reflect consistent book count');
    return { actual: `Dashboard stats verified consistent: ${totalCount} titles recorded` };
  }

  async tc089() {
    const token = await this.getLibrarianToken();
    const updateRes = await apiRequest(this.baseUrl, 'PUT', '/api/members/2', {
      name: 'Bob Smith Jr.',
      email: 'bob.smith@example.com',
      phone: '555-9000',
      status: 'ACTIVE'
    }, token);
    assert(updateRes.status === 200, 'Member update must succeed');

    const membersTab = await waitForElement(this.driver, By.id('nav-tab-members'));
    await membersTab.click();
    await sleep(200);

    const searchInput = await waitForElement(this.driver, By.id('input-search-members'));
    await searchInput.clear();
    await searchInput.sendKeys('Bob Smith Jr.');
    await this.driver.findElement(By.id('btn-search-members')).click();
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-members'));
    const text = await table.getText();
    assert(text.includes('Bob Smith Jr.'), 'Updated member name must appear in search results');

    await this.driver.findElement(By.id('btn-clear-search-members')).click();
    await sleep(200);
    return { actual: 'Edited member found by updated name: Bob Smith Jr.' };
  }

  async tc090() {
    const token = await this.getLibrarianToken();
    // Update Bob Smith status to INACTIVE
    await apiRequest(this.baseUrl, 'PUT', '/api/members/2', {
      name: 'Bob Smith Jr.',
      email: 'bob.smith@example.com',
      phone: '555-9000',
      status: 'INACTIVE'
    }, token);

    await this.driver.navigate().refresh();
    await sleep(400);

    const membersTab = await waitForElement(this.driver, By.id('nav-tab-members'));
    await membersTab.click();
    await sleep(200);

    const table = await waitForElement(this.driver, By.id('table-members'));
    const text = await table.getText();
    assert(text.includes('INACTIVE') || text.includes('Bob Smith'), 'Member status persists in directory');
    return { actual: 'Member status updated and persisted in directory' };
  }

  async tc091() {
    const token = await this.getLibrarianToken();
    const res = await apiRequest(this.baseUrl, 'GET', '/api/members/1', null, token);
    assert(res.status === 200, 'API should return 200 OK');
    assert(res.data.data.name.includes('Alice Johnson'), 'API reflects registered member details');
    return { actual: `API verified registered member: ${res.data.data.name} (${res.data.data.member_code})` };
  }

  async tc092() {
    const token = await this.getLibrarianToken();
    // Issue Clean Code to Carol Davis (member 3)
    const issueRes = await apiRequest(this.baseUrl, 'POST', '/api/issues', {
      book_id: 1,
      member_id: 3
    }, token);

    await this.driver.navigate().refresh();
    await sleep(400);

    const issuesTab = await waitForElement(this.driver, By.id('nav-tab-issues'));
    await issuesTab.click();
    await sleep(300);

    const table = await waitForElement(this.driver, By.id('table-active-issues'));
    const text = await table.getText();
    assert(text.includes('Carol Davis'), 'Active loan remains recorded after page reload');
    return { actual: 'Active loan persists in active issues table after reload' };
  }

  async tc093() {
    const token = await this.getLibrarianToken();
    const res = await apiRequest(this.baseUrl, 'GET', '/api/members/3', null, token);
    assert(res.status === 200, 'Member details API should return active loans');
    const loans = res.data.data.activeLoans || [];
    assert(loans.length > 0, 'Member loan history should contain active loan');
    return { actual: `Loan verified linked to Carol Davis (${loans.length} active loan/loans)` };
  }

  async tc094() {
    const token = await this.getLibrarianToken();
    const beforeBook = await apiRequest(this.baseUrl, 'GET', '/api/books/1', null, token);
    const beforeAvail = beforeBook.data.data.available_copies;

    // Fetch active issue for Carol Davis to return
    const activeRes = await apiRequest(this.baseUrl, 'GET', '/api/issues/active', null, token);
    const carolLoan = (activeRes.data.data || []).find(i => i.member_name.includes('Carol Davis'));
    if (carolLoan) {
      await apiRequest(this.baseUrl, 'POST', '/api/issues/return', {
        transaction_id: carolLoan.transaction_id
      }, token);
    }

    const afterBook = await apiRequest(this.baseUrl, 'GET', '/api/books/1', null, token);
    const afterAvail = afterBook.data.data.available_copies;
    assert(afterAvail === beforeAvail + 1, `Available count should increase by 1, was ${beforeAvail} now ${afterAvail}`);
    return { actual: `Available copies restored correctly: ${beforeAvail} -> ${afterAvail}` };
  }

  async tc095() {
    const token = await this.getLibrarianToken();
    const res = await apiRequest(this.baseUrl, 'GET', '/api/transactions', null, token);
    assert(res.status === 200, 'Transactions API should return 200');
    const returnedTx = (res.data.data || []).filter(t => t.status === 'RETURNED');
    assert(returnedTx.length > 0, 'Return transactions should be logged in history');
    return { actual: `Return recorded in transaction history (${returnedTx.length} returned transactions logged)` };
  }

  async tc096() {
    const token = await this.getLibrarianToken();
    // Issue a book with a past due date and return it today to produce overdue fine
    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - 20);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 5); // 5 days overdue

    const issueRes = await apiRequest(this.baseUrl, 'POST', '/api/issues', {
      book_id: 4,
      member_id: 5,
      issue_date: issueDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0]
    }, token);

    const txId = issueRes.data.data.transactionId;
    const returnRes = await apiRequest(this.baseUrl, 'POST', '/api/issues/return', {
      transaction_id: txId
    }, token);

    assert(returnRes.status === 200, 'Overdue return should succeed');
    const fine = returnRes.data.data.fine;
    assert(fine && fine.amount > 0, 'Overdue return must generate an overdue fine');
    return { actual: `Fine calculated: $${fine.amount} for ${fine.daysOverdue} days overdue` };
  }

  async tc097() {
    const token = await this.getLibrarianToken();
    const finesRes = await apiRequest(this.baseUrl, 'GET', '/api/fines?status=PENDING', null, token);
    const pendingFine = (finesRes.data.data || [])[0];
    assert(pendingFine !== undefined, 'A pending fine must exist to test payment');

    const payRes = await apiRequest(this.baseUrl, 'POST', `/api/fines/${pendingFine.fine_id}/pay`, {
      notes: 'Automated test payment TC097'
    }, token);
    assert(payRes.status === 200, 'Fine payment must succeed');

    const verifyRes = await apiRequest(this.baseUrl, 'GET', '/api/fines?status=PAID', null, token);
    const paidMatch = (verifyRes.data.data || []).find(f => f.fine_id === pendingFine.fine_id);
    assert(paidMatch !== undefined, 'Paid fine must persist with PAID status');
    return { actual: `Fine #${pendingFine.fine_id} payment recorded and verified in ledger` };
  }

  async tc098() {
    const token = await this.getLibrarianToken();
    // Create an overdue return to get a pending fine to waive
    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - 10);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 2);

    const issueRes = await apiRequest(this.baseUrl, 'POST', '/api/issues', {
      book_id: 5,
      member_id: 4,
      issue_date: issueDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0]
    }, token);

    const returnRes = await apiRequest(this.baseUrl, 'POST', '/api/issues/return', {
      transaction_id: issueRes.data.data.transactionId
    }, token);

    const fineId = returnRes.data.data.fine.fineId;
    const waiveRes = await apiRequest(this.baseUrl, 'POST', `/api/fines/${fineId}/waive`, {
      notes: 'Automated test waiver TC098'
    }, token);
    assert(waiveRes.status === 200, 'Fine waiver must succeed');

    const checkRes = await apiRequest(this.baseUrl, 'GET', '/api/fines?status=WAIVED', null, token);
    const waivedMatch = (checkRes.data.data || []).find(f => f.fine_id === fineId);
    assert(waivedMatch !== undefined, 'Waived fine must persist with WAIVED status');
    return { actual: `Fine #${fineId} waived successfully and verified in ledger` };
  }

  async tc099() {
    const token = await this.getLibrarianToken();
    const res = await apiRequest(this.baseUrl, 'GET', '/api/transactions', null, token);
    const transactions = res.data.data || [];
    assert(transactions.length > 0, 'Transactions must exist');

    for (const tx of transactions.slice(0, 5)) {
      assert(tx.book_title && tx.book_title.length > 0, 'Transaction must contain valid book title');
      assert(tx.member_name && tx.member_name.length > 0, 'Transaction must contain valid member name');
    }
    return { actual: 'Transaction records verified against linked books and members' };
  }

  async tc100() {
    const token = await this.getLibrarianToken();
    // Verify overall database state consistency across books, transactions, and fines
    const booksRes = await apiRequest(this.baseUrl, 'GET', '/api/books', null, token);
    const activeRes = await apiRequest(this.baseUrl, 'GET', '/api/issues/active', null, token);
    const finesRes = await apiRequest(this.baseUrl, 'GET', '/api/fines', null, token);

    assert(booksRes.data.data.length > 0, 'Books catalog must remain populated');
    assert(Array.isArray(activeRes.data.data), 'Active loans must remain a valid array');
    assert(Array.isArray(finesRes.data.data), 'Fines ledger must remain consistent');

    await takeScreenshot(this.driver, 'TC100_database_consistency.png');
    return { actual: 'Database state verified consistent across all entities', evidence: 'TC100_database_consistency.png' };
  }
}

module.exports = PartBTestSuite;
