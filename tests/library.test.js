const { By, until } = require('selenium-webdriver');
const assert = require('assert');

// Helper to wait for element visibility with a timeout
async function waitForElement(driver, locator, timeout = 5000) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

// Helper to wait until text is non-empty
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

// Short sleep helper for animations or async updates
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Suite of automated tests for the Library Management System
 */
class LibraryTestSuite {
  constructor(driver, baseUrl) {
    this.driver = driver;
    this.baseUrl = baseUrl;
  }

  // TEST 0: Authentication - Librarian login
  async testLogin() {
    console.log('  -> Executing: testLogin()');
    await this.driver.get(`${this.baseUrl}/login.html`);

    const usernameInput = await waitForElement(this.driver, By.id('login-input-username'));
    const passwordInput = await waitForElement(this.driver, By.id('login-input-password'));
    const submitBtn = await waitForElement(this.driver, By.id('btn-login-submit'));

    await usernameInput.clear();
    await usernameInput.sendKeys('admin');
    await passwordInput.clear();
    await passwordInput.sendKeys('admin123');
    await submitBtn.click();

    // Wait until redirected to main dashboard
    await waitForElement(this.driver, By.id('stat-total-books'));
    console.log('     [OK] Logged in successfully as Librarian.');
  }

  // TEST 1: Dashboard loads correctly with statistics
  async testDashboard() {
    console.log('  -> Executing: testDashboard()');
    await this.driver.get(this.baseUrl);

    // Verify Title
    const title = await this.driver.getTitle();
    assert(title.includes('Athena'), `Expected title to contain "Athena", got: "${title}"`);

    // Verify Stats Cards
    await waitForText(this.driver, By.id('stat-total-books'));
    const totalBooks = await this.driver.findElement(By.id('stat-total-books')).getText();
    const availableBooks = await this.driver.findElement(By.id('stat-available-books')).getText();
    const totalMembers = await this.driver.findElement(By.id('stat-total-members')).getText();
    const issuedBooks = await this.driver.findElement(By.id('stat-issued-books')).getText();

    assert(parseInt(totalBooks, 10) > 0, `Total books should be > 0, got ${totalBooks}`);
    assert(parseInt(availableBooks, 10) > 0, `Available books should be > 0, got ${availableBooks}`);
    assert(parseInt(totalMembers, 10) > 0, `Total members should be > 0, got ${totalMembers}`);
    assert(parseInt(issuedBooks, 10) >= 0, `Issued books should be >= 0, got ${issuedBooks}`);

    console.log(`     [OK] Dashboard stats loaded: ${totalBooks} books, ${availableBooks} available, ${totalMembers} members, ${issuedBooks} issued.`);
  }

  // TEST 2: Book Catalog - validation and adding new book
  async testBookManagement() {
    console.log('  -> Executing: testBookManagement()');
    
    // Switch to books tab
    const booksTab = await waitForElement(this.driver, By.id('nav-tab-books'));
    await booksTab.click();
    await sleep(300);

    // Open Add Book modal
    const addBtn = await waitForElement(this.driver, By.id('btn-open-add-book-modal'));
    await addBtn.click();
    await waitForElement(this.driver, By.id('modal-book'));

    // Validation Test 1: Empty title submission
    const saveBtn = await waitForElement(this.driver, By.id('btn-save-book'));
    await saveBtn.click();
    await sleep(200);

    const errBox = await waitForElement(this.driver, By.id('book-form-error'));
    const errMsg1 = await errBox.getText();
    assert(errMsg1.includes('title is required'), `Expected required title error, got: "${errMsg1}"`);
    console.log('     [OK] Form correctly rejected empty book title submission.');

    // Validation Test 2: Duplicate ISBN rejection
    const titleInput = await this.driver.findElement(By.id('book-input-title'));
    const authorInput = await this.driver.findElement(By.id('book-input-author'));
    const isbnInput = await this.driver.findElement(By.id('book-input-isbn'));
    const categoryInput = await this.driver.findElement(By.id('book-input-category'));
    const copiesInput = await this.driver.findElement(By.id('book-input-copies'));

    await titleInput.sendKeys('Duplicate Test Title');
    await authorInput.sendKeys('Test Author');
    await isbnInput.sendKeys('978-0132350884'); // Clean Code's existing ISBN
    await categoryInput.sendKeys('Testing');
    await copiesInput.clear();
    await copiesInput.sendKeys('2');

    await saveBtn.click();
    await sleep(300);

    const errMsg2 = await errBox.getText();
    assert(errMsg2.toLowerCase().includes('already exists'), `Expected duplicate ISBN error, got: "${errMsg2}"`);
    console.log('     [OK] Form correctly rejected duplicate ISBN submission.');

    // Valid book submission
    await titleInput.clear();
    await titleInput.sendKeys('Software Architecture: The Hard Parts');
    await authorInput.clear();
    await authorInput.sendKeys('Neal Ford, Mark Richards');
    await isbnInput.clear();
    await isbnInput.sendKeys('978-1492086895');
    await categoryInput.clear();
    await categoryInput.sendKeys('Architecture');
    await copiesInput.clear();
    await copiesInput.sendKeys('4');

    await saveBtn.click();
    await sleep(600);

    // Verify book is listed in table
    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await searchInput.sendKeys('Hard Parts');
    const searchBtn = await this.driver.findElement(By.id('btn-search-books'));
    await searchBtn.click();
    await sleep(400);

    const bookTable = await waitForElement(this.driver, By.id('table-books'));
    const tableText = await bookTable.getText();
    assert(tableText.includes('Software Architecture: The Hard Parts'), 'Newly created book should appear in catalog');
    assert(tableText.includes('978-1492086895'), 'ISBN should appear in catalog table');

    // Clear search
    await this.driver.findElement(By.id('btn-clear-search-books')).click();
    await sleep(300);

    console.log('     [OK] Book created and verified in catalog table.');
  }

  // TEST 3: Member Directory - validation and registration
  async testMemberManagement() {
    console.log('  -> Executing: testMemberManagement()');

    // Switch to members tab
    const membersTab = await waitForElement(this.driver, By.id('nav-tab-members'));
    await membersTab.click();
    await sleep(300);

    // Open Register Member modal
    const addMemberBtn = await waitForElement(this.driver, By.id('btn-open-add-member-modal'));
    await addMemberBtn.click();
    await waitForElement(this.driver, By.id('modal-member'));

    const saveMemberBtn = await waitForElement(this.driver, By.id('btn-save-member'));
    const memberCodeInput = await this.driver.findElement(By.id('member-input-code'));
    const memberNameInput = await this.driver.findElement(By.id('member-input-name'));
    const memberEmailInput = await this.driver.findElement(By.id('member-input-email'));
    const memberPhoneInput = await this.driver.findElement(By.id('member-input-phone'));

    // Validation Test 1: Empty member code
    await saveMemberBtn.click();
    await sleep(200);
    const memberErrBox = await waitForElement(this.driver, By.id('member-form-error'));
    const errText1 = await memberErrBox.getText();
    assert(errText1.includes('Member Code / ID is required'), `Expected required member code error, got: "${errText1}"`);
    console.log('     [OK] Rejected registration with empty Member Code.');

    // Validation Test 2: Invalid Email format
    await memberCodeInput.sendKeys('MEM-9999');
    await memberNameInput.sendKeys('Test Member');
    await memberEmailInput.sendKeys('invalid-email-string');
    await memberPhoneInput.sendKeys('555-1234');

    await saveMemberBtn.click();
    await sleep(200);
    const errText2 = await memberErrBox.getText();
    assert(errText2.includes('valid email format'), `Expected email validation error, got: "${errText2}"`);
    console.log('     [OK] Rejected registration with invalid email format.');

    // Valid Member registration
    await memberCodeInput.clear();
    await memberCodeInput.sendKeys('MEM-9001');
    await memberNameInput.clear();
    await memberNameInput.sendKeys('Grace Hopper');
    await memberEmailInput.clear();
    await memberEmailInput.sendKeys('grace.hopper@example.org');
    await memberPhoneInput.clear();
    await memberPhoneInput.sendKeys('555-0901');

    await saveMemberBtn.click();
    await sleep(600);

    // Verify member in table
    const membersTable = await waitForElement(this.driver, By.id('table-members'));
    const membersText = await membersTable.getText();
    assert(membersText.includes('Grace Hopper'), 'Grace Hopper should be registered in members directory');
    assert(membersText.includes('MEM-9001'), 'MEM-9001 code should appear in directory');

    console.log('     [OK] Member registered and verified in directory.');
  }

  // TEST 4: Issue Book Flow
  async testIssueBook() {
    console.log('  -> Executing: testIssueBook()');

    // Switch to issues tab
    const issuesTab = await waitForElement(this.driver, By.id('nav-tab-issues'));
    await issuesTab.click();
    await sleep(300);

    // Select the book we created earlier
    const bookSelect = await waitForElement(this.driver, By.id('issue-select-book'));
    const bookOptions = await bookSelect.findElements(By.tagName('option'));
    let bookOptionFound = false;
    for (const opt of bookOptions) {
      const text = await opt.getText();
      if (text.includes('Software Architecture: The Hard Parts')) {
        await opt.click();
        bookOptionFound = true;
        break;
      }
    }
    assert(bookOptionFound, 'Newly added book should appear in issue dropdown');

    // Select member Grace Hopper
    const memberSelect = await waitForElement(this.driver, By.id('issue-select-member'));
    const memberOptions = await memberSelect.findElements(By.tagName('option'));
    let memberOptionFound = false;
    for (const opt of memberOptions) {
      const text = await opt.getText();
      if (text.includes('Grace Hopper') || text.includes('MEM-9001')) {
        await opt.click();
        memberOptionFound = true;
        break;
      }
    }
    assert(memberOptionFound, 'Grace Hopper should appear in member dropdown');

    // Submit Issue
    const submitBtn = await waitForElement(this.driver, By.id('btn-submit-issue'));
    await submitBtn.click();
    await sleep(600);

    // Verify success alert
    const successBox = await waitForElement(this.driver, By.id('issue-form-success'));
    const successMsg = await successBox.getText();
    assert(successMsg.includes('successfully issued'), `Expected success message, got: "${successMsg}"`);

    // Verify in Active Borrowings table
    const activeTable = await waitForElement(this.driver, By.id('table-active-issues'));
    const activeText = await activeTable.getText();
    assert(activeText.includes('Grace Hopper'), 'Grace Hopper should appear in active borrowings table');
    assert(activeText.includes('Software Architecture'), 'Issued book should appear in active borrowings');

    console.log('     [OK] Book successfully issued and verified in active borrowings.');
  }

  // TEST 5: Duplicate issue prevention (Business Rule)
  async testDuplicateIssuePrevention() {
    console.log('  -> Executing: testDuplicateIssuePrevention()');

    // Try issuing the exact same book to Grace Hopper again
    const bookSelect = await waitForElement(this.driver, By.id('issue-select-book'));
    const bookOptions = await bookSelect.findElements(By.tagName('option'));
    for (const opt of bookOptions) {
      const text = await opt.getText();
      if (text.includes('Software Architecture: The Hard Parts')) {
        await opt.click();
        break;
      }
    }

    const memberSelect = await waitForElement(this.driver, By.id('issue-select-member'));
    const memberOptions = await memberSelect.findElements(By.tagName('option'));
    for (const opt of memberOptions) {
      const text = await opt.getText();
      if (text.includes('Grace Hopper')) {
        await opt.click();
        break;
      }
    }

    const submitBtn = await waitForElement(this.driver, By.id('btn-submit-issue'));
    await submitBtn.click();
    await sleep(400);

    const errBox = await waitForElement(this.driver, By.id('issue-form-error'));
    const errMsg = await errBox.getText();
    assert(errMsg.includes('already has an active unreturned copy'), `Expected duplicate loan error, got: "${errMsg}"`);

    console.log('     [OK] Duplicate active borrowing prevented by business rule.');
  }

  // TEST 6: Return Book Flow
  async testReturnBook() {
    console.log('  -> Executing: testReturnBook()');

    try {
      // Find return button for Grace Hopper in active borrowings table
      const activeTable = await waitForElement(this.driver, By.id('table-active-issues'));
      const rows = await activeTable.findElements(By.tagName('tr'));

      let returnBtn = null;
      for (const row of rows) {
        const text = await row.getText();
        if (text.includes('Grace Hopper') && text.includes('Software Architecture')) {
          returnBtn = await row.findElement(By.xpath('.//button[contains(@id, "btn-return-issue-")]'));
          break;
        }
      }

      assert(returnBtn !== null, 'Return button for Grace Hopper must exist');
      await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", returnBtn);
      await sleep(200);
      await this.driver.executeScript("arguments[0].click();", returnBtn);

      // Verify Return Modal opened and text is populated
      await waitForElement(this.driver, By.id('modal-return'));
      await waitForText(this.driver, By.id('return-display-book-title'));
      const displayTitle = await this.driver.findElement(By.id('return-display-book-title')).getText();
      assert(displayTitle.includes('Software Architecture'), `Return modal should display correct book title, got: "${displayTitle}"`);

      // Confirm Return
      const confirmBtn = await waitForElement(this.driver, By.id('btn-confirm-return'));
      await confirmBtn.click();
      await sleep(600);

      // Verify Active Borrowings no longer lists Grace Hopper for this book
      const updatedActiveTable = await waitForElement(this.driver, By.id('table-active-issues'));
      const updatedActiveText = await updatedActiveTable.getText();
      assert(!updatedActiveText.includes('Grace Hopper'), 'Grace Hopper loan should no longer be active');

      // Verify in Transaction History
      const txTab = await waitForElement(this.driver, By.id('nav-tab-transactions'));
      await txTab.click();
      await sleep(300);

      const txTable = await waitForElement(this.driver, By.id('table-transactions'));
      const txText = await txTable.getText();
      assert(txText.includes('Grace Hopper'), 'Transaction history must record Grace Hopper loan');
      assert(txText.includes('RETURNED'), 'Transaction status should be RETURNED');

      console.log('     [OK] Book returned successfully and recorded in transaction history.');
    } finally {
      // Ensure modal is closed so subsequent tests are not blocked
      await this.driver.executeScript(`
        const m = document.getElementById('modal-return');
        if (m) m.classList.remove('active');
      `);
      await sleep(200);
    }
  }

  // TEST 7: Fine Management & Settings
  async testFineManagement() {
    console.log('  -> Executing: testFineManagement()');

    // Switch to fines tab
    const finesTab = await waitForElement(this.driver, By.id('nav-tab-fines'));
    await finesTab.click();
    await sleep(300);

    // Verify fine settings inputs exist
    const rateInput = await waitForElement(this.driver, By.id('input-fine-rate'));
    const currentRate = await rateInput.getAttribute('value');
    assert(parseFloat(currentRate) >= 0, 'Current fine rate should be loaded');

    // Update fine rate
    await rateInput.clear();
    await rateInput.sendKeys('3.50');
    const saveSettingsBtn = await this.driver.findElement(By.id('btn-save-fine-settings'));
    await saveSettingsBtn.click();
    await sleep(400);

    const feedback = await waitForElement(this.driver, By.id('fine-settings-feedback'));
    const fbText = await feedback.getText();
    assert(fbText.includes('updated'), `Expected updated confirmation, got: "${fbText}"`);

    // Verify fines table loaded
    const finesTable = await waitForElement(this.driver, By.id('table-fines'));
    const finesText = await finesTable.getText();
    assert(finesText.length > 0, 'Fines table should be populated');

    console.log('     [OK] Fine rules updated and fine registry verified.');
  }
}

module.exports = LibraryTestSuite;
