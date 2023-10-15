const { check } = require('express-validator')

export var createCatValidator = [
    // Check Category Name
    check('categoryName', 'Please, enter a valid Category Name').notEmpty().trim().escape(),
    // Check Category Description
    check('categoryDesc', 'Please, enter a valid Category Description').trim().escape()
  ];

export var editCatValidator = [
    // Check Category ID
    check('categoryId', 'Please, enter a valid Category Id').isInt().notEmpty().trim().escape(),
    // Check Category Name
    check('categoryName', 'Please, enter a valid Category Name').trim().escape(),
    // Check Category Description
    check('categoryDesc', 'Please, enter a valid Category Description').trim().escape()
  ];

export var deleteCatValidator = [
  // Check Category ID
  check('categoryId', 'Please, enter a valid Category Id').isInt().notEmpty().trim().escape(),
];

export var getCatValidator = [
  // Check Category ID
  check('id', 'Please, enter a valid Category Id').isInt().trim().escape(),
];
