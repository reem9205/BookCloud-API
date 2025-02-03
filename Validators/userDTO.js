const { body, param, validationResult } = require('express-validator');

// Validation middleware for creating or updating a User entry
const validateUser = [
    // Validate that profile_Id is an integer
    body('profile_Id')
        .optional()
        .isInt()
        .withMessage('Profile ID must be a number'),

    // Validate that FName (first name) is a non-empty string
    body('FName')
        .isString()
        .withMessage('First name must be a string')
        .notEmpty()
        .withMessage('First name is required'),

    // Validate that LName (last name) is a non-empty string
    body('LName')
        .isString()
        .withMessage('Last name must be a string')
        .notEmpty()
        .withMessage('Last name is required'),

    // Validate that email is a non-empty valid email address
    body('email')
        .isEmail()
        .withMessage('Email must be valid')
        .notEmpty()
        .withMessage('Email is required'),

    // Validate that password meets complexity requirements
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('Password must contain at least one special character')
        .notEmpty()
        .withMessage('Password cannot be empty'),

    // Validate that phoneNumber consists only of numbers
    body('phoneNumber')
        .isInt()
        .withMessage('Phone number must contain only numbers'),

    // Validate that address is a string (optional)
    body('address')
        .isString()
        .withMessage('Address must be a string'),

    // Validate that username is a non-empty string
    body('username')
        .notEmpty()
        .withMessage('Username cannot be empty')
        .isString()
        .withMessage('Username must be a string'),


    // Middleware to check for validation errors and send a response if any are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for validating User ID in route parameters
const validateUserId = [
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
    validateUser,
    validateUserId
};
