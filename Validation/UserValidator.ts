const { check } = require('express-validator')


export var editAccountValidator = [
    // Check Account Id
    check('id').notEmpty().isInt().escape(),
    // Check First Name
    check('firstName').notEmpty().trim().escape(),
    // Check Last Name
    check('lastName').notEmpty().trim().escape(),
    // Check Email
    check('email', 'Please enter a valid email address').notEmpty().isEmail().trim()
    .escape().normalizeEmail(),
    check('roleId').optional().isInt().trim().escape(),
  ];