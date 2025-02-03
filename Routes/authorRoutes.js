const express = require('express');
const authorController = require('../Controllers/authorController');
const { validateAuthor, validateAuthorId } = require('../Validators/authorDTO');
const router = express.Router();

// Route to get all authors
router.get('/', (req, res) => authorController.getAllAuthors(req, res));

// Route to get a specific author by ID
router.get('/id/:id', validateAuthorId, (req, res) => authorController.getAuthorById(req, res));

// Route to get a specific author by name
router.get('/name/:name', (req, res) => authorController.getAuthorByName(req, res));

// Route to create a new author
router.post('/', validateAuthor, (req, res) => authorController.createAuthor(req, res));

// Route to update an existing author by ID
router.put('/:id', [validateAuthorId, validateAuthor], (req, res) => authorController.updateAuthor(req, res));

// Route to delete an author by ID
router.delete('/:id', validateAuthorId, (req, res) => authorController.deleteAuthor(req, res));

module.exports = router;
