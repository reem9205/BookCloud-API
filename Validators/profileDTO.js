const { body, param, validationResult } = require('express-validator');

// Validation middleware for creating or updating a Profile entry
const validateProfile = [
    // Validate that bio is a string
    body('bio')
        .isString()
        .withMessage('Bio must be a string'),

    // Middleware to check for validation errors and send a response if any are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for validating Profile ID in route parameters
const validateProfileId = [
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
    validateProfile,
    validateProfileId
};
