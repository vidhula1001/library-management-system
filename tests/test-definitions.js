/**
 * Complete Metadata for all 100 Selenium Automation Test Cases
 * Exactly matching the assignment specification.
 */

const TEST_DEFINITIONS = [
  // ==========================================================================
  // Part A — Your Test Cases (TC001–TC050)
  // A1. Functional End-to-End Testing (TC001–TC017)
  // ==========================================================================
  {
    id: 'TC001',
    category: 'Part A - Functional E2E',
    name: 'Open the LMS application',
    preconditions: 'Server is running',
    testData: 'URL: /login.html',
    expected: 'Application loads successfully',
    fn: (suiteA) => suiteA.tc001()
  },
  {
    id: 'TC002',
    category: 'Part A - Functional E2E',
    name: 'Open the librarian login page',
    preconditions: 'Browser opened',
    testData: 'Navigating to /login.html',
    expected: 'Login form is displayed',
    fn: (suiteA) => suiteA.tc002()
  },
  {
    id: 'TC003',
    category: 'Part A - Functional E2E',
    name: 'Log in with valid librarian credentials',
    preconditions: 'On login page',
    testData: 'Username: admin, Password: admin123',
    expected: 'Dashboard opens',
    fn: (suiteA) => suiteA.tc003()
  },
  {
    id: 'TC004',
    category: 'Part A - Functional E2E',
    name: 'Log in with an invalid username',
    preconditions: 'On login page',
    testData: 'Username: invalid_librarian_xyz, Password: admin123',
    expected: 'Login is rejected',
    fn: (suiteA) => suiteA.tc004()
  },
  {
    id: 'TC005',
    category: 'Part A - Functional E2E',
    name: 'Log in with an incorrect password',
    preconditions: 'On login page',
    testData: 'Username: admin, Password: completely_wrong_pass_999',
    expected: 'Error is displayed',
    fn: (suiteA) => suiteA.tc005()
  },
  {
    id: 'TC006',
    category: 'Part A - Functional E2E',
    name: 'Submit login with empty credentials',
    preconditions: 'On login page',
    testData: 'Username: "", Password: ""',
    expected: 'Validation appears',
    fn: (suiteA) => suiteA.tc006()
  },
  {
    id: 'TC007',
    category: 'Part A - Functional E2E',
    name: 'View dashboard statistics',
    preconditions: 'Logged in as Librarian',
    testData: 'Dashboard metrics elements',
    expected: 'Book, member and issue statistics appear',
    fn: (suiteA) => suiteA.tc007()
  },
  {
    id: 'TC008',
    category: 'Part A - Functional E2E',
    name: 'Navigate to the Books tab',
    preconditions: 'On dashboard',
    testData: 'Click #nav-tab-books',
    expected: 'Book catalogue opens',
    fn: (suiteA) => suiteA.tc008()
  },
  {
    id: 'TC009',
    category: 'Part A - Functional E2E',
    name: 'Navigate to the Members tab',
    preconditions: 'On dashboard',
    testData: 'Click #nav-tab-members',
    expected: 'Member directory opens',
    fn: (suiteA) => suiteA.tc009()
  },
  {
    id: 'TC010',
    category: 'Part A - Functional E2E',
    name: 'Navigate to the Issues tab',
    preconditions: 'On dashboard',
    testData: 'Click #nav-tab-issues',
    expected: 'Circulation interface opens',
    fn: (suiteA) => suiteA.tc010()
  },
  {
    id: 'TC011',
    category: 'Part A - Functional E2E',
    name: 'Navigate to the Fines tab',
    preconditions: 'On dashboard',
    testData: 'Click #nav-tab-fines',
    expected: 'Fine management opens',
    fn: (suiteA) => suiteA.tc011()
  },
  {
    id: 'TC012',
    category: 'Part A - Functional E2E',
    name: 'Open the Add Book form',
    preconditions: 'On Books tab',
    testData: 'Click #btn-open-add-book-modal',
    expected: 'Book form is displayed',
    fn: (suiteA) => suiteA.tc012()
  },
  {
    id: 'TC013',
    category: 'Part A - Functional E2E',
    name: 'Add a valid new book',
    preconditions: 'Add Book form open',
    testData: 'Title: Clean Architecture, Author: Robert C. Martin, Copies: 3',
    expected: 'Book is saved',
    fn: (suiteA) => suiteA.tc013()
  },
  {
    id: 'TC014',
    category: 'Part A - Functional E2E',
    name: 'Search for an existing book',
    preconditions: 'On Books tab',
    testData: 'Search query: "Pragmatic"',
    expected: 'Matching record appears',
    fn: (suiteA) => suiteA.tc014()
  },
  {
    id: 'TC015',
    category: 'Part A - Functional E2E',
    name: 'Clear the book search',
    preconditions: 'Search active',
    testData: 'Click #btn-clear-search-books',
    expected: 'Catalogue returns to its normal listing',
    fn: (suiteA) => suiteA.tc015()
  },
  {
    id: 'TC016',
    category: 'Part A - Functional E2E',
    name: 'Open the Add Member form',
    preconditions: 'On Members tab',
    testData: 'Click #btn-open-add-member-modal',
    expected: 'Member form is displayed',
    fn: (suiteA) => suiteA.tc016()
  },
  {
    id: 'TC017',
    category: 'Part A - Functional E2E',
    name: 'Register a valid member',
    preconditions: 'Add Member form open',
    testData: 'Name: Margaret Hamilton, Phone: 555-0421',
    expected: 'Member appears in the directory',
    fn: (suiteA) => suiteA.tc017()
  },

  // ==========================================================================
  // A2. Boundary & Edge Case Testing (TC018–TC034)
  // ==========================================================================
  {
    id: 'TC018',
    category: 'Part A - Boundary & Edge',
    name: 'Add a book with an empty title',
    preconditions: 'Add Book form open',
    testData: 'Title: ""',
    expected: 'Submission is rejected',
    fn: (suiteA) => suiteA.tc018()
  },
  {
    id: 'TC019',
    category: 'Part A - Boundary & Edge',
    name: 'Add a book with an empty author',
    preconditions: 'Add Book form open',
    testData: 'Title: "Valid Title", Author: ""',
    expected: 'Required-field validation appears, if required by the form',
    fn: (suiteA) => suiteA.tc019()
  },
  {
    id: 'TC020',
    category: 'Part A - Boundary & Edge',
    name: 'Add a book with an empty ISBN',
    preconditions: 'Add Book form open',
    testData: 'ISBN: ""',
    expected: 'Submission is rejected if ISBN is mandatory',
    fn: (suiteA) => suiteA.tc020()
  },
  {
    id: 'TC021',
    category: 'Part A - Boundary & Edge',
    name: 'Add a book with a duplicate ISBN',
    preconditions: 'Add Book form open',
    testData: 'ISBN: 978-0132350884',
    expected: 'Duplicate ISBN is rejected',
    fn: (suiteA) => suiteA.tc021()
  },
  {
    id: 'TC022',
    category: 'Part A - Boundary & Edge',
    name: 'Enter a very long book title',
    preconditions: 'Add Book form open',
    testData: 'Title length > 400 chars',
    expected: 'Input is handled without crashing',
    fn: (suiteA) => suiteA.tc022()
  },
  {
    id: 'TC023',
    category: 'Part A - Boundary & Edge',
    name: 'Search using an empty query',
    preconditions: 'On Books tab',
    testData: 'Query: ""',
    expected: 'Catalogue handles the empty query correctly',
    fn: (suiteA) => suiteA.tc023()
  },
  {
    id: 'TC024',
    category: 'Part A - Boundary & Edge',
    name: 'Search for a nonexistent title',
    preconditions: 'On Books tab',
    testData: 'Query: "NonExistentBookXYZ_99999"',
    expected: 'No matching records are reported',
    fn: (suiteA) => suiteA.tc024()
  },
  {
    id: 'TC025',
    category: 'Part A - Boundary & Edge',
    name: 'Search using special characters',
    preconditions: 'On Books tab',
    testData: 'Query: "!@#$%^&*()_+<>?:"{}|"',
    expected: 'Input is handled safely',
    fn: (suiteA) => suiteA.tc025()
  },
  {
    id: 'TC026',
    category: 'Part A - Boundary & Edge',
    name: 'Register a member with an empty member code',
    preconditions: 'Add Member form open',
    testData: 'Code: ""',
    expected: 'Registration is rejected',
    fn: (suiteA) => suiteA.tc026()
  },
  {
    id: 'TC027',
    category: 'Part A - Boundary & Edge',
    name: 'Register a member with an empty name',
    preconditions: 'Add Member form open',
    testData: 'Name: ""',
    expected: 'Required-field validation appears, if mandatory',
    fn: (suiteA) => suiteA.tc027()
  },
  {
    id: 'TC028',
    category: 'Part A - Boundary & Edge',
    name: 'Register a member with an invalid email',
    preconditions: 'Add Member form open',
    testData: 'Email: "not_an_email_address"',
    expected: 'Email validation rejects the value',
    fn: (suiteA) => suiteA.tc028()
  },
  {
    id: 'TC029',
    category: 'Part A - Boundary & Edge',
    name: 'Register a member with an empty email',
    preconditions: 'Add Member form open',
    testData: 'Email: ""',
    expected: 'Submission is rejected if email is mandatory',
    fn: (suiteA) => suiteA.tc029()
  },
  {
    id: 'TC030',
    category: 'Part A - Boundary & Edge',
    name: 'Register a member with a duplicate member code',
    preconditions: 'Add Member form open',
    testData: 'Code: MEM-1001',
    expected: 'Duplicate code is rejected',
    fn: (suiteA) => suiteA.tc030()
  },
  {
    id: 'TC031',
    category: 'Part A - Boundary & Edge',
    name: 'Enter an unusually long member name',
    preconditions: 'Add Member form open',
    testData: 'Name length > 200 chars',
    expected: 'Input is handled without breaking the form',
    fn: (suiteA) => suiteA.tc031()
  },
  {
    id: 'TC032',
    category: 'Part A - Boundary & Edge',
    name: 'Enter letters in a phone-number field',
    preconditions: 'Add Member form open',
    testData: 'Phone: "ABC-PHONE-XYZ"',
    expected: "Validation follows the application's rules",
    fn: (suiteA) => suiteA.tc032()
  },
  {
    id: 'TC033',
    category: 'Part A - Boundary & Edge',
    name: 'Submit an issue form without selecting a book',
    preconditions: 'On Issues tab',
    testData: 'Book select: unselected',
    expected: 'Submission is rejected',
    fn: (suiteA) => suiteA.tc033()
  },
  {
    id: 'TC034',
    category: 'Part A - Boundary & Edge',
    name: 'Attempt to issue a book with no available copies',
    preconditions: 'On Issues tab',
    testData: 'Book with 0 available copies',
    expected: 'Issue is rejected',
    fn: (suiteA) => suiteA.tc034()
  },

  // ==========================================================================
  // A3. Integration Testing (TC035–TC050)
  // ==========================================================================
  {
    id: 'TC035',
    category: 'Part A - Integration',
    name: 'Add a book and search for it',
    preconditions: 'Books tab open',
    testData: 'Integration Test Book',
    expected: 'Newly saved book appears',
    fn: (suiteA) => suiteA.tc035()
  },
  {
    id: 'TC036',
    category: 'Part A - Integration',
    name: 'Add a book and refresh the catalogue',
    preconditions: 'Book saved',
    testData: 'Page refresh',
    expected: 'Book remains saved',
    fn: (suiteA) => suiteA.tc036()
  },
  {
    id: 'TC037',
    category: 'Part A - Integration',
    name: 'Add a book and verify dashboard statistics',
    preconditions: 'Book added',
    testData: 'Dashboard Total Books count',
    expected: 'Total book count updates as designed',
    fn: (suiteA) => suiteA.tc037()
  },
  {
    id: 'TC038',
    category: 'Part A - Integration',
    name: 'Search by ISBN and verify the matching record',
    preconditions: 'Books tab open',
    testData: 'ISBN: 978-0201633610',
    expected: 'Correct book is returned',
    fn: (suiteA) => suiteA.tc038()
  },
  {
    id: 'TC039',
    category: 'Part A - Integration',
    name: 'Reject a duplicate ISBN and recheck the catalogue',
    preconditions: 'Books tab open',
    testData: 'Existing ISBN submission',
    expected: 'No duplicate record is created',
    fn: (suiteA) => suiteA.tc039()
  },
  {
    id: 'TC040',
    category: 'Part A - Integration',
    name: 'Register a member and search by member code',
    preconditions: 'Members tab open',
    testData: 'Search: MEM-1002',
    expected: 'Correct member is returned',
    fn: (suiteA) => suiteA.tc040()
  },
  {
    id: 'TC041',
    category: 'Part A - Integration',
    name: 'Register a member and refresh the directory',
    preconditions: 'Members directory',
    testData: 'Page refresh',
    expected: 'Member remains saved',
    fn: (suiteA) => suiteA.tc041()
  },
  {
    id: 'TC042',
    category: 'Part A - Integration',
    name: 'Reject an invalid email and inspect the directory',
    preconditions: 'Add Member form',
    testData: 'Invalid email submission',
    expected: 'Invalid member is not saved',
    fn: (suiteA) => suiteA.tc042()
  },
  {
    id: 'TC043',
    category: 'Part A - Integration',
    name: 'Issue a book and inspect the active-issues table',
    preconditions: 'Circulation tab',
    testData: 'Algorithms issued to Emma Watson',
    expected: 'Issue record appears',
    fn: (suiteA) => suiteA.tc043()
  },
  {
    id: 'TC044',
    category: 'Part A - Integration',
    name: 'Issue a book and verify available-copy count',
    preconditions: 'Book issued',
    testData: 'Catalog available copies check',
    expected: 'Availability updates correctly',
    fn: (suiteA) => suiteA.tc044()
  },
  {
    id: 'TC045',
    category: 'Part A - Integration',
    name: 'Attempt a duplicate active loan and inspect issue records',
    preconditions: 'Active loan present',
    testData: 'Re-issue same book to same member',
    expected: 'Duplicate active issue is prevented',
    fn: (suiteA) => suiteA.tc045()
  },
  {
    id: 'TC046',
    category: 'Part A - Integration',
    name: 'Return an issued book and inspect the active-issues table',
    preconditions: 'Active loan present',
    testData: 'Return flow execution',
    expected: 'Returned loan is no longer active',
    fn: (suiteA) => suiteA.tc046()
  },
  {
    id: 'TC047',
    category: 'Part A - Integration',
    name: 'Return a book and verify its availability',
    preconditions: 'Book returned',
    testData: 'Catalog copy count restoration',
    expected: 'Availability updates correctly',
    fn: (suiteA) => suiteA.tc047()
  },
  {
    id: 'TC048',
    category: 'Part A - Integration',
    name: 'Return a book and inspect circulation history',
    preconditions: 'Book returned',
    testData: 'Transaction history tab',
    expected: 'Return details are recorded',
    fn: (suiteA) => suiteA.tc048()
  },
  {
    id: 'TC049',
    category: 'Part A - Integration',
    name: 'Update fine settings and reload the settings',
    preconditions: 'Fines settings tab',
    testData: 'Fine rate: $4.25/day',
    expected: 'Saved settings persist',
    fn: (suiteA) => suiteA.tc049()
  },
  {
    id: 'TC050',
    category: 'Part A - Integration',
    name: 'Perform a transaction and verify its recorded status',
    preconditions: 'Transaction history ledger',
    testData: 'Ledger status inspection',
    expected: 'Transaction data matches the completed operation',
    fn: (suiteA) => suiteA.tc050()
  },

  // ==========================================================================
  // Part B — Teammate's Test Cases (TC051–TC100)
  // B1. Functional End-to-End Testing (TC051–TC067)
  // ==========================================================================
  {
    id: 'TC051',
    category: 'Part B - Functional E2E',
    name: 'Log in using valid librarian credentials',
    preconditions: 'On login page',
    testData: 'Role: Librarian, User: admin',
    expected: 'Librarian dashboard opens',
    fn: (_, suiteB) => suiteB.tc051()
  },
  {
    id: 'TC052',
    category: 'Part B - Functional E2E',
    name: 'Log in using valid member credentials',
    preconditions: 'On login page',
    testData: 'Role: Member, Code: MEM-1001',
    expected: 'Member session starts with the permitted view',
    fn: (_, suiteB) => suiteB.tc052()
  },
  {
    id: 'TC053',
    category: 'Part B - Functional E2E',
    name: 'Log out of the application',
    preconditions: 'Logged in',
    testData: 'Click #btn-logout',
    expected: 'Session ends',
    fn: (_, suiteB) => suiteB.tc053()
  },
  {
    id: 'TC054',
    category: 'Part B - Functional E2E',
    name: 'Refresh the dashboard',
    preconditions: 'On dashboard',
    testData: 'Page reload',
    expected: 'Dashboard loads without an error',
    fn: (_, suiteB) => suiteB.tc054()
  },
  {
    id: 'TC055',
    category: 'Part B - Functional E2E',
    name: 'Open the book catalogue after login',
    preconditions: 'Librarian logged in',
    testData: 'Click #nav-tab-books',
    expected: 'Catalogue is displayed',
    fn: (_, suiteB) => suiteB.tc055()
  },
  {
    id: 'TC056',
    category: 'Part B - Functional E2E',
    name: "Edit an existing book's details",
    preconditions: 'On Books tab',
    testData: 'Update author to Robert C. Martin (Updated)',
    expected: 'Updated details are saved',
    fn: (_, suiteB) => suiteB.tc056()
  },
  {
    id: 'TC057',
    category: 'Part B - Functional E2E',
    name: 'Delete a book record',
    preconditions: 'Standalone book created',
    testData: 'Delete action confirmed',
    expected: 'Record is removed or marked deleted as designed',
    fn: (_, suiteB) => suiteB.tc057()
  },
  {
    id: 'TC058',
    category: 'Part B - Functional E2E',
    name: 'Sort or filter the book catalogue, if supported',
    preconditions: 'Books catalog open',
    testData: 'Category filter: Algorithms',
    expected: 'Results follow the selected option',
    fn: (_, suiteB) => suiteB.tc058()
  },
  {
    id: 'TC059',
    category: 'Part B - Functional E2E',
    name: 'Search books using an author name',
    preconditions: 'Books catalog open',
    testData: 'Query: "George Orwell"',
    expected: 'Matching books appear',
    fn: (_, suiteB) => suiteB.tc059()
  },
  {
    id: 'TC060',
    category: 'Part B - Functional E2E',
    name: 'Open the member directory',
    preconditions: 'Librarian logged in',
    testData: 'Click #nav-tab-members',
    expected: 'Member records appear',
    fn: (_, suiteB) => suiteB.tc060()
  },
  {
    id: 'TC061',
    category: 'Part B - Functional E2E',
    name: 'Search for a member by code',
    preconditions: 'Member directory open',
    testData: 'Query: "MEM-1003"',
    expected: 'Matching member appears',
    fn: (_, suiteB) => suiteB.tc061()
  },
  {
    id: 'TC062',
    category: 'Part B - Functional E2E',
    name: "Edit an existing member's details",
    preconditions: 'Member directory open',
    testData: 'Update phone to 555-7788',
    expected: 'Updated details are saved',
    fn: (_, suiteB) => suiteB.tc062()
  },
  {
    id: 'TC063',
    category: 'Part B - Functional E2E',
    name: 'Delete a member, if supported',
    preconditions: 'Standalone member created',
    testData: 'Delete action confirmed',
    expected: 'Record is removed or deactivated as designed',
    fn: (_, suiteB) => suiteB.tc063()
  },
  {
    id: 'TC064',
    category: 'Part B - Functional E2E',
    name: 'Issue an available book to a member',
    preconditions: 'Circulation tab open',
    testData: 'David Wilson - To Kill a Mockingbird',
    expected: 'Loan is created',
    fn: (_, suiteB) => suiteB.tc064()
  },
  {
    id: 'TC065',
    category: 'Part B - Functional E2E',
    name: 'Return a currently issued book',
    preconditions: 'Active loan present',
    testData: 'Return David Wilson loan',
    expected: 'Return completes successfully',
    fn: (_, suiteB) => suiteB.tc065()
  },
  {
    id: 'TC066',
    category: 'Part B - Functional E2E',
    name: 'Open the transaction history',
    preconditions: 'Librarian logged in',
    testData: 'Click #nav-tab-transactions',
    expected: 'Transaction records appear',
    fn: (_, suiteB) => suiteB.tc066()
  },
  {
    id: 'TC067',
    category: 'Part B - Functional E2E',
    name: 'Open fine management and view the fine ledger',
    preconditions: 'Librarian logged in',
    testData: 'Click #nav-tab-fines',
    expected: 'Fine records and available actions appear',
    fn: (_, suiteB) => suiteB.tc067()
  },

  // ==========================================================================
  // B2. Boundary & Edge Case Testing (TC068–TC084)
  // ==========================================================================
  {
    id: 'TC068',
    category: 'Part B - Boundary & Edge',
    name: 'Log in with whitespace-only username',
    preconditions: 'On login page',
    testData: 'Username: "     "',
    expected: 'Login is rejected',
    fn: (_, suiteB) => suiteB.tc068()
  },
  {
    id: 'TC069',
    category: 'Part B - Boundary & Edge',
    name: 'Log in with whitespace-only password',
    preconditions: 'On login page',
    testData: 'Password: "       "',
    expected: 'Login is rejected',
    fn: (_, suiteB) => suiteB.tc069()
  },
  {
    id: 'TC070',
    category: 'Part B - Boundary & Edge',
    name: 'Submit login with extremely long credentials',
    preconditions: 'On login page',
    testData: '500-char string',
    expected: 'Input is handled safely',
    fn: (_, suiteB) => suiteB.tc070()
  },
  {
    id: 'TC071',
    category: 'Part B - Boundary & Edge',
    name: 'Enter HTML or script-like text in the login form',
    preconditions: 'On login page',
    testData: '<script>alert(1)</script>',
    expected: 'Input does not execute as code',
    fn: (_, suiteB) => suiteB.tc071()
  },
  {
    id: 'TC072',
    category: 'Part B - Boundary & Edge',
    name: 'Edit a book and clear its title',
    preconditions: 'Edit Book modal open',
    testData: 'Title: ""',
    expected: 'Invalid update is rejected',
    fn: (_, suiteB) => suiteB.tc072()
  },
  {
    id: 'TC073',
    category: 'Part B - Boundary & Edge',
    name: 'Edit a book using an existing ISBN',
    preconditions: 'Edit Book modal open',
    testData: 'ISBN: 978-0451524935',
    expected: 'Duplicate ISBN is rejected',
    fn: (_, suiteB) => suiteB.tc073()
  },
  {
    id: 'TC074',
    category: 'Part B - Boundary & Edge',
    name: 'Enter negative values for book copies',
    preconditions: 'Add Book modal open',
    testData: 'Copies: -5',
    expected: 'Invalid quantity is rejected',
    fn: (_, suiteB) => suiteB.tc074()
  },
  {
    id: 'TC075',
    category: 'Part B - Boundary & Edge',
    name: 'Enter zero copies for a new book',
    preconditions: 'Add Book modal open',
    testData: 'Copies: 0',
    expected: 'Behavior follows the defined inventory rules',
    fn: (_, suiteB) => suiteB.tc075()
  },
  {
    id: 'TC076',
    category: 'Part B - Boundary & Edge',
    name: 'Enter an invalid publication year',
    preconditions: 'Book API / schema',
    testData: 'Year: -9999',
    expected: 'Invalid year is rejected if year validation exists',
    fn: (_, suiteB) => suiteB.tc076()
  },
  {
    id: 'TC077',
    category: 'Part B - Boundary & Edge',
    name: 'Search using a very long string',
    preconditions: 'Books catalog open',
    testData: '500-char search string',
    expected: 'Application remains responsive',
    fn: (_, suiteB) => suiteB.tc077()
  },
  {
    id: 'TC078',
    category: 'Part B - Boundary & Edge',
    name: 'Register a member using an already registered email',
    preconditions: 'Member API / form',
    testData: 'Email: alice.johnson@example.com',
    expected: 'Duplicate email is rejected if uniqueness is enforced',
    fn: (_, suiteB) => suiteB.tc078()
  },
  {
    id: 'TC079',
    category: 'Part B - Boundary & Edge',
    name: 'Enter an invalid phone-number length',
    preconditions: 'Member registration',
    testData: 'Empty/boundary phone',
    expected: 'Validation follows the defined phone rules',
    fn: (_, suiteB) => suiteB.tc079()
  },
  {
    id: 'TC080',
    category: 'Part B - Boundary & Edge',
    name: 'Attempt to issue a nonexistent book',
    preconditions: 'Issue API endpoint',
    testData: 'book_id: 999999',
    expected: 'Issue is rejected',
    fn: (_, suiteB) => suiteB.tc080()
  },
  {
    id: 'TC081',
    category: 'Part B - Boundary & Edge',
    name: 'Attempt to issue a nonexistent member',
    preconditions: 'Issue API endpoint',
    testData: 'member_id: 999999',
    expected: 'Issue is rejected',
    fn: (_, suiteB) => suiteB.tc081()
  },
  {
    id: 'TC082',
    category: 'Part B - Boundary & Edge',
    name: 'Attempt to return a book that was never issued',
    preconditions: 'Return API endpoint',
    testData: 'transaction_id: 999999',
    expected: 'Return is rejected',
    fn: (_, suiteB) => suiteB.tc082()
  },
  {
    id: 'TC083',
    category: 'Part B - Boundary & Edge',
    name: 'Attempt to return the same loan twice',
    preconditions: 'Return API endpoint',
    testData: 'transaction_id: 4 (already returned)',
    expected: 'Second return is rejected',
    fn: (_, suiteB) => suiteB.tc083()
  },
  {
    id: 'TC084',
    category: 'Part B - Boundary & Edge',
    name: 'Enter negative fine amounts or invalid fine settings',
    preconditions: 'Fine settings API',
    testData: 'fine_rate_per_day: -5.00',
    expected: 'Invalid values are rejected',
    fn: (_, suiteB) => suiteB.tc084()
  },

  // ==========================================================================
  // B3. Integration Testing (TC085–TC100)
  // ==========================================================================
  {
    id: 'TC085',
    category: 'Part B - Integration',
    name: 'Edit a book and refresh the page',
    preconditions: 'Book edited',
    testData: 'Page reload',
    expected: 'Updated details persist',
    fn: (_, suiteB) => suiteB.tc085()
  },
  {
    id: 'TC086',
    category: 'Part B - Integration',
    name: 'Delete a book and search for it again',
    preconditions: 'Book deleted',
    testData: 'Search query',
    expected: 'Deleted record is absent',
    fn: (_, suiteB) => suiteB.tc086()
  },
  {
    id: 'TC087',
    category: 'Part B - Integration',
    name: 'Verify book changes through the API, if available',
    preconditions: 'Book updated',
    testData: 'GET /api/books/1',
    expected: 'API reflects the saved book data',
    fn: (_, suiteB) => suiteB.tc087()
  },
  {
    id: 'TC088',
    category: 'Part B - Integration',
    name: 'Verify dashboard statistics after deleting a book',
    preconditions: 'Book deleted',
    testData: 'Dashboard metrics',
    expected: 'Statistics update consistently',
    fn: (_, suiteB) => suiteB.tc088()
  },
  {
    id: 'TC089',
    category: 'Part B - Integration',
    name: 'Edit a member and search for the updated record',
    preconditions: 'Member directory',
    testData: 'Bob Smith Jr. search',
    expected: 'Updated details appear',
    fn: (_, suiteB) => suiteB.tc089()
  },
  {
    id: 'TC090',
    category: 'Part B - Integration',
    name: 'Delete or deactivate a member and refresh the directory',
    preconditions: 'Member status updated',
    testData: 'Page reload',
    expected: 'Member status persists',
    fn: (_, suiteB) => suiteB.tc090()
  },
  {
    id: 'TC091',
    category: 'Part B - Integration',
    name: 'Verify registered member details through the API, if available',
    preconditions: 'Member registered',
    testData: 'GET /api/members/1',
    expected: 'API returns the saved member data',
    fn: (_, suiteB) => suiteB.tc091()
  },
  {
    id: 'TC092',
    category: 'Part B - Integration',
    name: 'Issue a book and refresh the page',
    preconditions: 'Loan issued',
    testData: 'Page reload',
    expected: 'Active loan remains recorded',
    fn: (_, suiteB) => suiteB.tc092()
  },
  {
    id: 'TC093',
    category: 'Part B - Integration',
    name: "Issue a book and verify the member's loan history",
    preconditions: 'Book issued to Carol Davis',
    testData: 'GET /api/members/3',
    expected: 'Loan is linked to the correct member',
    fn: (_, suiteB) => suiteB.tc093()
  },
  {
    id: 'TC094',
    category: 'Part B - Integration',
    name: 'Return a book and verify inventory counts',
    preconditions: 'Book returned',
    testData: 'Catalog available copies count',
    expected: 'Available-copy count is restored correctly',
    fn: (_, suiteB) => suiteB.tc094()
  },
  {
    id: 'TC095',
    category: 'Part B - Integration',
    name: 'Return a book and verify transaction history',
    preconditions: 'Return processed',
    testData: 'Transactions history ledger',
    expected: 'Return transaction is recorded',
    fn: (_, suiteB) => suiteB.tc095()
  },
  {
    id: 'TC096',
    category: 'Part B - Integration',
    name: 'Verify an overdue return produces the expected fine',
    preconditions: 'Overdue loan return',
    testData: '5 days overdue return',
    expected: 'Fine is calculated according to configured rules',
    fn: (_, suiteB) => suiteB.tc096()
  },
  {
    id: 'TC097',
    category: 'Part B - Integration',
    name: 'Record a fine payment and refresh the ledger',
    preconditions: 'Pending fine present',
    testData: 'Pay fine action',
    expected: 'Payment status persists',
    fn: (_, suiteB) => suiteB.tc097()
  },
  {
    id: 'TC098',
    category: 'Part B - Integration',
    name: 'Waive a fine, if supported, and refresh the ledger',
    preconditions: 'Pending fine present',
    testData: 'Waive fine action',
    expected: 'Waiver status persists',
    fn: (_, suiteB) => suiteB.tc098()
  },
  {
    id: 'TC099',
    category: 'Part B - Integration',
    name: 'Verify transaction records against their associated book and member',
    preconditions: 'Transactions audit log',
    testData: 'Book and member ID relations',
    expected: 'Related IDs and details match',
    fn: (_, suiteB) => suiteB.tc099()
  },
  {
    id: 'TC100',
    category: 'Part B - Integration',
    name: 'Verify database state after a complete issue-and-return journey',
    preconditions: 'Issue and return completed',
    testData: 'Full DB state consistency',
    expected: 'Book, loan, history and inventory records remain consistent',
    fn: (_, suiteB) => suiteB.tc100()
  }
];

module.exports = TEST_DEFINITIONS;
