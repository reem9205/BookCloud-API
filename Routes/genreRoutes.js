const express = require('express');
const genreController = require('../Controllers/genreController');
const { validateGenre, validateGenreId } = require('../Validators/genreDTO');
const router = express.Router();

// Route to get all genres
router.get('/', (req, res) => genreController.getAllGenres(req, res));

// Route to get a specific genre by ID
router.get('/id/:id', validateGenreId, (req, res) => genreController.getGenreById(req, res));

// Route to get a specific genre by name/type
router.get('/name/:name', (req, res) => genreController.getGenreByType(req, res));

// Route to create a new genre
router.post('/', (req, res) => genreController.createGenre(req, res));

// Route to update an existing genre by ID
router.put('/:id', [validateGenre, validateGenreId], (req, res) => genreController.updateGenre(req, res));

// Route to delete a genre by ID
router.delete('/:id', validateGenreId, (req, res) => genreController.deleteGenre(req, res));

module.exports = router;
