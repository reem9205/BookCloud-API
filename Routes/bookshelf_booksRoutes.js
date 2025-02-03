const express = require('express');
const BookshelfBooksController = require('../Controllers/bookshelf_booksController');
const { validateBookshelfBooks, validateBookshelfBooksId } = require('../Validators/bookshelf_booksDTO');
const router = express.Router();

// Route to get all bookshelf-book associations
router.get('/', (req, res) => BookshelfBooksController.getAllBookshelfBooks(req, res));

// Route to get all books for a specific bookshelf by bookshelf ID
router.get('/bookshelf/:id', (req, res) => BookshelfBooksController.getBookshelfBookById(req, res));

// Route to create a new bookshelf-book association
router.post('/', validateBookshelfBooks, (req, res) => BookshelfBooksController.createBookshelfBooks(req, res));

// Route to update an existing bookshelf-book association
router.put('/:book_id/:bookshelf_id', (req, res) => BookshelfBooksController.updateBookshelfBooks(req, res));

// Route to delete a specific bookshelf-book association
router.delete('/:book_id/:bookshelf_id', (req, res) => BookshelfBooksController.deleteBookshelfBooks(req, res));

module.exports = router;
