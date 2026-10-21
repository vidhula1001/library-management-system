# Athena Library Management System - Selenium Automation Execution Record

**Execution Date:** 2026-10-21T13:16:57.572Z
**Scope:** B (50 Test Cases)
**Summary:** Total: 50 | Passed: 50 | Failed: 0

| Test ID | Category | Preconditions | Test Data | Expected Result | Actual Result | Status | Evidence |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
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
| TC088 | Part B - Integration | Book deleted | Dashboard metrics | Statistics update consistently | Dashboard stats verified consistent: 9 titles recorded | **PASS** | - |
| TC089 | Part B - Integration | Member directory | Bob Smith Jr. search | Updated details appear | Edited member found by updated name: Bob Smith Jr. | **PASS** | - |
| TC090 | Part B - Integration | Member status updated | Page reload | Member status persists | Member status updated and persisted in directory | **PASS** | - |
| TC091 | Part B - Integration | Member registered | GET /api/members/1 | API returns the saved member data | API verified registered member: Alice Johnson (MEM-1001) | **PASS** | - |
| TC092 | Part B - Integration | Loan issued | Page reload | Active loan remains recorded | Active loan persists in active issues table after reload | **PASS** | - |
| TC093 | Part B - Integration | Book issued to Carol Davis | GET /api/members/3 | Loan is linked to the correct member | Loan verified linked to Carol Davis (2 active loan/loans) | **PASS** | - |
| TC094 | Part B - Integration | Book returned | Catalog available copies count | Available-copy count is restored correctly | Available copies restored correctly: 3 -> 4 | **PASS** | - |
| TC095 | Part B - Integration | Return processed | Transactions history ledger | Return transaction is recorded | Return recorded in transaction history (4 returned transactions logged) | **PASS** | - |
| TC096 | Part B - Integration | Overdue loan return | 5 days overdue return | Fine is calculated according to configured rules | Fine calculated: $21.25 for 5 days overdue | **PASS** | - |
| TC097 | Part B - Integration | Pending fine present | Pay fine action | Payment status persists | Fine #2 payment recorded and verified in ledger | **PASS** | - |
| TC098 | Part B - Integration | Pending fine present | Waive fine action | Waiver status persists | Fine #3 waived successfully and verified in ledger | **PASS** | - |
| TC099 | Part B - Integration | Transactions audit log | Book and member ID relations | Related IDs and details match | Transaction records verified against linked books and members | **PASS** | - |
| TC100 | Part B - Integration | Issue and return completed | Full DB state consistency | Book, loan, history and inventory records remain consistent | Database state verified consistent across all entities | **PASS** | [TC100_database_consistency.png](screenshots/TC100_database_consistency.png) |
