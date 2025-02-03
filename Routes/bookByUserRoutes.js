const express = require('express');
const bookByUserController = require('../Controllers/bookByUserController');
const { validateBookByUser, validateBookByUserId } = require('../Validators/bookByUserDTO');
const router = express.Router();

// Route to get all books by users
router.get('/', (req, res) => bookByUserController.getAllBookByUser(req, res));

// Route to get the total number of books
router.get('/total/:user_Id', (req, res) => bookByUserController.getTotalBooks(req, res));

// Route to get the total number of books read
router.get('/totalRead/:user_Id', (req, res) => bookByUserController.getTotalBooksRead(req, res));


// Route to get book association by ID
router.get('/id/:id', validateBookByUserId, (req, res) => bookByUserController.getBookByUserById(req, res));

// Route to get recommendations based on most-read author
router.get('/RecommendationByMostReadAuthor/:user',
    (req, res) => bookByUserController.getRecommendationByMostReadAuthor(req, res));

// Route to get recommendations based on most-read genre
router.get('/RecommendationByMostReadGenre/:user',
    (req, res) => bookByUserController.getRecommendationByMostReadGenre(req, res));

// Route to create a new book by user association
router.post('/', validateBookByUser, (req, res) => bookByUserController.createBookByUser(req, res));

// Route to update an existing book by user association by ID
router.put('/:id', [validateBookByUserId, validateBookByUser], (req, res) => bookByUserController.updateBookByUser(req, res));

// Route to delete a book by user association by ID
router.delete('/:id', validateBookByUserId, (req, res) => bookByUserController.deleteBookByUser(req, res));

module.exports = router;
