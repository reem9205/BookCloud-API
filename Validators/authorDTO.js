
const { body, param, validationResult } = require('express-validator');

// Validation middleware for creating or updating an author
const validateAuthor = [
    // Validate that first_name is a non-empty string
    body('first_name')
        .isString()
        .withMessage('First name must be a string')
        .notEmpty()
        .withMessage('First name is required'),

    // Validate that last_name is a non-empty string
    body('last_name')
        .isString()
        .withMessage('Last name must be a string')
        .notEmpty()
        .withMessage('Last name is required'),

    // Middleware to check for validation errors and send a response if errors are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for validating author ID
const validateAuthorId = [
    // Validate that id parameter is an integer
    param('id').isInt().withMessage('ID must be an integer'),

    // Middleware to check for validation errors and send a response if errors are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateAuthor,
    validateAuthorId
};
