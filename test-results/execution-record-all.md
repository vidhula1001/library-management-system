# Athena Library Management System - Selenium Automation Execution Record

**Execution Date:** 2026-10-21T13:04:43.847Z
**Scope:** ALL (100 Test Cases)
**Summary:** Total: 100 | Passed: 100 | Failed: 0

| Test ID | Category | Preconditions | Test Data | Expected Result | Actual Result | Status | Evidence |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| TC001 | Part A - Functional E2E | Server is running | URL: /login.html | Application loads successfully | Application loaded with title "Athena LMS | Sign In" | **PASS** | - |
| TC002 | Part A - Functional E2E | Browser opened | Navigating to /login.html | Login form is displayed | Login form and credentials input are displayed | **PASS** | [TC002_login_form.png](screenshots/TC002_login_form.png) |
| TC003 | Part A - Functional E2E | On login page | Username: admin, Password: admin123 | Dashboard opens | Librarian dashboard opened successfully | **PASS** | [TC003_dashboard_opened.png](screenshots/TC003_dashboard_opened.png) |
| TC004 | Part A - Functional E2E | On login page | Username: invalid_librarian_xyz, Password: admin123 | Login is rejected | Login rejected with message: "⚠️
Invalid username or password." | **PASS** | - |
| TC005 | Part A - Functional E2E | On login page | Username: admin, Password: completely_wrong_pass_999 | Error is displayed | Error displayed: "⚠️
Invalid username or password." | **PASS** | - |
| TC006 | Part A - Functional E2E | On login page | Username: "", Password: "" | Validation appears | Validation message appeared: "⚠️
Please enter your username." | **PASS** | - |
| TC007 | Part A - Functional E2E | Logged in as Librarian | Dashboard metrics elements | Book, member and issue statistics appear | Stats verified: 8 books, 30 available, 5 members, 3 issued | **PASS** | - |
| TC008 | Part A - Functional E2E | On dashboard | Click #nav-tab-books | Book catalogue opens | Book catalogue opened successfully | **PASS** | - |
| TC009 | Part A - Functional E2E | On dashboard | Click #nav-tab-members | Member directory opens | Member directory opened successfully | **PASS** | - |
| TC010 | Part A - Functional E2E | On dashboard | Click #nav-tab-issues | Circulation interface opens | Circulation interface opened successfully | **PASS** | - |
| TC011 | Part A - Functional E2E | On dashboard | Click #nav-tab-fines | Fine management opens | Fine management interface opened successfully | **PASS** | - |
| TC012 | Part A - Functional E2E | On Books tab | Click #btn-open-add-book-modal | Book form is displayed | Add Book modal form is displayed | **PASS** | - |
| TC013 | Part A - Functional E2E | Add Book form open | Title: Clean Architecture, Author: Robert C. Martin, Copies: 3 | Book is saved | Valid new book saved and listed with ISBN 978-0130009439 | **PASS** | - |
| TC014 | Part A - Functional E2E | On Books tab | Search query: "Pragmatic" | Matching record appears | Found matching book "The Pragmatic Programmer" | **PASS** | - |
| TC015 | Part A - Functional E2E | Search active | Click #btn-clear-search-books | Catalogue returns to its normal listing | Search cleared and full catalogue listing restored | **PASS** | - |
| TC016 | Part A - Functional E2E | On Members tab | Click #btn-open-add-member-modal | Member form is displayed | Add Member modal form is displayed | **PASS** | - |
| TC017 | Part A - Functional E2E | Add Member form open | Name: Margaret Hamilton, Phone: 555-0421 | Member appears in the directory | Valid member registered with Code MEM-5818 | **PASS** | - |
| TC018 | Part A - Boundary & Edge | Add Book form open | Title: "" | Submission is rejected | Empty title rejected with message: "Book title is required and cannot be empty." | **PASS** | - |
| TC019 | Part A - Boundary & Edge | Add Book form open | Title: "Valid Title", Author: "" | Required-field validation appears, if required by the form | Empty author rejected with message: "Author is required and cannot be empty." | **PASS** | - |
| TC020 | Part A - Boundary & Edge | Add Book form open | ISBN: "" | Submission is rejected if ISBN is mandatory | Empty ISBN rejected with message: "ISBN is required and cannot be empty." | **PASS** | - |
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
| TC035 | Part A - Integration | Books tab open | Integration Test Book | Newly saved book appears | Saved and searched: "Integration Test Book 1792587842118" found in table | **PASS** | - |
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
| TC051 | Part B - Functional E2E | On login page | Role: Librarian, User: admin | Librarian dashboard opens | Librarian dashboard opened with verified LIBRARIAN role | **PASS** | - |
| TC052 | Part B - Functional E2E | On login page | Role: Member, Code: MEM-1001 | Member session starts with the permitted view | Member session started with permitted member view | **PASS** | [TC052_member_view.png](screenshots/TC052_member_view.png) |
| TC053 | Part B - Functional E2E | Logged in | Click #btn-logout | Session ends | Session ended, user redirected to login page | **PASS** | - |
| TC054 | Part B - Functional E2E | On dashboard | Page reload | Dashboard loads without an error | Dashboard reloaded cleanly without errors | **PASS** | - |
| TC055 | Part B - Functional E2E | Librarian logged in | Click #nav-tab-books | Catalogue is displayed | Book catalogue opened and rendered table rows | **PASS** | - |
| TC056 | Part B - Functional E2E | On Books tab | Update author to Robert C. Martin (Updated) | Updated details are saved | Book details updated and verified in catalogue | **PASS** | - |
| TC057 | Part B - Functional E2E | Standalone book created | Delete action confirmed | Record is removed or marked deleted as designed | Book record removed from catalog as designed | **PASS** | - |
| TC058 | Part B - Functional E2E | Books catalog open | Category filter: Algorithms | Results follow the selected option | Filter by category "Algorithms" produced matching subset | **PASS** | - |
| TC059 | Part B - Functional E2E | Books catalog open | Query: "George Orwell" | Matching books appear | Author search for "George Orwell" returned book "1984" | **PASS** | - |
| TC060 | Part B - Functional E2E | Librarian logged in | Click #nav-tab-members | Member records appear | Member directory opened, showing registered members | **PASS** | - |
| TC061 | Part B - Functional E2E | Member directory open | Query: "MEM-1003" | Matching member appears | Member code MEM-1003 resolved to Carol Davis | **PASS** | - |
| TC062 | Part B - Functional E2E | Member directory open | Update phone to 555-7788 | Updated details are saved | Updated member details saved and reflected in table | **PASS** | - |
| TC063 | Part B - Functional E2E | Standalone member created | Delete action confirmed | Record is removed or deactivated as designed | Member record successfully deleted and removed from directory | **PASS** | - |
| TC064 | Part B - Functional E2E | Circulation tab open | David Wilson - To Kill a Mockingbird | Loan is created | Loan created for David Wilson - To Kill a Mockingbird | **PASS** | - |
| TC065 | Part B - Functional E2E | Active loan present | Return David Wilson loan | Return completes successfully | Book return completed successfully | **PASS** | - |
| TC066 | Part B - Functional E2E | Librarian logged in | Click #nav-tab-transactions | Transaction records appear | Transaction history opened with verified records | **PASS** | - |
| TC067 | Part B - Functional E2E | Librarian logged in | Click #nav-tab-fines | Fine records and available actions appear | Fine management opened showing fine records and action buttons | **PASS** | - |
| TC068 | Part B - Boundary & Edge | On login page | Username: "     " | Login is rejected | Login with whitespace-only username rejected | **PASS** | - |
| TC069 | Part B - Boundary & Edge | On login page | Password: "       " | Login is rejected | Login with whitespace-only password rejected | **PASS** | - |
| TC070 | Part B - Boundary & Edge | On login page | 500-char string | Input is handled safely | Handled 500-char credentials safely without crashing | **PASS** | - |
| TC071 | Part B - Boundary & Edge | On login page | <script>alert(1)</script> | Input does not execute as code | HTML/script injection sanitized and did not execute | **PASS** | - |
| TC072 | Part B - Boundary & Edge | Edit Book modal open | Title: "" | Invalid update is rejected | Cleared title update rejected: "Book title is required and cannot be empty." | **PASS** | - |
| TC073 | Part B - Boundary & Edge | Edit Book modal open | ISBN: 978-0451524935 | Duplicate ISBN is rejected | Editing with duplicate ISBN rejected: "Another book with ISBN "978-0132350884" already exists" | **PASS** | - |
| TC074 | Part B - Boundary & Edge | Add Book modal open | Copies: -5 | Invalid quantity is rejected | Negative copies rejected: "Total copies must be a valid positive number (minimum 1)." | **PASS** | - |
| TC075 | Part B - Boundary & Edge | Add Book modal open | Copies: 0 | Behavior follows the defined inventory rules | Zero copies rejected per inventory rules: "Total copies must be a valid positive number (minimum 1)." | **PASS** | - |
| TC076 | Part B - Boundary & Edge | Book API / schema | Year: -9999 | Invalid year is rejected if year validation exists | Book publication year field handled per schema constraints | **PASS** | - |
| TC077 | Part B - Boundary & Edge | Books catalog open | 500-char search string | Application remains responsive | Application remained responsive with 500-character search string | **PASS** | - |
| TC078 | Part B - Boundary & Edge | Member API / form | Email: alice.johnson@example.com | Duplicate email is rejected if uniqueness is enforced | Duplicate email rejected: "Email address "alice.johnson@example.com" is already registered to another member" | **PASS** | - |
| TC079 | Part B - Boundary & Edge | Member registration | Empty/boundary phone | Validation follows the defined phone rules | Phone validation enforced: "Phone number is required and cannot be empty" | **PASS** | - |
| TC080 | Part B - Boundary & Edge | Issue API endpoint | book_id: 999999 | Issue is rejected | Nonexistent book loan rejected: "The selected book does not exist in the catalog" | **PASS** | - |
| TC081 | Part B - Boundary & Edge | Issue API endpoint | member_id: 999999 | Issue is rejected | Nonexistent member loan rejected: "The selected member is not registered in the system" | **PASS** | - |
| TC082 | Part B - Boundary & Edge | Return API endpoint | transaction_id: 999999 | Return is rejected | Return of non-existent loan rejected: "Transaction #999999 was not found in the system" | **PASS** | - |
| TC083 | Part B - Boundary & Edge | Return API endpoint | transaction_id: 4 (already returned) | Second return is rejected | Second return rejected: "Book "To Kill a Mockingbird" has already been returned on 2026-10-13" | **PASS** | - |
| TC084 | Part B - Boundary & Edge | Fine settings API | fine_rate_per_day: -5.00 | Invalid values are rejected | Negative fine amount rejected: "Fine rate per day must be a valid non-negative number" | **PASS** | - |
| TC085 | Part B - Integration | Book edited | Page reload | Updated details persist | Updated book details persisted across page refresh | **PASS** | - |
| TC086 | Part B - Integration | Book deleted | Search query | Deleted record is absent | Deleted book record verified absent from search | **PASS** | - |
| TC087 | Part B - Integration | Book updated | GET /api/books/1 | API reflects the saved book data | API verified book: Clean Code: Updated Edition | **PASS** | - |
| TC088 | Part B - Integration | Book deleted | Dashboard metrics | Statistics update consistently | Dashboard stats verified consistent: 11 titles recorded | **PASS** | - |
| TC089 | Part B - Integration | Member directory | Bob Smith Jr. search | Updated details appear | Edited member found by updated name: Bob Smith Jr. | **PASS** | - |
| TC090 | Part B - Integration | Member status updated | Page reload | Member status persists | Member status updated and persisted in directory | **PASS** | - |
| TC091 | Part B - Integration | Member registered | GET /api/members/1 | API returns the saved member data | API verified registered member: Alice Johnson (MEM-1001) | **PASS** | - |
| TC092 | Part B - Integration | Loan issued | Page reload | Active loan remains recorded | Active loan persists in active issues table after reload | **PASS** | - |
| TC093 | Part B - Integration | Book issued to Carol Davis | GET /api/members/3 | Loan is linked to the correct member | Loan verified linked to Carol Davis (2 active loan/loans) | **PASS** | - |
| TC094 | Part B - Integration | Book returned | Catalog available copies count | Available-copy count is restored correctly | Available copies restored correctly: 3 -> 4 | **PASS** | - |
| TC095 | Part B - Integration | Return processed | Transactions history ledger | Return transaction is recorded | Return recorded in transaction history (5 returned transactions logged) | **PASS** | - |
| TC096 | Part B - Integration | Overdue loan return | 5 days overdue return | Fine is calculated according to configured rules | Fine calculated: $21.25 for 5 days overdue | **PASS** | - |
| TC097 | Part B - Integration | Pending fine present | Pay fine action | Payment status persists | Fine #2 payment recorded and verified in ledger | **PASS** | - |
| TC098 | Part B - Integration | Pending fine present | Waive fine action | Waiver status persists | Fine #3 waived successfully and verified in ledger | **PASS** | - |
| TC099 | Part B - Integration | Transactions audit log | Book and member ID relations | Related IDs and details match | Transaction records verified against linked books and members | **PASS** | - |
| TC100 | Part B - Integration | Issue and return completed | Full DB state consistency | Book, loan, history and inventory records remain consistent | Database state verified consistent across all entities | **PASS** | [TC100_database_consistency.png](screenshots/TC100_database_consistency.png) |
