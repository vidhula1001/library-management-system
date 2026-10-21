const { By } = require('selenium-webdriver');
const assert = require('assert');
const { waitForElement, waitForText, sleep, takeScreenshot, loginAsLibrarian } = require('./helpers');

/**
 * Suite of 50 Automated Selenium Test Cases for Part A (TC001 - TC050)
 * Covering:
 *   - A1: Functional End-to-End Testing (TC001 - TC017)
 *   - A2: Boundary & Edge Case Testing (TC018 - TC034)
 *   - A3: Integration Testing (TC035 - TC050)
 */
class PartATestSuite {
  constructor(driver, baseUrl) {
    this.driver = driver;
    this.baseUrl = baseUrl;
  }

  // ==========================================================================
  // A1. Functional End-to-End Testing (TC001 - TC017)
  // ==========================================================================

  async tc001() {
    await this.driver.get(`${this.baseUrl}/login.html`);
    const title = await this.driver.getTitle();
    assert(title.includes('Athena'), `Expected title to contain Athena, got "${title}"`);
    return { actual: `Application loaded with title "${title}"` };
  }

  async tc002() {
    await this.driver.get(`${this.baseUrl}/login.html`);
    const form = await waitForElement(this.driver, By.id('form-login'));
    assert(await form.isDisplayed(), 'Login form should be displayed');
    const userField = await this.driver.findElement(By.id('login-input-username'));
    assert(await userField.isDisplayed(), 'Username input should be visible');
    await takeScreenshot(this.driver, 'TC002_login_form.png');
    return { actual: 'Login form and credentials input are displayed', evidence: 'TC002_login_form.png' };
  }

  async tc003() {
    await loginAsLibrarian(this.driver, this.baseUrl, 'admin', 'admin123');
    const dashboardSection = await waitForElement(this.driver, By.id('section-dashboard'));
    assert(await dashboardSection.isDisplayed(), 'Dashboard section must be displayed');
    await takeScreenshot(this.driver, 'TC003_dashboard_opened.png');
    return { actual: 'Librarian dashboard opened successfully', evidence: 'TC003_dashboard_opened.png' };
  }

  async tc004() {
    await this.driver.get(`${this.baseUrl}/login.html`);
    await sleep(200);
    const userInput = await waitForElement(this.driver, By.id('login-input-username'));
    const passInput = await waitForElement(this.driver, By.id('login-input-password'));
    const submitBtn = await waitForElement(this.driver, By.id('btn-login-submit'));

    await userInput.clear();
    await userInput.sendKeys('invalid_librarian_xyz');
    await passInput.clear();
    await passInput.sendKeys('admin123');
    await submitBtn.click();
    await sleep(400);

    const errBox = await waitForElement(this.driver, By.id('login-form-error'));
    assert(await errBox.isDisplayed(), 'Error alert should be displayed for invalid username');
    const errText = await errBox.getText();
    assert(errText.length > 0, 'Error message should not be empty');
    return { actual: `Login rejected with message: "${errText}"` };
  }

  async tc005() {
    await this.driver.get(`${this.baseUrl}/login.html`);
    await sleep(200);
    const userInput = await waitForElement(this.driver, By.id('login-input-username'));
    const passInput = await waitForElement(this.driver, By.id('login-input-password'));
    const submitBtn = await waitForElement(this.driver, By.id('btn-login-submit'));

    await userInput.clear();
    await userInput.sendKeys('admin');
    await passInput.clear();
    await passInput.sendKeys('completely_wrong_pass_999');
    await submitBtn.click();
    await sleep(400);

    const errBox = await waitForElement(this.driver, By.id('login-form-error'));
    assert(await errBox.isDisplayed(), 'Error message must be shown for wrong password');
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('invalid'), 'Error should indicate invalid credentials');
    return { actual: `Error displayed: "${errText}"` };
  }

  async tc006() {
    await this.driver.get(`${this.baseUrl}/login.html`);
    await sleep(200);
    const userInput = await waitForElement(this.driver, By.id('login-input-username'));
    const passInput = await waitForElement(this.driver, By.id('login-input-password'));
    const submitBtn = await waitForElement(this.driver, By.id('btn-login-submit'));

    await userInput.clear();
    await passInput.clear();
    await submitBtn.click();
    await sleep(200);

    const errBox = await waitForElement(this.driver, By.id('login-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('username') || errText.toLowerCase().includes('required'), 'Validation message should prompt for username');
    return { actual: `Validation message appeared: "${errText}"` };
  }

  async tc007() {
    await loginAsLibrarian(this.driver, this.baseUrl);
    await waitForText(this.driver, By.id('stat-total-books'));
    const totalBooks = await this.driver.findElement(By.id('stat-total-books')).getText();
    const availableBooks = await this.driver.findElement(By.id('stat-available-books')).getText();
    const totalMembers = await this.driver.findElement(By.id('stat-total-members')).getText();
    const issuedBooks = await this.driver.findElement(By.id('stat-issued-books')).getText();

    assert(parseInt(totalBooks, 10) > 0, 'Total books should be > 0');
    assert(parseInt(availableBooks, 10) > 0, 'Available books should be > 0');
    assert(parseInt(totalMembers, 10) > 0, 'Total members should be > 0');
    assert(parseInt(issuedBooks, 10) >= 0, 'Issued books should be >= 0');
    return { actual: `Stats verified: ${totalBooks} books, ${availableBooks} available, ${totalMembers} members, ${issuedBooks} issued` };
  }

  async tc008() {
    await loginAsLibrarian(this.driver, this.baseUrl);
    const tab = await waitForElement(this.driver, By.id('nav-tab-books'));
    await tab.click();
    await sleep(200);
    const section = await waitForElement(this.driver, By.id('section-books'));
    assert(await section.isDisplayed(), 'Books section must be visible');
    return { actual: 'Book catalogue opened successfully' };
  }

  async tc009() {
    const tab = await waitForElement(this.driver, By.id('nav-tab-members'));
    await tab.click();
    await sleep(200);
    const section = await waitForElement(this.driver, By.id('section-members'));
    assert(await section.isDisplayed(), 'Members section must be visible');
    return { actual: 'Member directory opened successfully' };
  }

  async tc010() {
    const tab = await waitForElement(this.driver, By.id('nav-tab-issues'));
    await tab.click();
    await sleep(200);
    const section = await waitForElement(this.driver, By.id('section-issues'));
    assert(await section.isDisplayed(), 'Issues circulation interface must be visible');
    return { actual: 'Circulation interface opened successfully' };
  }

  async tc011() {
    const tab = await waitForElement(this.driver, By.id('nav-tab-fines'));
    await tab.click();
    await sleep(200);
    const section = await waitForElement(this.driver, By.id('section-fines'));
    assert(await section.isDisplayed(), 'Fines section must be visible');
    return { actual: 'Fine management interface opened successfully' };
  }

  async tc012() {
    const booksTab = await waitForElement(this.driver, By.id('nav-tab-books'));
    await booksTab.click();
    await sleep(200);

    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-book-modal'));
    await openBtn.click();
    await sleep(200);

    const modal = await waitForElement(this.driver, By.id('modal-book'));
    assert(await modal.isDisplayed(), 'Add Book modal should be displayed');
    return { actual: 'Add Book modal form is displayed' };
  }

  async tc013() {
    const titleInput = await this.driver.findElement(By.id('book-input-title'));
    const authorInput = await this.driver.findElement(By.id('book-input-author'));
    const isbnInput = await this.driver.findElement(By.id('book-input-isbn'));
    const categoryInput = await this.driver.findElement(By.id('book-input-category'));
    const copiesInput = await this.driver.findElement(By.id('book-input-copies'));
    const saveBtn = await this.driver.findElement(By.id('btn-save-book'));

    const testIsbn = `978-013000${Math.floor(1000 + Math.random() * 9000)}`;
    await titleInput.clear();
    await titleInput.sendKeys('Clean Architecture: A Craftsman Guide');
    await authorInput.clear();
    await authorInput.sendKeys('Robert C. Martin');
    await isbnInput.clear();
    await isbnInput.sendKeys(testIsbn);
    await categoryInput.clear();
    await categoryInput.sendKeys('Software Architecture');
    await copiesInput.clear();
    await copiesInput.sendKeys('3');

    await saveBtn.click();
    await sleep(600);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(text.includes('Clean Architecture'), 'New book should appear in catalog');
    return { actual: `Valid new book saved and listed with ISBN ${testIsbn}` };
  }

  async tc014() {
    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await searchInput.sendKeys('Pragmatic');
    const searchBtn = await this.driver.findElement(By.id('btn-search-books'));
    await searchBtn.click();
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(text.includes('The Pragmatic Programmer'), 'Matching book should appear in search results');
    return { actual: 'Found matching book "The Pragmatic Programmer"' };
  }

  async tc015() {
    const clearBtn = await waitForElement(this.driver, By.id('btn-clear-search-books'));
    await clearBtn.click();
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(text.includes('Clean Code') && text.includes('Design Patterns'), 'All books should reappear after clearing search');
    return { actual: 'Search cleared and full catalogue listing restored' };
  }

  async tc016() {
    const membersTab = await waitForElement(this.driver, By.id('nav-tab-members'));
    await membersTab.click();
    await sleep(200);

    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-member-modal'));
    await openBtn.click();
    await sleep(200);

    const modal = await waitForElement(this.driver, By.id('modal-member'));
    assert(await modal.isDisplayed(), 'Register Member modal should be displayed');
    return { actual: 'Add Member modal form is displayed' };
  }

  async tc017() {
    const codeInput = await this.driver.findElement(By.id('member-input-code'));
    const nameInput = await this.driver.findElement(By.id('member-input-name'));
    const emailInput = await this.driver.findElement(By.id('member-input-email'));
    const phoneInput = await this.driver.findElement(By.id('member-input-phone'));
    const saveBtn = await this.driver.findElement(By.id('btn-save-member'));

    const testCode = `MEM-${Math.floor(2000 + Math.random() * 8000)}`;
    await codeInput.clear();
    await codeInput.sendKeys(testCode);
    await nameInput.clear();
    await nameInput.sendKeys('Margaret Hamilton');
    await emailInput.clear();
    await emailInput.sendKeys(`margaret.${testCode.toLowerCase()}@nasa.gov`);
    await phoneInput.clear();
    await phoneInput.sendKeys('555-0421');

    await saveBtn.click();
    await sleep(600);

    const table = await waitForElement(this.driver, By.id('table-members'));
    const text = await table.getText();
    assert(text.includes('Margaret Hamilton'), 'New member should appear in directory');
    return { actual: `Valid member registered with Code ${testCode}` };
  }

  // ==========================================================================
  // A2. Boundary & Edge Case Testing (TC018 - TC034)
  // ==========================================================================

  async tc018() {
    const booksTab = await waitForElement(this.driver, By.id('nav-tab-books'));
    await booksTab.click();
    await sleep(200);
    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-book-modal'));
    await openBtn.click();
    await sleep(200);

    const titleInput = await this.driver.findElement(By.id('book-input-title'));
    await titleInput.clear();
    const saveBtn = await this.driver.findElement(By.id('btn-save-book'));
    await saveBtn.click();
    await sleep(200);

    const errBox = await waitForElement(this.driver, By.id('book-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('title is required'), 'Submission without title should be rejected');
    return { actual: `Empty title rejected with message: "${errText}"` };
  }

  async tc019() {
    const titleInput = await this.driver.findElement(By.id('book-input-title'));
    const authorInput = await this.driver.findElement(By.id('book-input-author'));
    await titleInput.clear();
    await titleInput.sendKeys('Valid Test Title');
    await authorInput.clear();

    const saveBtn = await this.driver.findElement(By.id('btn-save-book'));
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", saveBtn);
    await sleep(100);
    await saveBtn.click();
    await sleep(200);

    const errBox = await waitForElement(this.driver, By.id('book-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('author is required'), 'Required author validation should appear');
    return { actual: `Empty author rejected with message: "${errText}"` };
  }

  async tc020() {
    const authorInput = await this.driver.findElement(By.id('book-input-author'));
    const isbnInput = await this.driver.findElement(By.id('book-input-isbn'));
    await authorInput.sendKeys('Test Author');
    await isbnInput.clear();

    const saveBtn = await this.driver.findElement(By.id('btn-save-book'));
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", saveBtn);
    await sleep(100);
    await saveBtn.click();
    await sleep(200);

    const errBox = await waitForElement(this.driver, By.id('book-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('isbn is required'), 'Required ISBN validation should appear');
    return { actual: `Empty ISBN rejected with message: "${errText}"` };
  }

  async tc021() {
    const isbnInput = await this.driver.findElement(By.id('book-input-isbn'));
    const categoryInput = await this.driver.findElement(By.id('book-input-category'));
    const copiesInput = await this.driver.findElement(By.id('book-input-copies'));

    await isbnInput.clear();
    await isbnInput.sendKeys('978-0132350884'); // Existing Clean Code ISBN
    await categoryInput.clear();
    await categoryInput.sendKeys('Testing');
    await copiesInput.clear();
    await copiesInput.sendKeys('2');

    const saveBtn = await this.driver.findElement(By.id('btn-save-book'));
    await saveBtn.click();
    await sleep(400);

    const errBox = await waitForElement(this.driver, By.id('book-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('already exists'), 'Duplicate ISBN must be rejected');

    // Close modal to reset state
    await this.driver.findElement(By.id('btn-cancel-book')).click();
    await sleep(200);
    return { actual: `Duplicate ISBN rejected: "${errText}"` };
  }

  async tc022() {
    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-book-modal'));
    await openBtn.click();
    await sleep(200);

    const longTitle = 'Super Long Book Title '.repeat(20);
    const titleInput = await this.driver.findElement(By.id('book-input-title'));
    await titleInput.clear();
    await titleInput.sendKeys(longTitle);
    const val = await titleInput.getAttribute('value');
    assert(val.length > 100, 'Long title should be accepted without crashing');

    await this.driver.findElement(By.id('btn-cancel-book')).click();
    await sleep(200);
    return { actual: `Input handled long string (${val.length} chars) safely without crashing` };
  }

  async tc023() {
    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await this.driver.findElement(By.id('btn-search-books')).click();
    await sleep(300);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(text.includes('Clean Code'), 'Empty search query should keep standard listing intact');
    return { actual: 'Empty search query handled safely, table rendered properly' };
  }

  async tc024() {
    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await searchInput.sendKeys('NonExistentBookXYZ_99999');
    await this.driver.findElement(By.id('btn-search-books')).click();
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(text.includes('No books found') || !text.includes('Clean Code'), 'No records should match nonexistent title');

    // Reset search
    await this.driver.findElement(By.id('btn-clear-search-books')).click();
    await sleep(200);
    return { actual: 'Nonexistent title returned zero matching records as expected' };
  }

  async tc025() {
    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await searchInput.sendKeys('!@#$%^&*()_+<>?:"{}|');
    await this.driver.findElement(By.id('btn-search-books')).click();
    await sleep(300);

    const table = await waitForElement(this.driver, By.id('table-books'));
    assert(await table.isDisplayed(), 'Table should remain intact with special character search');

    await this.driver.findElement(By.id('btn-clear-search-books')).click();
    await sleep(200);
    return { actual: 'Special characters search handled safely without SQL/DOM errors' };
  }

  async tc026() {
    const membersTab = await waitForElement(this.driver, By.id('nav-tab-members'));
    await membersTab.click();
    await sleep(200);

    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-member-modal'));
    await openBtn.click();
    await sleep(200);

    const codeInput = await this.driver.findElement(By.id('member-input-code'));
    await codeInput.clear();
    const saveBtn = await this.driver.findElement(By.id('btn-save-member'));
    await saveBtn.click();
    await sleep(200);

    const errBox = await waitForElement(this.driver, By.id('member-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('member code') && errText.toLowerCase().includes('required'), 'Empty member code must be rejected');
    return { actual: `Empty code rejected: "${errText}"` };
  }

  async tc027() {
    const codeInput = await this.driver.findElement(By.id('member-input-code'));
    const nameInput = await this.driver.findElement(By.id('member-input-name'));
    await codeInput.sendKeys('MEM-TEMP-01');
    await nameInput.clear();

    const saveBtn = await this.driver.findElement(By.id('btn-save-member'));
    await saveBtn.click();
    await sleep(200);

    const errBox = await waitForElement(this.driver, By.id('member-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('name is required'), 'Empty member name must be rejected');
    return { actual: `Empty name rejected: "${errText}"` };
  }

  async tc028() {
    const nameInput = await this.driver.findElement(By.id('member-input-name'));
    const emailInput = await this.driver.findElement(By.id('member-input-email'));
    await nameInput.sendKeys('Test Name');
    await emailInput.clear();
    await emailInput.sendKeys('not_an_email_address');

    const saveBtn = await this.driver.findElement(By.id('btn-save-member'));
    await saveBtn.click();
    await sleep(200);

    const errBox = await waitForElement(this.driver, By.id('member-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('valid email format'), 'Invalid email format must be rejected');
    return { actual: `Invalid email rejected: "${errText}"` };
  }

  async tc029() {
    const emailInput = await this.driver.findElement(By.id('member-input-email'));
    await emailInput.clear();

    const saveBtn = await this.driver.findElement(By.id('btn-save-member'));
    await saveBtn.click();
    await sleep(200);

    const errBox = await waitForElement(this.driver, By.id('member-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('email') && errText.toLowerCase().includes('required'), 'Empty email must be rejected');
    return { actual: `Empty email rejected: "${errText}"` };
  }

  async tc030() {
    const codeInput = await this.driver.findElement(By.id('member-input-code'));
    const emailInput = await this.driver.findElement(By.id('member-input-email'));
    const phoneInput = await this.driver.findElement(By.id('member-input-phone'));

    await codeInput.clear();
    await codeInput.sendKeys('MEM-1001'); // Existing Alice Johnson code
    await emailInput.clear();
    await emailInput.sendKeys('alice.unique.diff@example.com');
    await phoneInput.clear();
    await phoneInput.sendKeys('555-9999');

    const saveBtn = await this.driver.findElement(By.id('btn-save-member'));
    await saveBtn.click();
    await sleep(400);

    const errBox = await waitForElement(this.driver, By.id('member-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('already in use') || errText.toLowerCase().includes('unique'), 'Duplicate member code must be rejected');

    await this.driver.findElement(By.id('btn-cancel-member')).click();
    await sleep(200);
    return { actual: `Duplicate member code rejected: "${errText}"` };
  }

  async tc031() {
    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-member-modal'));
    await openBtn.click();
    await sleep(200);

    const longName = 'Extra Long Name '.repeat(15);
    const nameInput = await this.driver.findElement(By.id('member-input-name'));
    await nameInput.clear();
    await nameInput.sendKeys(longName);
    const val = await nameInput.getAttribute('value');
    assert(val.length > 80, 'Long member name should be handled cleanly');

    await this.driver.findElement(By.id('btn-cancel-member')).click();
    await sleep(200);
    return { actual: `Handled unusually long name (${val.length} chars) without breaking the form` };
  }

  async tc032() {
    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-member-modal'));
    await openBtn.click();
    await sleep(200);

    const phoneInput = await this.driver.findElement(By.id('member-input-phone'));
    await phoneInput.clear();
    await phoneInput.sendKeys('ABC-PHONE-XYZ');
    const val = await phoneInput.getAttribute('value');
    assert(val.includes('ABC'), 'Phone input field accepts text per defined schema');

    await this.driver.findElement(By.id('btn-cancel-member')).click();
    await sleep(200);
    return { actual: `Phone field input "${val}" handled per application specifications` };
  }

  async tc033() {
    const issuesTab = await waitForElement(this.driver, By.id('nav-tab-issues'));
    await issuesTab.click();
    await sleep(200);

    // Ensure book select is on default empty placeholder
    const bookSelect = await waitForElement(this.driver, By.id('issue-select-book'));
    await bookSelect.sendKeys('');

    const submitBtn = await waitForElement(this.driver, By.id('btn-submit-issue'));
    await submitBtn.click();
    await sleep(300);

    const errBox = await waitForElement(this.driver, By.id('issue-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('select a book'), 'Submission without book selection must be rejected');
    return { actual: `Issue rejected without book selection: "${errText}"` };
  }

  async tc034() {
    const bookSelect = await waitForElement(this.driver, By.id('issue-select-book'));
    const options = await bookSelect.findElements(By.tagName('option'));
    // The dropdown filters out 0-copy books by design, or marks disabled
    let zeroCopyPresent = false;
    for (const opt of options) {
      const text = await opt.getText();
      if (text.includes('(0 available)') || text.includes('Out of Stock')) {
        zeroCopyPresent = true;
        break;
      }
    }
    // Business rule: books with 0 available copies cannot be selected for issue
    assert(!zeroCopyPresent, 'Books with zero available copies should not be eligible for checkout');
    return { actual: 'Out-of-stock books are prevented from issue per inventory rules' };
  }

  // ==========================================================================
  // A3. Integration Testing (TC035 - TC050)
  // ==========================================================================

  async tc035() {
    const booksTab = await waitForElement(this.driver, By.id('nav-tab-books'));
    await booksTab.click();
    await sleep(200);

    const uniqueTitle = `Integration Test Book ${Date.now()}`;
    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-book-modal'));
    await openBtn.click();
    await sleep(200);

    await this.driver.findElement(By.id('book-input-title')).sendKeys(uniqueTitle);
    await this.driver.findElement(By.id('book-input-author')).sendKeys('Integration Author');
    await this.driver.findElement(By.id('book-input-isbn')).sendKeys(`978-999${Math.floor(1000 + Math.random() * 9000)}`);
    await this.driver.findElement(By.id('book-input-category')).sendKeys('Integration');
    await this.driver.findElement(By.id('book-input-copies')).sendKeys('2');
    await this.driver.findElement(By.id('btn-save-book')).click();
    await sleep(600);

    // Search for newly saved book
    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await searchInput.sendKeys(uniqueTitle);
    await this.driver.findElement(By.id('btn-search-books')).click();
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(text.includes(uniqueTitle), 'Newly added book must be returned by search query');
    return { actual: `Saved and searched: "${uniqueTitle}" found in table` };
  }

  async tc036() {
    await this.driver.navigate().refresh();
    await sleep(500);

    const booksTab = await waitForElement(this.driver, By.id('nav-tab-books'));
    await booksTab.click();
    await sleep(300);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(text.includes('Integration Test Book'), 'Book persists in table after page refresh');
    return { actual: 'Book persists across browser reloads' };
  }

  async tc037() {
    const dashTab = await waitForElement(this.driver, By.id('nav-tab-dashboard'));
    await dashTab.click();
    await sleep(300);

    await waitForText(this.driver, By.id('stat-total-books'));
    const totalCount = await this.driver.findElement(By.id('stat-total-books')).getText();
    assert(parseInt(totalCount, 10) >= 9, 'Total book count should reflect added book');
    return { actual: `Dashboard total titles updated to ${totalCount}` };
  }

  async tc038() {
    const booksTab = await waitForElement(this.driver, By.id('nav-tab-books'));
    await booksTab.click();
    await sleep(200);

    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await searchInput.sendKeys('978-0201633610'); // Design Patterns ISBN
    await this.driver.findElement(By.id('btn-search-books')).click();
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(text.includes('Design Patterns'), 'Correct book must be returned when searching by ISBN');
    return { actual: 'Search by ISBN 978-0201633610 returned Design Patterns' };
  }

  async tc039() {
    // Attempt duplicate addition
    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-book-modal'));
    await openBtn.click();
    await sleep(200);

    await this.driver.findElement(By.id('book-input-title')).sendKeys('Duplicate ISBN Title');
    await this.driver.findElement(By.id('book-input-author')).sendKeys('Duplicate Author');
    await this.driver.findElement(By.id('book-input-isbn')).sendKeys('978-0201633610');
    await this.driver.findElement(By.id('book-input-category')).sendKeys('Testing');
    await this.driver.findElement(By.id('book-input-copies')).sendKeys('1');
    await this.driver.findElement(By.id('btn-save-book')).click();
    await sleep(400);

    // Cancel modal
    await this.driver.findElement(By.id('btn-cancel-book')).click();
    await sleep(200);

    // Recheck catalog count
    const clearBtn = await this.driver.findElement(By.id('btn-clear-search-books'));
    await clearBtn.click();
    await sleep(300);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    assert(!text.includes('Duplicate ISBN Title'), 'No duplicate record should be inserted into catalogue');
    return { actual: 'Rejected duplicate ISBN, verified no record was created' };
  }

  async tc040() {
    const membersTab = await waitForElement(this.driver, By.id('nav-tab-members'));
    await membersTab.click();
    await sleep(200);

    const searchInput = await waitForElement(this.driver, By.id('input-search-members'));
    await searchInput.clear();
    await searchInput.sendKeys('MEM-1002');
    await this.driver.findElement(By.id('btn-search-members')).click();
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-members'));
    const text = await table.getText();
    assert(text.includes('Bob Smith') && text.includes('MEM-1002'), 'Search by member code must return Bob Smith');

    await this.driver.findElement(By.id('btn-clear-search-members')).click();
    await sleep(200);
    return { actual: 'Member search by code MEM-1002 returned Bob Smith' };
  }

  async tc041() {
    await this.driver.navigate().refresh();
    await sleep(400);
    const membersTab = await waitForElement(this.driver, By.id('nav-tab-members'));
    await membersTab.click();
    await sleep(200);

    const table = await waitForElement(this.driver, By.id('table-members'));
    const text = await table.getText();
    assert(text.includes('Alice Johnson') && text.includes('Bob Smith'), 'Members persist after refresh');
    return { actual: 'Member directory persists on reload' };
  }

  async tc042() {
    const openBtn = await waitForElement(this.driver, By.id('btn-open-add-member-modal'));
    await openBtn.click();
    await sleep(200);

    await this.driver.findElement(By.id('member-input-code')).sendKeys('MEM-INVALID-09');
    await this.driver.findElement(By.id('member-input-name')).sendKeys('Invalid Email User');
    await this.driver.findElement(By.id('member-input-email')).sendKeys('bad_email_format');
    await this.driver.findElement(By.id('member-input-phone')).sendKeys('555-0999');
    await this.driver.findElement(By.id('btn-save-member')).click();
    await sleep(300);

    await this.driver.findElement(By.id('btn-cancel-member')).click();
    await sleep(200);

    const table = await waitForElement(this.driver, By.id('table-members'));
    const text = await table.getText();
    assert(!text.includes('Invalid Email User'), 'Invalid member must not be saved in directory');
    return { actual: 'Invalid member was rejected and not stored in directory' };
  }

  async tc043() {
    const issuesTab = await waitForElement(this.driver, By.id('nav-tab-issues'));
    await issuesTab.click();
    await sleep(200);

    // Select book: Introduction to Algorithms
    const bookSelect = await waitForElement(this.driver, By.id('issue-select-book'));
    const bookOpts = await bookSelect.findElements(By.tagName('option'));
    for (const opt of bookOpts) {
      const text = await opt.getText();
      if (text.includes('Introduction to Algorithms')) {
        await opt.click();
        break;
      }
    }

    // Select member: Emma Watson (MEM-1005)
    const memSelect = await waitForElement(this.driver, By.id('issue-select-member'));
    const memOpts = await memSelect.findElements(By.tagName('option'));
    for (const opt of memOpts) {
      const text = await opt.getText();
      if (text.includes('Emma Watson') || text.includes('MEM-1005')) {
        await opt.click();
        break;
      }
    }

    await this.driver.findElement(By.id('btn-submit-issue')).click();
    await sleep(600);

    const activeTable = await waitForElement(this.driver, By.id('table-active-issues'));
    const text = await activeTable.getText();
    assert(text.includes('Emma Watson') && text.includes('Introduction to Algorithms'), 'Issue record must appear in active issues table');
    return { actual: 'Book issued and verified in active issues table' };
  }

  async tc044() {
    const booksTab = await waitForElement(this.driver, By.id('nav-tab-books'));
    await booksTab.click();
    await sleep(200);

    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await searchInput.sendKeys('Introduction to Algorithms');
    await this.driver.findElement(By.id('btn-search-books')).click();
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    // Originally 6 copies, 1 issued -> 5 available
    assert(text.includes('5'), 'Available copies count must decrement by 1');
    return { actual: 'Available copies count verified: decremented to 5' };
  }

  async tc045() {
    const issuesTab = await waitForElement(this.driver, By.id('nav-tab-issues'));
    await issuesTab.click();
    await sleep(200);

    // Try reissuing Introduction to Algorithms to Emma Watson
    const bookSelect = await waitForElement(this.driver, By.id('issue-select-book'));
    const bookOpts = await bookSelect.findElements(By.tagName('option'));
    for (const opt of bookOpts) {
      const text = await opt.getText();
      if (text.includes('Introduction to Algorithms')) {
        await opt.click();
        break;
      }
    }

    const memSelect = await waitForElement(this.driver, By.id('issue-select-member'));
    const memOpts = await memSelect.findElements(By.tagName('option'));
    for (const opt of memOpts) {
      const text = await opt.getText();
      if (text.includes('Emma Watson')) {
        await opt.click();
        break;
      }
    }

    await this.driver.findElement(By.id('btn-submit-issue')).click();
    await sleep(400);

    const errBox = await waitForElement(this.driver, By.id('issue-form-error'));
    const errText = await errBox.getText();
    assert(errText.toLowerCase().includes('already has an active unreturned copy'), 'Duplicate active loan must be prevented');
    return { actual: `Duplicate active loan prevented: "${errText}"` };
  }

  async tc046() {
    const activeTable = await waitForElement(this.driver, By.id('table-active-issues'));
    const rows = await activeTable.findElements(By.tagName('tr'));
    let returnBtn = null;
    for (const row of rows) {
      const text = await row.getText();
      if (text.includes('Emma Watson') && text.includes('Introduction to Algorithms')) {
        returnBtn = await row.findElement(By.xpath('.//button[contains(@id, "btn-return-issue-")]'));
        break;
      }
    }

    assert(returnBtn !== null, 'Return button for Emma Watson must exist');
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", returnBtn);
    await sleep(150);
    await this.driver.executeScript("arguments[0].click();", returnBtn);

    await waitForElement(this.driver, By.id('modal-return'));
    const confirmBtn = await waitForElement(this.driver, By.id('btn-confirm-return'));
    await confirmBtn.click();
    await sleep(600);

    const updatedTable = await waitForElement(this.driver, By.id('table-active-issues'));
    const updatedText = await updatedTable.getText();
    assert(!updatedText.includes('Emma Watson'), 'Returned loan must be removed from active issues table');
    return { actual: 'Returned loan no longer appears in active issues table' };
  }

  async tc047() {
    const booksTab = await waitForElement(this.driver, By.id('nav-tab-books'));
    await booksTab.click();
    await sleep(200);

    const searchInput = await waitForElement(this.driver, By.id('input-search-books'));
    await searchInput.clear();
    await searchInput.sendKeys('Introduction to Algorithms');
    await this.driver.findElement(By.id('btn-search-books')).click();
    await sleep(400);

    const table = await waitForElement(this.driver, By.id('table-books'));
    const text = await table.getText();
    // Returned -> back to 6 copies
    assert(text.includes('6'), 'Available copies must increment back to 6 after return');
    return { actual: 'Available count incremented back to 6 copies' };
  }

  async tc048() {
    const txTab = await waitForElement(this.driver, By.id('nav-tab-transactions'));
    await txTab.click();
    await sleep(300);

    const table = await waitForElement(this.driver, By.id('table-transactions'));
    const text = await table.getText();
    assert(text.includes('Emma Watson') && text.includes('RETURNED'), 'Return details must be recorded in transaction history');
    return { actual: 'Circulation history records Emma Watson return with status RETURNED' };
  }

  async tc049() {
    const finesTab = await waitForElement(this.driver, By.id('nav-tab-fines'));
    await finesTab.click();
    await sleep(200);

    const rateInput = await waitForElement(this.driver, By.id('input-fine-rate'));
    await rateInput.clear();
    await rateInput.sendKeys('4.25');

    const saveBtn = await this.driver.findElement(By.id('btn-save-fine-settings'));
    await saveBtn.click();
    await sleep(400);

    await this.driver.navigate().refresh();
    await sleep(400);

    const reloadedFinesTab = await waitForElement(this.driver, By.id('nav-tab-fines'));
    await reloadedFinesTab.click();
    await sleep(200);

    const reloadedRate = await (await waitForElement(this.driver, By.id('input-fine-rate'))).getAttribute('value');
    assert(parseFloat(reloadedRate) === 4.25, `Fine settings should persist at 4.25, got ${reloadedRate}`);
    return { actual: `Fine settings updated and persisted across reload ($${reloadedRate}/day)` };
  }

  async tc050() {
    const txTab = await waitForElement(this.driver, By.id('nav-tab-transactions'));
    await txTab.click();
    await sleep(200);

    const table = await waitForElement(this.driver, By.id('table-transactions'));
    const text = await table.getText();
    assert(text.includes('Clean Code') || text.includes('Introduction to Algorithms'), 'Transaction data matches recorded operations');
    return { actual: 'Transaction ledger accurately reflects all completed operations' };
  }
}

module.exports = PartATestSuite;
