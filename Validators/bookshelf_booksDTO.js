const { body, param, validationResult } = require('express-validator');

// Validation middleware for creating or updating a BookshelfBooks entry
const validateBookshelfBooks = [
    // Validate that book_Id is a positive integer
    body('book_id')
        .isInt({ min: 1 })
        .withMessage('Book ID must be a positive integer'),

    // Validate that bookshelf_Id is a positive integer
    body('bookshelf_id')
        .isInt({ min: 1 })
        .withMessage('Bookshelf ID must be a positive integer'),

    // Middleware to check for validation errors and send a response if errors are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for validating bookshelf_books ID in route parameters
const validateBookshelfBooksId = [
    // Validate that id parameter is a positive integer
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),

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
    validateBookshelfBooks,
    validateBookshelfBooksId
};
