# Athena Library Management System (LMS)

A complete, beginner-friendly, and production-ready **Library Management System** web application developed for college Software Engineering assignments and automated testing with **Selenium WebDriver (JavaScript)**.

---

## 🌟 Key Features

1. **Comprehensive Dashboard**:
   - Live metrics: Total Book Titles, Total Physical Copies, Available Copies, Registered Members, Currently Issued Books, Overdue Books, and Unpaid Fines.
   - Quick Action buttons for fast workflow navigation.
   - Real-time recent circulation activity log.

2. **Book Catalog Management**:
   - Add new books with input validation (Title, Author, ISBN, Category, Total Copies).
   - View complete book inventory with status badges (*Available*, *Low Stock*, *Out of Stock*).
   - Edit book metadata and adjust copy counts safely without violating active loans.
   - Real-time catalog search filtering by Title, Author, ISBN, or Category.
   - Safe deletion protection: Books cannot be deleted if active copies are currently on loan.

3. **Member Management**:
   - Register members with unique Member IDs, Full Names, validated Email addresses, and Phone numbers.
   - View member directory showing active borrowed count and pending fine totals.
   - Edit member profile details.
   - Safe deletion protection: Prevents deleting members who hold active loans or unpaid fines.

4. **Circulation: Issue & Return**:
   - **Issue Book**: Select from currently available books only; automatically defaults issue date and standard 14-day due date; prevents duplicate active loans of the exact same book to the same member.
   - **Return Book**: Direct one-click return modal from active borrowings; automatically calculates overdue days and applies configured daily fines if returned past the due date; increments available stock atomically.

5. **Configurable Fine Management**:
   - Configurable fine rule: adjust daily fine rate ($/day) and standard loan period via UI or API.
   - Fines ledger showing member, overdue days, penalty amount, and status (`PENDING`, `PAID`, `WAIVED`).
   - Actions to mark fines as Paid with payment receipt notes or Waive fines.

6. **Transaction History & Audit Trail**:
   - Full circulation ledger recording all historical checkouts and returns.
   - Filter transactions by status (`ALL`, `ISSUED`, `RETURNED`, `OVERDUE`).
   - Search by book title, ISBN, or member name.

---

## 🛠️ Technology Stack

- **Frontend**: Semantic HTML5, Vanilla CSS3 (Custom Glassmorphism, CSS Variables, Responsive Layout), Vanilla JavaScript (ES6+ API Client and DOM Controller).
- **Backend**: Node.js & Express (RESTful JSON APIs, parameterized routes, error middleware).
- **Database**: SQLite (`better-sqlite3`) with foreign key constraints, atomic transactions, and auto-initialized schema.
- **Automated Testing**: Selenium WebDriver (`selenium-webdriver` for Chrome in Headless Mode) with JavaScript test runner.

---

## 📁 Project Organization

```
library-management-system/
├── package.json               # NPM scripts, dependencies, and project metadata
├── README.md                  # Comprehensive setup and run documentation
├── .gitignore                 # Excludes node_modules and logs
├── database/
│   ├── schema.sql             # SQL table definitions and indexes
│   ├── db.js                  # Database connection, foreign keys, and auto-init
│   ├── seed.js                # Database seeding script for sample test data
│   └── library.db             # Local SQLite database file (created on launch)
├── backend/
│   ├── server.js              # Express application setup and server boot
│   ├── config.js              # Port and path configuration
│   └── routes/
│       ├── dashboard.js       # /api/dashboard - Stats and recent transactions
│       ├── books.js           # /api/books - Book catalog CRUD and search
│       ├── members.js         # /api/members - Member directory CRUD and search
│       ├── issues.js          # /api/issues - Book circulation issue and return
│       ├── fines.js           # /api/fines - Fine configuration, payments, waivers
│       └── transactions.js    # /api/transactions - Full audit history
├── public/
│   ├── index.html             # Single-page interface with stable Selenium IDs
│   ├── css/
│   │   └── style.css          # Modern dark/glassmorphic stylesheet
│   └── js/
│       ├── api.js             # Client API service
│       └── app.js             # UI routing, validation, and modal handlers
└── tests/
    ├── api-test.js            # Node HTTP backend API endpoint verification
    ├── library.test.js        # Selenium WebDriver test suite in JavaScript
    └── run-tests.js           # Automated test runner (boots server, launches Chrome)
```

---

## 🚀 Windows Setup and Execution Instructions

### Prerequisites
- **Node.js** (v18 or higher recommended; verified on Node v24).
- **Google Chrome** installed on your Windows system.

### Step 1: Clone or Navigate to the Workspace
Open **PowerShell** or **Command Prompt** and navigate to the project directory:
```powershell
cd "c:\vidhula\vs projects\library-management-system-anti\library-management-system"
```

### Step 2: Install Dependencies
Run npm install to download backend and test packages:
```powershell
npm install
```

### Step 3: Populate Seed Data
Initialize the database with realistic sample books, members, and transactions:
```powershell
npm run seed
```

### Step 4: Start the Web Application
Start the local server:
```powershell
npm start
```
*For live auto-reloading during development, you can use:*
```powershell
npm run dev
```

### Step 5: Open the Application in Your Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 Running Automated Tests

### 1. Run the Selenium WebDriver Test Suite
To execute the automated end-to-end browser tests:
```powershell
npm test
```
*(Or `npm run test:selenium`)*

**What this script does:**
1. Resets the database using seed data to guarantee a predictable test state.
2. Starts the backend server automatically on an isolated test port (`3888`).
3. Launches Chrome in headless mode using Selenium WebDriver.
4. Executes tests verifying:
   - Dashboard stat calculation.
   - Form validation & rejection of duplicate ISBNs.
   - Adding and searching catalog books.
   - Email format validation & duplicate member ID rejection.
   - Member registration.
   - Issuing available books.
   - Business rule prevention of duplicate active loans.
   - Returning books, overdue fine calculations, and history logging.
   - Updating fine rule settings.
5. Prints a clear execution report:
   ```
   ===============================================================
                        TEST EXECUTION REPORT                     
   ===============================================================
    1. [✔ PASS] Dashboard Initialization & Statistics
    2. [✔ PASS] Book Catalog CRUD & Duplicate ISBN Validation
    3. [✔ PASS] Member Directory & Email Validation
    4. [✔ PASS] Book Issue Circulation Flow
    5. [✔ PASS] Business Rule: Prevent Duplicate Active Loan
    6. [✔ PASS] Book Return Flow & History Synchronization
    7. [✔ PASS] Fine Rule Configuration & Ledger
   ---------------------------------------------------------------
   TOTAL: 7 | PASSED: 7 | FAILED: 0
   ===============================================================
   ```
6. Gracefully terminates the browser session and server.

### 2. Run Backend API Tests Directly
To quickly verify REST API routes without launching a browser:
```powershell
npm run test:api
```

---

## 🔒 Business Rules & Validation Details

| Rule | Enforcement Location | Behavior |
| :--- | :--- | :--- |
| **Non-Empty Required Fields** | Frontend & Backend | Whitespace-only strings are trimmed and rejected with clear user error messages. |
| **Unique Identifiers** | Frontend & Backend | Duplicate ISBNs and duplicate Member IDs are checked against SQLite and rejected with 400 Bad Request. |
| **Email Format** | Frontend & Backend | Validated using standard regex (`name@domain.ext`). |
| **Book Availability** | Backend Transaction | Cannot issue a book with `available_copies <= 0`. Available stock drops by 1 on issue and increases by 1 on return. |
| **Duplicate Active Borrowing** | Backend Transaction | A member cannot borrow another copy of the same book while they already have an unreturned active loan for it. |
| **Borrowing Limit** | Backend Transaction | Configurable maximum books per member (default 5). |
| **Active Loan Deletion Guard** | Backend Logic | Books with active issued copies cannot be deleted. Members with active loans or pending fines cannot be deleted. |
| **Overdue Fine Rule** | Backend Logic | Calculated upon return: $\text{Overdue Days} \times \text{Fine Rate/Day}$. Recorded in the fines table as `PENDING`. |

---

## 🎯 Selenium Test Element Locator Reference

Every interactive element has a permanent, predictable ID:

| Element | DOM ID | Description |
| :--- | :--- | :--- |
| **Navigation Tabs** | `nav-tab-dashboard`, `nav-tab-books`, `nav-tab-members`, `nav-tab-issues`, `nav-tab-fines`, `nav-tab-transactions` | Switches active view |
| **Dashboard Stats** | `stat-total-books`, `stat-available-books`, `stat-total-members`, `stat-issued-books`, `stat-overdue-books`, `stat-pending-fines` | Statistics card numbers |
| **Book Search** | `input-search-books`, `btn-search-books`, `btn-clear-search-books` | Catalog search bar & buttons |
| **Add Book Modal** | `btn-open-add-book-modal`, `modal-book`, `book-input-title`, `book-input-author`, `book-input-isbn`, `book-input-category`, `book-input-copies`, `btn-save-book`, `book-form-error` | Book form controls & error element |
| **Member Search** | `input-search-members`, `btn-search-members`, `btn-clear-search-members` | Member directory search bar |
| **Member Modal** | `btn-open-add-member-modal`, `modal-member`, `member-input-code`, `member-input-name`, `member-input-email`, `member-input-phone`, `btn-save-member`, `member-form-error` | Member registration form & error element |
| **Issue Form** | `form-issue-book`, `issue-select-book`, `issue-select-member`, `issue-input-date`, `issue-input-due-date`, `btn-submit-issue`, `issue-form-error`, `issue-form-success` | Circulation issue controls |
| **Return Modal** | `modal-return`, `return-input-date`, `return-fine-preview`, `btn-confirm-return`, `return-form-error` | Return modal controls |
| **Fine Settings** | `form-fine-settings`, `input-fine-rate`, `input-loan-days`, `btn-save-fine-settings`, `fine-settings-feedback` | Fine rule configuration controls |
| **Feedback Toast** | `notification-banner`, `notification-text`, `notification-close` | Global notification toast banner |
