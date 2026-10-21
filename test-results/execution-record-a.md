# Athena Library Management System - Selenium Automation Execution Record

**Execution Date:** 2026-10-21T11:48:09.004Z
**Scope:** A (50 Test Cases)
**Summary:** Total: 50 | Passed: 43 | Failed: 7

| Test ID | Category | Preconditions | Test Data | Expected Result | Actual Result | Status | Evidence |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| TC001 | Part A - Functional E2E | Server is running | URL: /login.html | Application loads successfully | Application loaded with title "Athena LMS | Sign In" | **PASS** | - |
| TC002 | Part A - Functional E2E | Browser opened | Navigating to /login.html | Login form is displayed | Login form and credentials input are displayed | **PASS** | [TC002_login_form.png](screenshots/TC002_login_form.png) |
| TC003 | Part A - Functional E2E | On login page | Username: admin, Password: admin123 | Dashboard opens | Librarian dashboard opened successfully | **PASS** | [TC003_dashboard_opened.png](screenshots/TC003_dashboard_opened.png) |
| TC004 | Part A - Functional E2E | On login page | Username: invalid_librarian_xyz, Password: admin123 | Login is rejected | Error: Waiting for element to be located By(css selector, *[id="login-input-username"])
Wait timed out after 5019ms | **FAIL** | [FAIL_TC004.png](screenshots/FAIL_TC004.png) |
| TC005 | Part A - Functional E2E | On login page | Username: admin, Password: completely_wrong_pass_999 | Error is displayed | Error: Waiting for element to be located By(css selector, *[id="login-input-username"])
Wait timed out after 5021ms | **FAIL** | [FAIL_TC005.png](screenshots/FAIL_TC005.png) |
| TC006 | Part A - Functional E2E | On login page | Username: "", Password: "" | Validation appears | Error: Waiting for element to be located By(css selector, *[id="login-input-username"])
Wait timed out after 5095ms | **FAIL** | [FAIL_TC006.png](screenshots/FAIL_TC006.png) |
| TC007 | Part A - Functional E2E | Logged in as Librarian | Dashboard metrics elements | Book, member and issue statistics appear | Error: Waiting for element to be located By(css selector, *[id="login-input-username"])
Wait timed out after 5015ms | **FAIL** | [FAIL_TC007.png](screenshots/FAIL_TC007.png) |
| TC008 | Part A - Functional E2E | On dashboard | Click #nav-tab-books | Book catalogue opens | Error: Waiting for element to be located By(css selector, *[id="login-input-username"])
Wait timed out after 5097ms | **FAIL** | [FAIL_TC008.png](screenshots/FAIL_TC008.png) |
| TC009 | Part A - Functional E2E | On dashboard | Click #nav-tab-members | Member directory opens | Member directory opened successfully | **PASS** | - |
| TC010 | Part A - Functional E2E | On dashboard | Click #nav-tab-issues | Circulation interface opens | Circulation interface opened successfully | **PASS** | - |
| TC011 | Part A - Functional E2E | On dashboard | Click #nav-tab-fines | Fine management opens | Fine management interface opened successfully | **PASS** | - |
| TC012 | Part A - Functional E2E | On Books tab | Click #btn-open-add-book-modal | Book form is displayed | Add Book modal form is displayed | **PASS** | - |
| TC013 | Part A - Functional E2E | Add Book form open | Title: Clean Architecture, Author: Robert C. Martin, Copies: 3 | Book is saved | Valid new book saved and listed with ISBN 978-0130001898 | **PASS** | - |
| TC014 | Part A - Functional E2E | On Books tab | Search query: "Pragmatic" | Matching record appears | Found matching book "The Pragmatic Programmer" | **PASS** | - |
| TC015 | Part A - Functional E2E | Search active | Click #btn-clear-search-books | Catalogue returns to its normal listing | Search cleared and full catalogue listing restored | **PASS** | - |
| TC016 | Part A - Functional E2E | On Members tab | Click #btn-open-add-member-modal | Member form is displayed | Add Member modal form is displayed | **PASS** | - |
| TC017 | Part A - Functional E2E | Add Member form open | Name: Margaret Hamilton, Phone: 555-0421 | Member appears in the directory | Valid member registered with Code MEM-9338 | **PASS** | - |
| TC018 | Part A - Boundary & Edge | Add Book form open | Title: "" | Submission is rejected | Empty title rejected with message: "Book title is required and cannot be empty." | **PASS** | - |
| TC019 | Part A - Boundary & Edge | Add Book form open | Title: "Valid Title", Author: "" | Required-field validation appears, if required by the form | Error: element click intercepted: Element <button type="button" class="btn btn-primary" id="btn-save-book">...</button> is not clickable at point (821, 653). Other element would receive the click: <div id="notification-banner" role="alert" data-type="success" class="active toast-success">...</div>
  (Session info: chrome=155.0.8059.85) | **FAIL** | [FAIL_TC019.png](screenshots/FAIL_TC019.png) |
| TC020 | Part A - Boundary & Edge | Add Book form open | ISBN: "" | Submission is rejected if ISBN is mandatory | Error: Required ISBN validation should appear | **FAIL** | [FAIL_TC020.png](screenshots/FAIL_TC020.png) |
| TC021 | Part A - Boundary & Edge | Add Book form open | ISBN: 978-0132350884 | Duplicate ISBN is rejected | Duplicate ISBN rejected: "A book with ISBN "978-0132350884" already exists in the system" | **PASS** | - |
| TC022 | Part A - Boundary & Edge | Add Book form open | Title length > 400 chars | Input is handled without crashing | Input handled long string (440 chars) safely without crashing | **PASS** | - |
| TC023 | Part A - Boundary & Edge | On Books tab | Query: "" | Catalogue handles the empty query correctly | Empty search query handled safely, table rendered properly | **PASS** | - |
| TC024 | Part A - Boundary & Edge | On Books tab | Query: "NonExistentBookXYZ_99999" | No matching records are reported | Nonexistent title returned zero matching records as expected | **PASS** | - |
| TC025 | Part A - Boundary & Edge | On Books tab | Query: "!@#$%^&*()_+<>?:"{}|" | Input is handled safely | Special characters search handled safely without SQL/DOM errors | **PASS** | - |
| TC026 | Part A - Boundary & Edge | Add Member form open | Code: "" | Registration is rejected | Empty code rejected: "Member Code / ID is required and cannot be empty." | **PASS** | - |
| TC027 | Part A - Boundary & Edge | Add Member form open | Name: "" | Required-field validation appears, if mandatory | Empty name rejected: "Member name is required and cannot be empty." | **PASS** | - |
| TC028 | Part A - Boundary & Edge | Add Member form open | Email: "not_an_email_address" | Email validation rejects the value | Invalid email rejected: "Please provide a valid email format (e.g. name@example.com)." | **PASS** | - |
| TC029 | Part A - Boundary & Edge | Add Member form open | Email: "" | Submission is rejected if email is mandatory | Empty email rejected: "Email address is required." | **PASS** | - |
| TC030 | Part A - Boundary & Edge | Add Member form open | Code: MEM-1001 | Duplicate code is rejected | Duplicate member code rejected: "Member ID / Code "MEM-1001" is already in use by another member" | **PASS** | - |
| TC031 | Part A - Boundary & Edge | Add Member form open | Name length > 200 chars | Input is handled without breaking the form | Handled unusually long name (240 chars) without breaking the form | **PASS** | - |
| TC032 | Part A - Boundary & Edge | Add Member form open | Phone: "ABC-PHONE-XYZ" | Validation follows the application's rules | Phone field input "ABC-PHONE-XYZ" handled per application specifications | **PASS** | - |
| TC033 | Part A - Boundary & Edge | On Issues tab | Book select: unselected | Submission is rejected | Issue rejected without book selection: "Please select a book to issue." | **PASS** | - |
| TC034 | Part A - Boundary & Edge | On Issues tab | Book with 0 available copies | Issue is rejected | Out-of-stock books are prevented from issue per inventory rules | **PASS** | - |
| TC035 | Part A - Integration | Books tab open | Integration Test Book | Newly saved book appears | Saved and searched: "Integration Test Book 1792583269925" found in table | **PASS** | - |
| TC036 | Part A - Integration | Book saved | Page refresh | Book remains saved | Book persists across browser reloads | **PASS** | - |
| TC037 | Part A - Integration | Book added | Dashboard Total Books count | Total book count updates as designed | Dashboard total titles updated to 10 | **PASS** | - |
| TC038 | Part A - Integration | Books tab open | ISBN: 978-0201633610 | Correct book is returned | Search by ISBN 978-0201633610 returned Design Patterns | **PASS** | - |
| TC039 | Part A - Integration | Books tab open | Existing ISBN submission | No duplicate record is created | Rejected duplicate ISBN, verified no record was created | **PASS** | - |
| TC040 | Part A - Integration | Members tab open | Search: MEM-1002 | Correct member is returned | Member search by code MEM-1002 returned Bob Smith | **PASS** | - |
| TC041 | Part A - Integration | Members directory | Page refresh | Member remains saved | Member directory persists on reload | **PASS** | - |
| TC042 | Part A - Integration | Add Member form | Invalid email submission | Invalid member is not saved | Invalid member was rejected and not stored in directory | **PASS** | - |
| TC043 | Part A - Integration | Circulation tab | Algorithms issued to Emma Watson | Issue record appears | Book issued and verified in active issues table | **PASS** | - |
| TC044 | Part A - Integration | Book issued | Catalog available copies check | Availability updates correctly | Available copies count verified: decremented to 5 | **PASS** | - |
| TC045 | Part A - Integration | Active loan present | Re-issue same book to same member | Duplicate active issue is prevented | Duplicate active loan prevented: "Member "Emma Watson" already has an active unreturned copy of "Introduction to Algorithms (CLRS)"" | **PASS** | - |
| TC046 | Part A - Integration | Active loan present | Return flow execution | Returned loan is no longer active | Returned loan no longer appears in active issues table | **PASS** | - |
| TC047 | Part A - Integration | Book returned | Catalog copy count restoration | Availability updates correctly | Available count incremented back to 6 copies | **PASS** | - |
| TC048 | Part A - Integration | Book returned | Transaction history tab | Return details are recorded | Circulation history records Emma Watson return with status RETURNED | **PASS** | - |
| TC049 | Part A - Integration | Fines settings tab | Fine rate: $4.25/day | Saved settings persist | Fine settings updated and persisted across reload ($4.25/day) | **PASS** | - |
| TC050 | Part A - Integration | Transaction history ledger | Ledger status inspection | Transaction data matches the completed operation | Transaction ledger accurately reflects all completed operations | **PASS** | - |
