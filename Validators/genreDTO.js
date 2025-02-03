const { body, param, validationResult } = require('express-validator');

// Validation middleware for creating or updating a Genre entry
const validateGenre = [
    // Validate that genre_name is a non-empty string
    body('genre_name')
        .isString()
        .withMessage('Genre name must be a string')
        .notEmpty()
        .withMessage('Genre name is required'),

    // Middleware to check for validation errors and send a response if any are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for validating Genre ID in route parameters
const validateGenreId = [
    // Validate that id parameter is an integer
    param('id').isInt().withMessage('ID must be an integer'),

    // Middleware to check for validation errors and send a response if any are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateGenre,
    validateGenreId
};
