const express = require('express');
const bookController = require('../Controllers/bookController');
const { validateBook, validateBookId } = require('../Validators/bookDTO');
const router = express.Router();

// Route to get all books
router.get('/', (req, res) => bookController.getAllBooks(req, res));

// Route to get a specific book by ID
router.get('/id/:id', validateBookId, (req, res) => bookController.getBookById(req, res));

// Route to get a specific book by title
router.get('/title/:title', (req, res) => bookController.getBookByTitle(req, res));

// Route to search for books by keyword
router.get('/keyword/:keyword', (req, res) => bookController.searchBook(req, res));

// Route to create a new book
router.post('/', validateBook, (req, res) => bookController.createBook(req, res));

// Route to update an existing book by ID
router.put('/:id', [validateBook, validateBookId], (req, res) => bookController.updateBook(req, res));

// Route to delete a book by ID
router.delete('/:id', validateBookId, (req, res) => bookController.deleteBook(req, res));

module.exports = router;
