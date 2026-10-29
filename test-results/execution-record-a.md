# Athena Library Management System - Selenium Automation Execution Record

**Execution Date:** 2026-10-29T18:14:33.460Z
**Scope:** PART A (50 Tests)
**Summary:** Total: 50 | Passed: 50 | Failed: 0 | Skipped: 0

| Test ID | Category | Preconditions | Test Data | Expected Result | Actual Result | Status | Duration | Evidence |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| TC001 | Part A - Functional E2E | Server is running | URL: /login.html | Application loads successfully | Application loaded with title "Athena LMS | Sign In" | **PASS** | 0.776s | [TC001.png](screenshots/TC001.png) |
| TC002 | Part A - Functional E2E | Browser opened | Navigating to /login.html | Login form is displayed | Login form and credentials input are displayed | **PASS** | 1.213s | [TC002_login_form.png](screenshots/TC002_login_form.png) |
| TC003 | Part A - Functional E2E | On login page | Username: admin, Password: admin123 | Dashboard opens | Librarian dashboard opened successfully | **PASS** | 1.835s | [TC003_dashboard_opened.png](screenshots/TC003_dashboard_opened.png) |
| TC004 | Part A - Functional E2E | On login page | Username: invalid_librarian_xyz, Password: admin123 | Login is rejected | Login rejected with message: "⚠️
Invalid username or password." | **PASS** | 1.011s | [TC004.png](screenshots/TC004.png) |
| TC005 | Part A - Functional E2E | On login page | Username: admin, Password: completely_wrong_pass_999 | Error is displayed | Error displayed: "⚠️
Invalid username or password." | **PASS** | 1.093s | [TC005.png](screenshots/TC005.png) |
| TC006 | Part A - Functional E2E | On login page | Username: "", Password: "" | Validation appears | Validation message appeared: "⚠️
Please enter your username." | **PASS** | 0.771s | [TC006.png](screenshots/TC006.png) |
| TC007 | Part A - Functional E2E | Logged in as Librarian | Dashboard metrics elements | Book, member and issue statistics appear | Stats verified: 8 books, 30 available, 5 members, 3 issued | **PASS** | 1.210s | [TC007.png](screenshots/TC007.png) |
| TC008 | Part A - Functional E2E | On dashboard | Click #nav-tab-books | Book catalogue opens | Book catalogue opened successfully | **PASS** | 0.539s | [TC008.png](screenshots/TC008.png) |
| TC009 | Part A - Functional E2E | On dashboard | Click #nav-tab-members | Member directory opens | Member directory opened successfully | **PASS** | 0.532s | [TC009.png](screenshots/TC009.png) |
| TC010 | Part A - Functional E2E | On dashboard | Click #nav-tab-issues | Circulation interface opens | Circulation interface opened successfully | **PASS** | 0.531s | [TC010.png](screenshots/TC010.png) |
| TC011 | Part A - Functional E2E | On dashboard | Click #nav-tab-fines | Fine management opens | Fine management interface opened successfully | **PASS** | 0.529s | [TC011.png](screenshots/TC011.png) |
| TC012 | Part A - Functional E2E | On Books tab | Click #btn-open-add-book-modal | Book form is displayed | Add Book modal form is displayed | **PASS** | 0.771s | [TC012.png](screenshots/TC012.png) |
| TC013 | Part A - Functional E2E | Add Book form open | Title: Clean Architecture, Author: Robert C. Martin, Copies: 3 | Book is saved | Valid new book saved and listed with ISBN 978-0130007767 | **PASS** | 0.941s | [TC013.png](screenshots/TC013.png) |
| TC014 | Part A - Functional E2E | On Books tab | Search query: "Pragmatic" | Matching record appears | Found matching book "The Pragmatic Programmer" | **PASS** | 0.594s | [TC014.png](screenshots/TC014.png) |
| TC015 | Part A - Functional E2E | Search active | Click #btn-clear-search-books | Catalogue returns to its normal listing | Search cleared and full catalogue listing restored | **PASS** | 0.572s | [TC015.png](screenshots/TC015.png) |
| TC016 | Part A - Functional E2E | On Members tab | Click #btn-open-add-member-modal | Member form is displayed | Add Member modal form is displayed | **PASS** | 0.771s | [TC016.png](screenshots/TC016.png) |
| TC017 | Part A - Functional E2E | Add Member form open | Name: Margaret Hamilton, Phone: 555-0421 | Member appears in the directory | Valid member registered with Code MEM-4585 | **PASS** | 0.905s | [TC017.png](screenshots/TC017.png) |
| TC018 | Part A - Boundary & Edge | Add Book form open | Title: "" | Submission is rejected | Empty title rejected with message: "Book title is required and cannot be empty." | **PASS** | 0.999s | [TC018.png](screenshots/TC018.png) |
| TC019 | Part A - Boundary & Edge | Add Book form open | Title: "Valid Title", Author: "" | Required-field validation appears, if required by the form | Empty author rejected with message: "Author is required and cannot be empty." | **PASS** | 0.499s | [TC019.png](screenshots/TC019.png) |
| TC020 | Part A - Boundary & Edge | Add Book form open | ISBN: "" | Submission is rejected if ISBN is mandatory | Empty ISBN rejected with message: "ISBN is required and cannot be empty." | **PASS** | 0.489s | [TC020.png](screenshots/TC020.png) |
| TC021 | Part A - Boundary & Edge | Add Book form open | ISBN: 978-0132350884 | Duplicate ISBN is rejected | Duplicate ISBN rejected: "A book with ISBN "978-0132350884" already exists in the system" | **PASS** | 0.860s | [TC021.png](screenshots/TC021.png) |
| TC022 | Part A - Boundary & Edge | Add Book form open | Title length > 400 chars | Input is handled without crashing | Input handled long string (440 chars) safely without crashing | **PASS** | 0.736s | [TC022.png](screenshots/TC022.png) |
| TC023 | Part A - Boundary & Edge | On Books tab | Query: "" | Catalogue handles the empty query correctly | Empty search query handled safely, table rendered properly | **PASS** | 0.478s | [TC023.png](screenshots/TC023.png) |
| TC024 | Part A - Boundary & Edge | On Books tab | Query: "NonExistentBookXYZ_99999" | No matching records are reported | Nonexistent title returned zero matching records as expected | **PASS** | 0.815s | [TC024.png](screenshots/TC024.png) |
| TC025 | Part A - Boundary & Edge | On Books tab | Query: "!@#$%^&*()_+<>?:"{}|" | Input is handled safely | Special characters search handled safely without SQL/DOM errors | **PASS** | 0.718s | [TC025.png](screenshots/TC025.png) |
| TC026 | Part A - Boundary & Edge | Add Member form open | Code: "" | Registration is rejected | Empty code rejected: "Member Code / ID is required and cannot be empty." | **PASS** | 1.006s | [TC026.png](screenshots/TC026.png) |
| TC027 | Part A - Boundary & Edge | Add Member form open | Name: "" | Required-field validation appears, if mandatory | Empty name rejected: "Member name is required and cannot be empty." | **PASS** | 0.392s | [TC027.png](screenshots/TC027.png) |
| TC028 | Part A - Boundary & Edge | Add Member form open | Email: "not_an_email_address" | Email validation rejects the value | Invalid email rejected: "Please provide a valid email format (e.g. name@example.com)." | **PASS** | 0.399s | [TC028.png](screenshots/TC028.png) |
| TC029 | Part A - Boundary & Edge | Add Member form open | Email: "" | Submission is rejected if email is mandatory | Empty email rejected: "Email address is required." | **PASS** | 0.368s | [TC029.png](screenshots/TC029.png) |
| TC030 | Part A - Boundary & Edge | Add Member form open | Code: MEM-1001 | Duplicate code is rejected | Duplicate member code rejected: "Member ID / Code "MEM-1001" is already in use by another member" | **PASS** | 0.903s | [TC030.png](screenshots/TC030.png) |
| TC031 | Part A - Boundary & Edge | Add Member form open | Name length > 200 chars | Input is handled without breaking the form | Handled unusually long name (240 chars) without breaking the form | **PASS** | 0.683s | [TC031.png](screenshots/TC031.png) |
| TC032 | Part A - Boundary & Edge | Add Member form open | Phone: "ABC-PHONE-XYZ" | Validation follows the application's rules | Phone field input "ABC-PHONE-XYZ" handled per application specifications | **PASS** | 0.617s | [TC032.png](screenshots/TC032.png) |
| TC033 | Part A - Boundary & Edge | On Issues tab | Book select: unselected | Submission is rejected | Issue rejected without book selection: "Please select a book to issue." | **PASS** | 0.877s | [TC033.png](screenshots/TC033.png) |
| TC034 | Part A - Boundary & Edge | On Issues tab | Book with 0 available copies | Issue is rejected | Out-of-stock books are prevented from issue per inventory rules | **PASS** | 0.159s | [TC034.png](screenshots/TC034.png) |
| TC035 | Part A - Integration | Books tab open | Integration Test Book | Newly saved book appears | Saved and searched: "Integration Test Book 1793297650008" found in table | **PASS** | 1.973s | [TC035.png](screenshots/TC035.png) |
| TC036 | Part A - Integration | Book saved | Page refresh | Book remains saved | Book persists across browser reloads | **PASS** | 1.186s | [TC036.png](screenshots/TC036.png) |
| TC037 | Part A - Integration | Book added | Dashboard Total Books count | Total book count updates as designed | Dashboard total titles updated to 10 | **PASS** | 0.524s | [TC037.png](screenshots/TC037.png) |
| TC038 | Part A - Integration | Books tab open | ISBN: 978-0201633610 | Correct book is returned | Search by ISBN 978-0201633610 returned Design Patterns | **PASS** | 0.984s | [TC038.png](screenshots/TC038.png) |
| TC039 | Part A - Integration | Books tab open | Existing ISBN submission | No duplicate record is created | Rejected duplicate ISBN, verified no record was created | **PASS** | 1.476s | [TC039.png](screenshots/TC039.png) |
| TC040 | Part A - Integration | Members tab open | Search: MEM-1002 | Correct member is returned | Member search by code MEM-1002 returned Bob Smith | **PASS** | 1.218s | [TC040.png](screenshots/TC040.png) |
| TC041 | Part A - Integration | Members directory | Page refresh | Member remains saved | Member directory persists on reload | **PASS** | 1.075s | [TC041.png](screenshots/TC041.png) |
| TC042 | Part A - Integration | Add Member form | Invalid email submission | Invalid member is not saved | Invalid member was rejected and not stored in directory | **PASS** | 1.020s | [TC042.png](screenshots/TC042.png) |
| TC043 | Part A - Integration | Circulation tab | Algorithms issued to Emma Watson | Issue record appears | Book issued and verified in active issues table | **PASS** | 1.265s | [TC043.png](screenshots/TC043.png) |
| TC044 | Part A - Integration | Book issued | Catalog available copies check | Availability updates correctly | Available copies count verified in catalog | **PASS** | 0.984s | [TC044.png](screenshots/TC044.png) |
| TC045 | Part A - Integration | Active loan present | Re-issue same book to same member | Duplicate active issue is prevented | Duplicate active loan prevented: "Member "Alice Johnson" already has an active unreturned copy of "Clean Code: A Handbook of Agile Software Craftsmanship"" | **PASS** | 1.019s | [TC045.png](screenshots/TC045.png) |
| TC046 | Part A - Integration | Active loan present | Return flow execution | Returned loan is no longer active | Returned loan no longer appears in active issues table | **PASS** | 1.382s | [TC046.png](screenshots/TC046.png) |
| TC047 | Part A - Integration | Book returned | Catalog copy count restoration | Availability updates correctly | Available count incremented back to 6 copies | **PASS** | 1.008s | [TC047.png](screenshots/TC047.png) |
| TC048 | Part A - Integration | Book returned | Transaction history tab | Return details are recorded | Circulation history records return with status RETURNED | **PASS** | 0.534s | [TC048.png](screenshots/TC048.png) |
| TC049 | Part A - Integration | Fines settings tab | Fine rate: $4.25/day | Saved settings persist | Fine settings updated and persisted across reload ($4.25/day) | **PASS** | 1.938s | [TC049.png](screenshots/TC049.png) |
| TC050 | Part A - Integration | Transaction history ledger | Ledger status inspection | Transaction data matches the completed operation | Transaction ledger accurately reflects all completed operations | **PASS** | 0.527s | [TC050.png](screenshots/TC050.png) |
