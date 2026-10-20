// API Client Module for Library Management System
// Centralizes all fetch calls with consistent error handling and auth token injection

const API = {
  // --------------------------------------------------------------------------
  // Auth helpers
  // --------------------------------------------------------------------------
  getToken() {
    return localStorage.getItem('lms_token') || '';
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('lms_user') || 'null');
    } catch {
      return null;
    }
  },

  isLibrarian() {
    const user = this.getUser();
    return user && user.role === 'LIBRARIAN';
  },

  isMember() {
    const user = this.getUser();
    return user && user.role === 'MEMBER';
  },

  clearSession() {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  },

  // --------------------------------------------------------------------------
  // Generic helper for JSON requests – injects Bearer token automatically
  // --------------------------------------------------------------------------
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(endpoint, config);

      // If 401 Unauthorized – session expired or missing; redirect to login
      if (response.status === 401) {
        this.clearSession();
        window.location.replace('/login.html');
        return;
      }

      const data = await response.json().catch(() => ({
        success: false,
        message: 'Invalid server response'
      }));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      // Don't log redirect errors
      if (!(error instanceof TypeError && error.message.includes('Failed to fetch'))) {
        console.error(`API Error [${endpoint}]:`, error);
      }
      throw error;
    }
  },

  // --------------------------------------------------------------------------
  // Auth endpoints (no token needed – these are public)
  // --------------------------------------------------------------------------
  async login(username, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  async logout() {
    const token = this.getToken();
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {}); // Fire and forget
    }
    this.clearSession();
  },

  async getMe() {
    return this.request('/api/auth/me');
  },

  // --------------------------------------------------------------------------
  // 1. Dashboard
  // --------------------------------------------------------------------------
  getDashboardStats() {
    return this.request('/api/dashboard');
  },

  // --------------------------------------------------------------------------
  // 2. Books
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 3. Members
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 4. Issues & Returns
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 5. Fines
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 6. Transactions
  // --------------------------------------------------------------------------
  getTransactions(status = 'ALL', search = '') {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/transactions${query}`);
  }
};
