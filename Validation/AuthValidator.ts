const { check } = require('express-validator')

export var registerValidator = [
    // Check First Name
    check('firstName').trim().escape(),
    // Check Last Name
    check('lastName').trim().escape(),
    // Check Email
    check('email', 'Please enter a valid email address').isEmail().trim()
    .escape().normalizeEmail(),
    // Check Password
    check('password').isLength({ min: 8, max: 16 }).withMessage('Password must have 8-16 characters')
    .matches('[0-9]').withMessage('Password must contain an number').
    matches('[A-Z]').withMessage('Password must contain an uppercase letter')
    .trim().escape(),
    check('confirmPassword').trim().escape()
  ];
  
export var loginValidator = [
  // Check Email
  check('email', 'Please enter a valid email address').isEmail().trim()
  .escape().normalizeEmail(),
  // Check Password
  check('password').trim().escape()
];

