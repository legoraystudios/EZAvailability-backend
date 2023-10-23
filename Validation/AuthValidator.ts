const { check } = require('express-validator')

export var registerValidator = [
    // Check First Name
    check('firstName').notEmpty().trim().escape(),
    // Check Last Name
    check('lastName').notEmpty().trim().escape(),
    // Check Email
    check('email', 'Please enter a valid email address').notEmpty().isEmail().trim()
    .escape().normalizeEmail(),
    // Check Password
    check('password').notEmpty().isLength({ min: 8, max: 16 }).withMessage('Password must have 8-16 characters')
    .matches('[0-9]').withMessage('Password must contain a number').
    matches('[A-Z]').withMessage('Password must contain an uppercase letter')
    .trim().escape(),
    check('confirmPassword').notEmpty().trim().escape(),
    check('roleId').optional().isInt().trim().escape(),
  ];
  
export var loginValidator = [
  // Check Email
  check('email', 'Please enter a valid email address').notEmpty().isEmail().trim()
  .escape().normalizeEmail(),
  // Check Password
  check('password').notEmpty().trim().escape()
];

