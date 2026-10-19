// API Client Module for Library Management System
// Centralizes all fetch calls with consistent error handling

const API = {
  // Generic helper for JSON requests
  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(endpoint, config);
      const data = await response.json().catch(() => ({
        success: false,
        message: 'Invalid server response'
      }));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  },

  // 1. Dashboard
  getDashboardStats() {
    return this.request('/api/dashboard');
  },

  // 2. Books
  getBooks(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/api/books${query}`);
  },

  getBook(id) {
    return this.request(`/api/books/${id}`);
  },

  createBook(bookData) {
    return this.request('/api/books', {
      method: 'POST',
      body: bookData
    });
  },

  updateBook(id, bookData) {
    return this.request(`/api/books/${id}`, {
      method: 'PUT',
      body: bookData
    });
  },

  deleteBook(id) {
    return this.request(`/api/books/${id}`, {
      method: 'DELETE'
    });
  },

  // 3. Members
  getMembers(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/api/members${query}`);
  },

  getMember(id) {
    return this.request(`/api/members/${id}`);
  },

  createMember(memberData) {
    return this.request('/api/members', {
      method: 'POST',
      body: memberData
    });
  },

  updateMember(id, memberData) {
    return this.request(`/api/members/${id}`, {
      method: 'PUT',
      body: memberData
    });
  },

  deleteMember(id) {
    return this.request(`/api/members/${id}`, {
      method: 'DELETE'
    });
  },

  // 4. Issues & Returns
  getActiveIssues() {
    return this.request('/api/issues/active');
  },

  issueBook(issueData) {
    return this.request('/api/issues', {
      method: 'POST',
      body: issueData
    });
  },

  returnBook(returnData) {
    return this.request('/api/issues/return', {
      method: 'POST',
      body: returnData
    });
  },

  // 5. Fines
  getFines(status = '', search = '') {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/fines${query}`);
  },

  getFineSettings() {
    return this.request('/api/fines/settings');
  },

  updateFineSettings(settingsData) {
    return this.request('/api/fines/settings', {
      method: 'PUT',
      body: settingsData
    });
  },

  payFine(fineId, notes = '') {
    return this.request(`/api/fines/${fineId}/pay`, {
      method: 'POST',
      body: { notes }
    });
  },

  waiveFine(fineId, notes = '') {
    return this.request(`/api/fines/${fineId}/waive`, {
      method: 'POST',
      body: { notes }
    });
  },

  // 6. Transactions
  getTransactions(status = 'ALL', search = '') {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/transactions${query}`);
  }
};
