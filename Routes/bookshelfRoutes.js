const express = require('express');
const BookshelfController = require('../Controllers/bookshelfController');
const { validateBookshelf, validateBookshelfId } = require('../Validators/bookshelfDTO');
const { validateUser } = require('../Validators/userDTO');
const router = express.Router();

// Route to get all bookshelves
router.get('/', (req, res) => BookshelfController.getAllBookshelf(req, res));

// Route to get a specific bookshelf by ID
router.get('/id/:id', validateBookshelfId, (req, res) => BookshelfController.getBookshelfById(req, res));

// Route to get a specific bookshelf by username
router.get('/username/:username', (req, res) => BookshelfController.getBookshelfByUsername(req, res));

// Route to get bookshelves by view type
router.get('/view/:view', (req, res) => BookshelfController.getBookshelfByView(req, res));

// Route to get a specific bookshelf by name
router.get('/name/:name', (req, res) => BookshelfController.getBookshelfByName(req, res));

// Route to create a new bookshelf
router.post('/', validateBookshelf, (req, res) => BookshelfController.createBookshelf(req, res));

// Route to update an existing bookshelf by ID
router.put('/:id', [validateBookshelf, validateBookshelfId], (req, res) => BookshelfController.updateBookshelf(req, res));

// Route to delete a bookshelf by ID
router.delete('/:id', validateBookshelfId, (req, res) => BookshelfController.deleteBookshelf(req, res));

module.exports = router;
