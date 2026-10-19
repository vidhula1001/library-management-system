const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// Helper to validate non-empty string
function isValidString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

// GET /api/books - List all books, with optional search filter
router.get('/', (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        b.id,
        b.title,
        b.author,
        b.isbn,
        b.category,
        b.total_copies,
        b.available_copies,
        (b.total_copies - b.available_copies) AS issued_copies,
        b.created_at
      FROM books b
    `;
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += `
        WHERE b.title LIKE ? 
           OR b.author LIKE ? 
           OR b.isbn LIKE ? 
           OR b.category LIKE ?
      `;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY b.title ASC';

    const books = db.prepare(query).all(...params);
    res.json({ success: true, count: books.length, data: books });
  } catch (error) {
    console.error('Fetch books error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve books' });
  }
});

// GET /api/books/:id - Get a single book by ID
router.get('/:id', (req, res) => {
  try {
    const book = db.prepare(`
      SELECT 
        b.id,
        b.title,
        b.author,
        b.isbn,
        b.category,
        b.total_copies,
        b.available_copies,
        (b.total_copies - b.available_copies) AS issued_copies,
        b.created_at
      FROM books b
      WHERE b.id = ?
    `).get(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.json({ success: true, data: book });
  } catch (error) {
    console.error('Fetch book error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve book' });
  }
});

// POST /api/books - Add a new book
router.post('/', (req, res) => {
  try {
    let { title, author, isbn, category, total_copies } = req.body;

    // Validation: Required and non-empty
    if (!isValidString(title)) {
      return res.status(400).json({ success: false, message: 'Book title is required and cannot be empty' });
    }
    if (!isValidString(author)) {
      return res.status(400).json({ success: false, message: 'Author is required and cannot be empty' });
    }
    if (!isValidString(isbn)) {
      return res.status(400).json({ success: false, message: 'ISBN is required and cannot be empty' });
    }
    if (!isValidString(category)) {
      return res.status(400).json({ success: false, message: 'Category is required and cannot be empty' });
    }

    title = title.trim();
    author = author.trim();
    isbn = isbn.trim();
    category = category.trim();

    // Validation: numeric total_copies
    const copies = parseInt(total_copies, 10);
    if (isNaN(copies) || copies <= 0) {
      return res.status(400).json({ success: false, message: 'Total copies must be a positive integer (minimum 1)' });
    }

    // Check duplicate ISBN
    const existingIsbn = db.prepare('SELECT id FROM books WHERE LOWER(isbn) = LOWER(?)').get(isbn);
    if (existingIsbn) {
      return res.status(400).json({ success: false, message: `A book with ISBN "${isbn}" already exists in the system` });
    }

    // Insert book (initially available_copies = total_copies)
    const insertStmt = db.prepare(`
      INSERT INTO books (title, author, isbn, category, total_copies, available_copies)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(title, author, isbn, category, copies, copies);
    const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Book successfully added to the catalog',
      data: newBook
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ success: false, message: 'Failed to add book to catalog' });
  }
});

// PUT /api/books/:id - Update an existing book
router.put('/:id', (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const existingBook = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);

    if (!existingBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    let { title, author, isbn, category, total_copies } = req.body;

    if (!isValidString(title)) {
      return res.status(400).json({ success: false, message: 'Book title is required and cannot be empty' });
    }
    if (!isValidString(author)) {
      return res.status(400).json({ success: false, message: 'Author is required and cannot be empty' });
    }
    if (!isValidString(isbn)) {
      return res.status(400).json({ success: false, message: 'ISBN is required and cannot be empty' });
    }
    if (!isValidString(category)) {
      return res.status(400).json({ success: false, message: 'Category is required and cannot be empty' });
    }

    title = title.trim();
    author = author.trim();
    isbn = isbn.trim();
    category = category.trim();

    const newTotalCopies = parseInt(total_copies, 10);
    if (isNaN(newTotalCopies) || newTotalCopies <= 0) {
      return res.status(400).json({ success: false, message: 'Total copies must be a positive integer (minimum 1)' });
    }

    // Check ISBN uniqueness (if changed)
    const isbnConflict = db.prepare('SELECT id FROM books WHERE LOWER(isbn) = LOWER(?) AND id != ?').get(isbn, bookId);
    if (isbnConflict) {
      return res.status(400).json({ success: false, message: `Another book with ISBN "${isbn}" already exists` });
    }

    // Calculate current issued copies
    const issuedCopies = existingBook.total_copies - existingBook.available_copies;
    if (newTotalCopies < issuedCopies) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce total copies to ${newTotalCopies}. There are currently ${issuedCopies} copy/copies issued to members.`
      });
    }

    // New available copies
    const newAvailableCopies = newTotalCopies - issuedCopies;

    // Update book
    db.prepare(`
      UPDATE books
      SET title = ?, author = ?, isbn = ?, category = ?, total_copies = ?, available_copies = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, author, isbn, category, newTotalCopies, newAvailableCopies, bookId);

    const updatedBook = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);

    res.json({
      success: true,
      message: 'Book details updated successfully',
      data: updatedBook
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ success: false, message: 'Failed to update book details' });
  }
});

// DELETE /api/books/:id - Delete a book
router.delete('/:id', (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // 1. Business rule: Check if copies are currently issued
    const activeTx = db.prepare("SELECT COUNT(*) AS count FROM transactions WHERE book_id = ? AND status = 'ISSUED'").get(bookId);
    if (activeTx && activeTx.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete book "${book.title}". There are currently ${activeTx.count} active issued copy/copies.`
      });
    }

    // 2. Check if historical transactions exist
    const historyTx = db.prepare('SELECT COUNT(*) AS count FROM transactions WHERE book_id = ?').get(bookId);
    if (historyTx && historyTx.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete book "${book.title}" because it has ${historyTx.count} past transaction record(s). Removing it would corrupt audit history.`
      });
    }

    db.prepare('DELETE FROM books WHERE id = ?').run(bookId);

    res.json({
      success: true,
      message: `Book "${book.title}" deleted successfully`
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete book' });
  }
});

module.exports = router;
