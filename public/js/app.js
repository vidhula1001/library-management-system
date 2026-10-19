// ==========================================================================
// Athena Library Management System - Frontend Application Logic
// Provides full interactivity, tab routing, validation, and Selenium compatibility
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentTab: 'section-dashboard',
    books: [],
    members: [],
    activeIssues: [],
    fines: [],
    transactions: [],
    fineSettings: {
      fine_rate_per_day: 2.00,
      default_loan_days: 14,
      currency_symbol: '$'
    },
    selectedReturnTx: null
  };

  // --------------------------------------------------------------------------
  // Utility & Notification Helpers
  // --------------------------------------------------------------------------
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[0]}-${parts[1]}-${parts[2]}`;
      }
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  }

  function formatCurrency(amount) {
    const val = parseFloat(amount) || 0;
    return `${state.fineSettings.currency_symbol || '$'}${val.toFixed(2)}`;
  }

  function getTodayString() {
    return new Date().toISOString().split('T')[0];
  }

  function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  let toastTimeout = null;
  function showToast(message, type = 'info', duration = 4000) {
    const banner = document.getElementById('notification-banner');
    const textEl = document.getElementById('notification-text');
    if (!banner || !textEl) return;

    if (toastTimeout) clearTimeout(toastTimeout);

    textEl.textContent = message;
    banner.className = `active toast-${type}`;
    banner.setAttribute('data-type', type);

    toastTimeout = setTimeout(() => {
      banner.className = '';
    }, duration);
  }

  document.getElementById('notification-close')?.addEventListener('click', () => {
    const banner = document.getElementById('notification-banner');
    if (banner) banner.className = '';
  });

  // Modal open / close helpers
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // Close modals on cancel or backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
      }
    });
  });

  document.getElementById('btn-close-book-modal')?.addEventListener('click', () => closeModal('modal-book'));
  document.getElementById('btn-cancel-book')?.addEventListener('click', () => closeModal('modal-book'));

  document.getElementById('btn-close-member-modal')?.addEventListener('click', () => closeModal('modal-member'));
  document.getElementById('btn-cancel-member')?.addEventListener('click', () => closeModal('modal-member'));

  document.getElementById('btn-close-return-modal')?.addEventListener('click', () => closeModal('modal-return'));
  document.getElementById('btn-cancel-return')?.addEventListener('click', () => closeModal('modal-return'));

  // --------------------------------------------------------------------------
  // Tab Routing & Navigation
  // --------------------------------------------------------------------------
  const tabTitles = {
    'section-dashboard': { title: 'Library Overview', subtitle: 'Welcome to the software engineering library management portal' },
    'section-books': { title: 'Book Catalog', subtitle: 'Search, view, register, edit, and organize library books' },
    'section-members': { title: 'Member Directory', subtitle: 'Register and manage library patrons and borrowing eligibility' },
    'section-issues': { title: 'Issue & Return Circulation', subtitle: 'Check out books to members and process returns' },
    'section-fines': { title: 'Fine Management', subtitle: 'Overdue rules, fee collection, and payment waivers' },
    'section-transactions': { title: 'Circulation History', subtitle: 'Comprehensive audit trail of all library transactions' }
  };

  function switchTab(sectionId) {
    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    // Deactivate all nav links
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    // Activate selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
      state.currentTab = sectionId;
    }

    // Activate corresponding nav button
    const targetNavLink = document.querySelector(`.nav-link[data-target="${sectionId}"]`);
    if (targetNavLink) {
      targetNavLink.classList.add('active');
    }

    // Update Header
    const info = tabTitles[sectionId] || { title: 'Athena LMS', subtitle: '' };
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    if (titleEl) titleEl.textContent = info.title;
    if (subtitleEl) subtitleEl.textContent = info.subtitle;

    // Load data for active tab
    refreshCurrentTab();
  }

  // Setup tab listeners
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      if (target) switchTab(target);
    });
  });

  // Global Refresh Button
  document.getElementById('btn-refresh-data')?.addEventListener('click', () => {
    refreshCurrentTab();
    showToast('Data refreshed', 'info', 2000);
  });

  // Quick Action Buttons on Dashboard
  document.getElementById('btn-quick-issue-book')?.addEventListener('click', () => {
    switchTab('section-issues');
  });

  document.getElementById('btn-quick-add-book')?.addEventListener('click', () => {
    switchTab('section-books');
    openAddBookModal();
  });

  document.getElementById('btn-quick-add-member')?.addEventListener('click', () => {
    switchTab('section-members');
    openAddMemberModal();
  });

  function refreshCurrentTab() {
    switch (state.currentTab) {
      case 'section-dashboard':
        loadDashboard();
        break;
      case 'section-books':
        loadBooks();
        break;
      case 'section-members':
        loadMembers();
        break;
      case 'section-issues':
        loadIssueFormData();
        loadActiveIssues();
        break;
      case 'section-fines':
        loadFineSettings();
        loadFines();
        break;
      case 'section-transactions':
        loadTransactions();
        break;
    }
  }

  // --------------------------------------------------------------------------
  // 1. DASHBOARD CONTROLLER
  // --------------------------------------------------------------------------
  async function loadDashboard() {
    try {
      const res = await API.getDashboardStats();
      if (!res.success) return;

      const stats = res.data;
      document.getElementById('stat-total-books').textContent = stats.totalTitles;
      document.getElementById('stat-total-copies').textContent = stats.totalCopies;
      document.getElementById('stat-available-books').textContent = stats.availableCopies;
      document.getElementById('stat-total-members').textContent = stats.registeredMembers;
      document.getElementById('stat-issued-books').textContent = stats.currentlyIssued;
      document.getElementById('stat-overdue-books').textContent = stats.overdueBooks;
      document.getElementById('stat-pending-fines').textContent = formatCurrency(stats.pendingFines);
      document.getElementById('stat-fine-rate').textContent = formatCurrency(stats.fineRate);

      // Render recent activity table
      const tbody = document.getElementById('tbody-recent-transactions');
      if (!tbody) return;

      if (!stats.recentTransactions || stats.recentTransactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No recent transactions recorded</td></tr>';
        return;
      }

      tbody.innerHTML = stats.recentTransactions.map(tx => {
        let statusBadge = '<span class="badge badge-issued">ISSUED</span>';
        if (tx.status === 'RETURNED') {
          statusBadge = '<span class="badge badge-returned">RETURNED</span>';
        }

        return `
          <tr id="recent-row-${tx.id}">
            <td class="mono-text">#TX-${tx.id}</td>
            <td><strong>${escapeHtml(tx.book_title)}</strong></td>
            <td class="mono-text">${escapeHtml(tx.isbn)}</td>
            <td>${escapeHtml(tx.member_name)} <span class="mono-text" style="font-size:11px;">(${escapeHtml(tx.member_code)})</span></td>
            <td>${formatDate(tx.issue_date)}</td>
            <td>${formatDate(tx.due_date)}</td>
            <td>${statusBadge}</td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  }

  // --------------------------------------------------------------------------
  // 2. BOOKS CONTROLLER
  // --------------------------------------------------------------------------
  async function loadBooks(searchTerm = '') {
    const tbody = document.getElementById('tbody-books');
    if (!tbody) return;

    try {
      const res = await API.getBooks(searchTerm);
      state.books = res.data || [];

      if (state.books.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No books found matching your criteria</td></tr>`;
        return;
      }

      tbody.innerHTML = state.books.map(book => {
        let statusBadge;
        if (book.available_copies <= 0) {
          statusBadge = '<span class="badge badge-out" id="book-status-' + book.id + '">Out of Stock</span>';
        } else if (book.available_copies <= 2) {
          statusBadge = '<span class="badge badge-low" id="book-status-' + book.id + '">Low Stock</span>';
        } else {
          statusBadge = '<span class="badge badge-available" id="book-status-' + book.id + '">Available</span>';
        }

        return `
          <tr id="book-row-${book.id}">
            <td class="mono-text">#${book.id}</td>
            <td><strong id="book-title-${book.id}">${escapeHtml(book.title)}</strong></td>
            <td id="book-author-${book.id}">${escapeHtml(book.author)}</td>
            <td class="mono-text" id="book-isbn-${book.id}">${escapeHtml(book.isbn)}</td>
            <td><span class="badge" style="background: rgba(255,255,255,0.06); color:#cbd5e1;">${escapeHtml(book.category)}</span></td>
            <td id="book-total-copies-${book.id}"><strong>${book.total_copies}</strong></td>
            <td id="book-available-copies-${book.id}"><strong>${book.available_copies}</strong></td>
            <td>${statusBadge}</td>
            <td>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-edit-book-${book.id}" data-id="${book.id}">Edit</button>
                <button type="button" class="btn btn-outline-danger btn-sm" id="btn-delete-book-${book.id}" data-id="${book.id}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Attach row action listeners
      state.books.forEach(book => {
        document.getElementById(`btn-edit-book-${book.id}`)?.addEventListener('click', () => openEditBookModal(book));
        document.getElementById(`btn-delete-book-${book.id}`)?.addEventListener('click', () => handleDeleteBook(book));
      });
    } catch (err) {
      console.error('Failed to load books:', err);
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state">Failed to load books from server</td></tr>`;
    }
  }

  // Search Books
  document.getElementById('btn-search-books')?.addEventListener('click', () => {
    const val = document.getElementById('input-search-books')?.value.trim();
    loadBooks(val);
  });

  document.getElementById('input-search-books')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      loadBooks(val);
    }
  });

  document.getElementById('btn-clear-search-books')?.addEventListener('click', () => {
    const input = document.getElementById('input-search-books');
    if (input) input.value = '';
    loadBooks('');
  });

  // Add / Edit Book Modal
  document.getElementById('btn-open-add-book-modal')?.addEventListener('click', openAddBookModal);

  function openAddBookModal() {
    document.getElementById('modal-book-title').textContent = 'Add New Book';
    document.getElementById('book-input-id').value = '';
    document.getElementById('book-input-title').value = '';
    document.getElementById('book-input-author').value = '';
    document.getElementById('book-input-isbn').value = '';
    document.getElementById('book-input-category').value = '';
    document.getElementById('book-input-copies').value = '1';

    const errBox = document.getElementById('book-form-error');
    if (errBox) {
      errBox.textContent = '';
      errBox.classList.remove('active');
    }

    openModal('modal-book');
    setTimeout(() => document.getElementById('book-input-title')?.focus(), 100);
  }

  function openEditBookModal(book) {
    document.getElementById('modal-book-title').textContent = 'Edit Book Details';
    document.getElementById('book-input-id').value = book.id;
    document.getElementById('book-input-title').value = book.title;
    document.getElementById('book-input-author').value = book.author;
    document.getElementById('book-input-isbn').value = book.isbn;
    document.getElementById('book-input-category').value = book.category;
    document.getElementById('book-input-copies').value = book.total_copies;

    const errBox = document.getElementById('book-form-error');
    if (errBox) {
      errBox.textContent = '';
      errBox.classList.remove('active');
    }

    openModal('modal-book');
    setTimeout(() => document.getElementById('book-input-title')?.focus(), 100);
  }

  document.getElementById('btn-save-book')?.addEventListener('click', handleSaveBook);
  document.getElementById('form-book')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSaveBook();
  });

  async function handleSaveBook() {
    const id = document.getElementById('book-input-id').value;
    const title = document.getElementById('book-input-title').value.trim();
    const author = document.getElementById('book-input-author').value.trim();
    const isbn = document.getElementById('book-input-isbn').value.trim();
    const category = document.getElementById('book-input-category').value.trim();
    const copies = parseInt(document.getElementById('book-input-copies').value, 10);

    const errBox = document.getElementById('book-form-error');
    errBox.classList.remove('active');
    errBox.textContent = '';

    // Validation
    if (!title) {
      errBox.textContent = 'Book title is required and cannot be empty.';
      errBox.classList.add('active');
      document.getElementById('book-input-title')?.focus();
      return;
    }
    if (!author) {
      errBox.textContent = 'Author name is required and cannot be empty.';
      errBox.classList.add('active');
      document.getElementById('book-input-author')?.focus();
      return;
    }
    if (!isbn) {
      errBox.textContent = 'ISBN identifier is required and cannot be empty.';
      errBox.classList.add('active');
      document.getElementById('book-input-isbn')?.focus();
      return;
    }
    if (!category) {
      errBox.textContent = 'Category / Genre is required and cannot be empty.';
      errBox.classList.add('active');
      document.getElementById('book-input-category')?.focus();
      return;
    }
    if (isNaN(copies) || copies <= 0) {
      errBox.textContent = 'Total copies must be a valid positive number (minimum 1).';
      errBox.classList.add('active');
      document.getElementById('book-input-copies')?.focus();
      return;
    }

    const bookPayload = { title, author, isbn, category, total_copies: copies };

    try {
      if (id) {
        // Update
        const res = await API.updateBook(id, bookPayload);
        showToast(res.message || 'Book updated successfully', 'success');
      } else {
        // Create
        const res = await API.createBook(bookPayload);
        showToast(res.message || 'Book added successfully', 'success');
      }

      closeModal('modal-book');
      loadBooks();
      loadDashboard();
    } catch (err) {
      errBox.textContent = err.message || 'Failed to save book.';
      errBox.classList.add('active');
    }
  }

  async function handleDeleteBook(book) {
    if (!confirm(`Are you sure you want to delete "${book.title}" (ISBN: ${book.isbn})?`)) {
      return;
    }

    try {
      const res = await API.deleteBook(book.id);
      showToast(res.message || 'Book deleted successfully', 'success');
      loadBooks();
      loadDashboard();
    } catch (err) {
      showToast(err.message || 'Could not delete book', 'error', 5000);
    }
  }

  // --------------------------------------------------------------------------
  // 3. MEMBERS CONTROLLER
  // --------------------------------------------------------------------------
  async function loadMembers(searchTerm = '') {
    const tbody = document.getElementById('tbody-members');
    if (!tbody) return;

    try {
      const res = await API.getMembers(searchTerm);
      state.members = res.data || [];

      if (state.members.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No registered members found</td></tr>`;
        return;
      }

      tbody.innerHTML = state.members.map(member => {
        const hasFines = member.pending_fine_amount > 0;
        const fineBadge = hasFines 
          ? `<span class="badge badge-overdue">${formatCurrency(member.pending_fine_amount)}</span>`
          : `<span style="color: var(--text-muted);">$0.00</span>`;

        return `
          <tr id="member-row-${member.id}">
            <td class="mono-text" id="member-code-${member.id}"><strong>${escapeHtml(member.member_code)}</strong></td>
            <td><strong id="member-name-${member.id}">${escapeHtml(member.name)}</strong></td>
            <td id="member-email-${member.id}">${escapeHtml(member.email)}</td>
            <td id="member-phone-${member.id}">${escapeHtml(member.phone)}</td>
            <td id="member-loans-${member.id}">
              <span class="badge ${member.active_borrowed_count > 0 ? 'badge-issued' : 'badge-returned'}">
                ${member.active_borrowed_count} active
              </span>
            </td>
            <td>${fineBadge}</td>
            <td>${formatDate(member.membership_date)}</td>
            <td><span class="badge badge-active">${escapeHtml(member.status)}</span></td>
            <td>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-edit-member-${member.id}" data-id="${member.id}">Edit</button>
                <button type="button" class="btn btn-outline-danger btn-sm" id="btn-delete-member-${member.id}" data-id="${member.id}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      state.members.forEach(member => {
        document.getElementById(`btn-edit-member-${member.id}`)?.addEventListener('click', () => openEditMemberModal(member));
        document.getElementById(`btn-delete-member-${member.id}`)?.addEventListener('click', () => handleDeleteMember(member));
      });
    } catch (err) {
      console.error('Failed to load members:', err);
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state">Failed to load members from server</td></tr>`;
    }
  }

  // Search Members
  document.getElementById('btn-search-members')?.addEventListener('click', () => {
    const val = document.getElementById('input-search-members')?.value.trim();
    loadMembers(val);
  });

  document.getElementById('input-search-members')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      loadMembers(val);
    }
  });

  document.getElementById('btn-clear-search-members')?.addEventListener('click', () => {
    const input = document.getElementById('input-search-members');
    if (input) input.value = '';
    loadMembers('');
  });

  // Add / Edit Member Modal
  document.getElementById('btn-open-add-member-modal')?.addEventListener('click', openAddMemberModal);

  function openAddMemberModal() {
    document.getElementById('modal-member-title').textContent = 'Register New Member';
    document.getElementById('member-input-id').value = '';
    document.getElementById('member-input-code').value = '';
    document.getElementById('member-input-code').disabled = false;
    document.getElementById('member-input-name').value = '';
    document.getElementById('member-input-email').value = '';
    document.getElementById('member-input-phone').value = '';

    const errBox = document.getElementById('member-form-error');
    if (errBox) {
      errBox.textContent = '';
      errBox.classList.remove('active');
    }

    openModal('modal-member');
    setTimeout(() => document.getElementById('member-input-code')?.focus(), 100);
  }

  function openEditMemberModal(member) {
    document.getElementById('modal-member-title').textContent = 'Edit Member Profile';
    document.getElementById('member-input-id').value = member.id;
    document.getElementById('member-input-code').value = member.member_code;
    document.getElementById('member-input-code').disabled = true; // Member code should be immutable once registered
    document.getElementById('member-input-name').value = member.name;
    document.getElementById('member-input-email').value = member.email;
    document.getElementById('member-input-phone').value = member.phone;

    const errBox = document.getElementById('member-form-error');
    if (errBox) {
      errBox.textContent = '';
      errBox.classList.remove('active');
    }

    openModal('modal-member');
    setTimeout(() => document.getElementById('member-input-name')?.focus(), 100);
  }

  document.getElementById('btn-save-member')?.addEventListener('click', handleSaveMember);
  document.getElementById('form-member')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSaveMember();
  });

  async function handleSaveMember() {
    const id = document.getElementById('member-input-id').value;
    const member_code = document.getElementById('member-input-code').value.trim();
    const name = document.getElementById('member-input-name').value.trim();
    const email = document.getElementById('member-input-email').value.trim();
    const phone = document.getElementById('member-input-phone').value.trim();

    const errBox = document.getElementById('member-form-error');
    errBox.classList.remove('active');
    errBox.textContent = '';

    if (!id && !member_code) {
      errBox.textContent = 'Member Code / ID is required and cannot be empty.';
      errBox.classList.add('active');
      document.getElementById('member-input-code')?.focus();
      return;
    }
    if (!name) {
      errBox.textContent = 'Member name is required and cannot be empty.';
      errBox.classList.add('active');
      document.getElementById('member-input-name')?.focus();
      return;
    }
    if (!email) {
      errBox.textContent = 'Email address is required.';
      errBox.classList.add('active');
      document.getElementById('member-input-email')?.focus();
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errBox.textContent = 'Please provide a valid email format (e.g. name@example.com).';
      errBox.classList.add('active');
      document.getElementById('member-input-email')?.focus();
      return;
    }
    if (!phone) {
      errBox.textContent = 'Phone number is required and cannot be empty.';
      errBox.classList.add('active');
      document.getElementById('member-input-phone')?.focus();
      return;
    }

    const payload = { member_code, name, email, phone };

    try {
      if (id) {
        const res = await API.updateMember(id, payload);
        showToast(res.message || 'Member updated successfully', 'success');
      } else {
        const res = await API.createMember(payload);
        showToast(res.message || 'Member registered successfully', 'success');
      }

      closeModal('modal-member');
      loadMembers();
      loadDashboard();
    } catch (err) {
      errBox.textContent = err.message || 'Failed to save member.';
      errBox.classList.add('active');
    }
  }

  async function handleDeleteMember(member) {
    if (!confirm(`Are you sure you want to delete member "${member.name}" (${member.member_code})?`)) {
      return;
    }

    try {
      const res = await API.deleteMember(member.id);
      showToast(res.message || 'Member deleted successfully', 'success');
      loadMembers();
      loadDashboard();
    } catch (err) {
      showToast(err.message || 'Could not delete member', 'error', 5000);
    }
  }

  // --------------------------------------------------------------------------
  // 4. ISSUE & RETURN CONTROLLER
  // --------------------------------------------------------------------------
  async function loadIssueFormData() {
    try {
      const [booksRes, membersRes, settingsRes] = await Promise.all([
        API.getBooks(),
        API.getMembers(),
        API.getFineSettings()
      ]);

      if (settingsRes.success) {
        state.fineSettings = settingsRes.data;
      }

      // Populate Books Select (Only books with available copies)
      const bookSelect = document.getElementById('issue-select-book');
      if (bookSelect) {
        const availableBooks = (booksRes.data || []).filter(b => b.available_copies > 0);
        bookSelect.innerHTML = '<option value="">-- Choose an available book --</option>' +
          availableBooks.map(b => `<option value="${b.id}">${escapeHtml(b.title)} (Available: ${b.available_copies} / ${b.total_copies})</option>`).join('');
      }

      // Populate Members Select
      const memberSelect = document.getElementById('issue-select-member');
      if (memberSelect) {
        const activeMembers = (membersRes.data || []).filter(m => m.status === 'ACTIVE');
        memberSelect.innerHTML = '<option value="">-- Choose a registered member --</option>' +
          activeMembers.map(m => `<option value="${m.id}">${escapeHtml(m.name)} (${escapeHtml(m.member_code)})</option>`).join('');
      }

      // Default dates
      const today = getTodayString();
      const issueDateInput = document.getElementById('issue-input-date');
      const dueDateInput = document.getElementById('issue-input-due-date');

      if (issueDateInput) issueDateInput.value = today;
      if (dueDateInput) dueDateInput.value = addDays(today, state.fineSettings.default_loan_days || 14);

    } catch (err) {
      console.error('Failed to load issue form data:', err);
    }
  }

  // Issue Form Submit
  document.getElementById('form-issue-book')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const bookId = document.getElementById('issue-select-book')?.value;
    const memberId = document.getElementById('issue-select-member')?.value;
    const issueDate = document.getElementById('issue-input-date')?.value;
    const dueDate = document.getElementById('issue-input-due-date')?.value;

    const errBox = document.getElementById('issue-form-error');
    const successBox = document.getElementById('issue-form-success');
    errBox.classList.remove('active');
    successBox.classList.remove('active');

    if (!bookId) {
      errBox.textContent = 'Please select a book to issue.';
      errBox.classList.add('active');
      return;
    }
    if (!memberId) {
      errBox.textContent = 'Please select a member to issue the book to.';
      errBox.classList.add('active');
      return;
    }
    if (!issueDate) {
      errBox.textContent = 'Please select a valid issue date.';
      errBox.classList.add('active');
      return;
    }
    if (!dueDate) {
      errBox.textContent = 'Please select a valid due date.';
      errBox.classList.add('active');
      return;
    }

    try {
      const res = await API.issueBook({
        book_id: bookId,
        member_id: memberId,
        issue_date: issueDate,
        due_date: dueDate
      });

      successBox.textContent = res.message || 'Book issued successfully!';
      successBox.classList.add('active');
      showToast(res.message, 'success');

      // Reload dropdowns and active list
      loadIssueFormData();
      loadActiveIssues();
      loadDashboard();
    } catch (err) {
      errBox.textContent = err.message || 'Failed to issue book.';
      errBox.classList.add('active');
    }
  });

  // Active Issues List
  async function loadActiveIssues() {
    const tbody = document.getElementById('tbody-active-issues');
    if (!tbody) return;

    try {
      const res = await API.getActiveIssues();
      state.activeIssues = res.data || [];

      if (state.activeIssues.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No books are currently issued</td></tr>`;
        return;
      }

      tbody.innerHTML = state.activeIssues.map(issue => {
        const isOverdue = issue.is_overdue;
        const overdueBadge = isOverdue
          ? `<span class="badge badge-overdue" id="active-status-${issue.transaction_id}">Overdue by ${issue.days_overdue}d</span>`
          : `<span class="badge badge-available" id="active-status-${issue.transaction_id}">On Loan</span>`;

        return `
          <tr id="active-row-${issue.transaction_id}">
            <td class="mono-text">#TX-${issue.transaction_id}</td>
            <td><strong id="active-book-title-${issue.transaction_id}">${escapeHtml(issue.book_title)}</strong></td>
            <td class="mono-text">${escapeHtml(issue.isbn)}</td>
            <td id="active-member-name-${issue.transaction_id}">${escapeHtml(issue.member_name)}</td>
            <td class="mono-text">${escapeHtml(issue.member_code)}</td>
            <td>${formatDate(issue.issue_date)}</td>
            <td>${formatDate(issue.due_date)}</td>
            <td>${overdueBadge}</td>
            <td>
              <button type="button" class="btn btn-success btn-sm" id="btn-return-issue-${issue.transaction_id}" data-id="${issue.transaction_id}">
                Return Book
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Event delegation for return buttons on active issues table
      const activeTbody = document.getElementById('tbody-active-issues');
      if (activeTbody && !activeTbody.dataset.listenerAttached) {
        activeTbody.dataset.listenerAttached = 'true';
        activeTbody.addEventListener('click', (e) => {
          const btn = e.target.closest('button[id^="btn-return-issue-"]');
          if (!btn) return;
          const txId = parseInt(btn.getAttribute('data-id'), 10);
          const issue = state.activeIssues.find(i => i.transaction_id === txId);
          if (issue) {
            openReturnModal(issue);
          }
        });
      }
    } catch (err) {
      console.error('Failed to load active issues:', err);
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state">Failed to load active issues</td></tr>`;
    }
  }

  // Return Book Modal
  function openReturnModal(issue) {
    state.selectedReturnTx = issue;
    document.getElementById('return-input-tx-id').value = issue.transaction_id;
    document.getElementById('return-display-book-title').textContent = issue.book_title;
    document.getElementById('return-display-member-name').textContent = `${issue.member_name} (${issue.member_code})`;
    document.getElementById('return-display-due-date').textContent = issue.due_date;

    const returnDateInput = document.getElementById('return-input-date');
    const today = getTodayString();
    if (returnDateInput) {
      returnDateInput.value = today;
      updateReturnFinePreview(issue.due_date, today);
    }

    const errBox = document.getElementById('return-form-error');
    if (errBox) {
      errBox.textContent = '';
      errBox.classList.remove('active');
    }

    openModal('modal-return');
  }

  document.getElementById('return-input-date')?.addEventListener('input', (e) => {
    if (state.selectedReturnTx) {
      updateReturnFinePreview(state.selectedReturnTx.due_date, e.target.value);
    }
  });

  function updateReturnFinePreview(dueDateStr, returnDateStr) {
    const preview = document.getElementById('return-fine-preview');
    if (!preview || !dueDateStr || !returnDateStr) return;

    const d1 = new Date(dueDateStr);
    const d2 = new Date(returnDateStr);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      const rate = state.fineSettings.fine_rate_per_day || 2.0;
      const fine = (diffDays * rate).toFixed(2);
      preview.className = 'alert-box alert-error active';
      preview.innerHTML = `⚠️ <strong>Overdue by ${diffDays} day(s)</strong>. Calculated fine: <strong>${formatCurrency(fine)}</strong> (at ${formatCurrency(rate)}/day).`;
    } else {
      preview.className = 'alert-box alert-success active';
      preview.innerHTML = `✅ <strong>Returned on time!</strong> No overdue fine will be assessed.`;
    }
  }

  document.getElementById('btn-confirm-return')?.addEventListener('click', handleConfirmReturn);
  document.getElementById('form-return-book')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleConfirmReturn();
  });

  async function handleConfirmReturn() {
    const txId = document.getElementById('return-input-tx-id').value;
    const returnDate = document.getElementById('return-input-date').value;

    const errBox = document.getElementById('return-form-error');
    errBox.classList.remove('active');

    if (!txId) {
      errBox.textContent = 'Invalid transaction ID.';
      errBox.classList.add('active');
      return;
    }
    if (!returnDate) {
      errBox.textContent = 'Please choose a valid return date.';
      errBox.classList.add('active');
      return;
    }

    try {
      const res = await API.returnBook({
        transaction_id: txId,
        return_date: returnDate
      });

      showToast(res.message, res.data.daysOverdue > 0 ? 'info' : 'success', 5000);
      closeModal('modal-return');
      state.selectedReturnTx = null;

      loadActiveIssues();
      loadIssueFormData();
      loadDashboard();
    } catch (err) {
      errBox.textContent = err.message || 'Failed to process book return.';
      errBox.classList.add('active');
    }
  }

  // --------------------------------------------------------------------------
  // 5. FINE MANAGEMENT CONTROLLER
  // --------------------------------------------------------------------------
  async function loadFineSettings() {
    try {
      const res = await API.getFineSettings();
      if (!res.success) return;

      state.fineSettings = res.data;
      const rateInput = document.getElementById('input-fine-rate');
      const loanDaysInput = document.getElementById('input-loan-days');

      if (rateInput) rateInput.value = res.data.fine_rate_per_day;
      if (loanDaysInput) loanDaysInput.value = res.data.default_loan_days;
    } catch (err) {
      console.error('Failed to load fine settings:', err);
    }
  }

  // Update Fine Rule Settings Form
  document.getElementById('form-fine-settings')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rate = parseFloat(document.getElementById('input-fine-rate').value);
    const loanDays = parseInt(document.getElementById('input-loan-days').value, 10);
    const feedback = document.getElementById('fine-settings-feedback');

    if (isNaN(rate) || rate < 0) {
      alert('Fine rate per day must be a non-negative number');
      return;
    }
    if (isNaN(loanDays) || loanDays <= 0) {
      alert('Default loan period must be a positive integer');
      return;
    }

    try {
      const res = await API.updateFineSettings({
        fine_rate_per_day: rate,
        default_loan_days: loanDays
      });

      state.fineSettings.fine_rate_per_day = rate;
      state.fineSettings.default_loan_days = loanDays;

      if (feedback) {
        feedback.textContent = res.message || 'Fine settings updated successfully!';
        feedback.classList.add('active');
        setTimeout(() => feedback.classList.remove('active'), 4000);
      }

      showToast('Fine configuration updated', 'success');
      loadDashboard();
    } catch (err) {
      alert(err.message || 'Failed to update fine settings');
    }
  });

  async function loadFines(statusFilter = '', searchTerm = '') {
    const tbody = document.getElementById('tbody-fines');
    if (!tbody) return;

    const status = statusFilter || document.getElementById('select-fine-status-filter')?.value || 'PENDING';
    const search = searchTerm || document.getElementById('input-search-fines')?.value.trim() || '';

    try {
      const res = await API.getFines(status, search);
      state.fines = res.data || [];

      // Update stat cards
      if (res.stats) {
        document.getElementById('stat-fine-pending-amount').textContent = formatCurrency(res.stats.pending_total);
        document.getElementById('stat-fine-collected-amount').textContent = formatCurrency(res.stats.collected_total);
        document.getElementById('stat-fine-waived-amount').textContent = formatCurrency(res.stats.waived_total);
      }

      if (state.fines.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No fines found matching criteria</td></tr>`;
        return;
      }

      tbody.innerHTML = state.fines.map(fine => {
        let statusBadge = '<span class="badge badge-pending">PENDING</span>';
        let actionButtons = `
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn btn-success btn-sm" id="btn-pay-fine-${fine.fine_id}" data-id="${fine.fine_id}">Pay Fine</button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-waive-fine-${fine.fine_id}" data-id="${fine.fine_id}">Waive</button>
          </div>
        `;

        if (fine.status === 'PAID') {
          statusBadge = '<span class="badge badge-paid">PAID</span>';
          actionButtons = `<span style="font-size:12px; color: var(--success);">Paid on ${formatDate(fine.paid_date)}</span>`;
        } else if (fine.status === 'WAIVED') {
          statusBadge = '<span class="badge badge-waived">WAIVED</span>';
          actionButtons = `<span style="font-size:12px; color: var(--text-muted);">Waived</span>`;
        }

        return `
          <tr id="fine-row-${fine.fine_id}">
            <td class="mono-text">#F-${fine.fine_id}</td>
            <td><strong>${escapeHtml(fine.member_name)}</strong></td>
            <td class="mono-text">${escapeHtml(fine.member_code)}</td>
            <td>${escapeHtml(fine.book_title)}</td>
            <td>${fine.days_overdue} days</td>
            <td><strong style="color: ${fine.status === 'PENDING' ? '#fbbf24' : '#6ee7b7'};">${formatCurrency(fine.amount)}</strong></td>
            <td>${statusBadge}</td>
            <td style="font-size: 12px; color: var(--text-muted);">${escapeHtml(fine.notes || '-')}</td>
            <td>${actionButtons}</td>
          </tr>
        `;
      }).join('');

      state.fines.forEach(fine => {
        if (fine.status === 'PENDING') {
          document.getElementById(`btn-pay-fine-${fine.fine_id}`)?.addEventListener('click', () => handlePayFine(fine));
          document.getElementById(`btn-waive-fine-${fine.fine_id}`)?.addEventListener('click', () => handleWaiveFine(fine));
        }
      });
    } catch (err) {
      console.error('Failed to load fines:', err);
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state">Failed to load fines records</td></tr>`;
    }
  }

  document.getElementById('select-fine-status-filter')?.addEventListener('change', () => loadFines());
  document.getElementById('btn-search-fines')?.addEventListener('click', () => loadFines());
  document.getElementById('input-search-fines')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') loadFines();
  });

  async function handlePayFine(fine) {
    if (!confirm(`Confirm payment of ${formatCurrency(fine.amount)} for member "${fine.member_name}"?`)) {
      return;
    }

    try {
      const res = await API.payFine(fine.fine_id, 'Cash/Card Payment received');
      showToast(res.message || 'Fine marked as paid', 'success');
      loadFines();
      loadDashboard();
    } catch (err) {
      showToast(err.message || 'Payment processing failed', 'error');
    }
  }

  async function handleWaiveFine(fine) {
    const reason = prompt(`Enter reason to waive fine of ${formatCurrency(fine.amount)}:`, 'Administrative waiver');
    if (reason === null) return;

    try {
      const res = await API.waiveFine(fine.fine_id, reason || 'Waived');
      showToast(res.message || 'Fine waived', 'info');
      loadFines();
      loadDashboard();
    } catch (err) {
      showToast(err.message || 'Failed to waive fine', 'error');
    }
  }

  // --------------------------------------------------------------------------
  // 6. TRANSACTION HISTORY CONTROLLER
  // --------------------------------------------------------------------------
  async function loadTransactions() {
    const tbody = document.getElementById('tbody-transactions');
    if (!tbody) return;

    const status = document.getElementById('select-tx-status-filter')?.value || 'ALL';
    const search = document.getElementById('input-search-transactions')?.value.trim() || '';

    try {
      const res = await API.getTransactions(status, search);
      state.transactions = res.data || [];

      if (state.transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="empty-state">No transaction records found</td></tr>`;
        return;
      }

      tbody.innerHTML = state.transactions.map(tx => {
        let statusBadge;
        if (tx.display_status === 'OVERDUE') {
          statusBadge = '<span class="badge badge-overdue">OVERDUE</span>';
        } else if (tx.status === 'ISSUED') {
          statusBadge = '<span class="badge badge-issued">ISSUED</span>';
        } else {
          statusBadge = '<span class="badge badge-returned">RETURNED</span>';
        }

        let fineDisplay = '-';
        if (tx.fine_amount) {
          const fineClass = tx.fine_status === 'PAID' ? 'badge-paid' : (tx.fine_status === 'WAIVED' ? 'badge-waived' : 'badge-pending');
          fineDisplay = `<span class="badge ${fineClass}">${formatCurrency(tx.fine_amount)} (${tx.fine_status})</span>`;
        }

        return `
          <tr id="tx-row-${tx.transaction_id}">
            <td class="mono-text">#TX-${tx.transaction_id}</td>
            <td><strong>${escapeHtml(tx.book_title)}</strong></td>
            <td class="mono-text">${escapeHtml(tx.isbn)}</td>
            <td>${escapeHtml(tx.member_name)}</td>
            <td class="mono-text">${escapeHtml(tx.member_code)}</td>
            <td>${formatDate(tx.issue_date)}</td>
            <td>${formatDate(tx.due_date)}</td>
            <td>${formatDate(tx.return_date)}</td>
            <td>${statusBadge}</td>
            <td>${fineDisplay}</td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error('Failed to load transactions:', err);
      tbody.innerHTML = `<tr><td colspan="10" class="empty-state">Failed to load transaction history</td></tr>`;
    }
  }

  document.getElementById('select-tx-status-filter')?.addEventListener('change', () => loadTransactions());
  document.getElementById('btn-search-transactions')?.addEventListener('click', () => loadTransactions());
  document.getElementById('input-search-transactions')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') loadTransactions();
  });

  // Helper to escape HTML characters for XSS prevention
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --------------------------------------------------------------------------
  // Initialize Application
  // --------------------------------------------------------------------------
  loadDashboard();
});
