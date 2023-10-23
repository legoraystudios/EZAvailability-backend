const { check } = require('express-validator')

export var scanListValidator = [
  // Check Product UPC
  check('limitPerPage', 'Please, enter a valid Page Limit').optional().isInt().trim().escape(),
  // Check Product Qty
  check('page', 'Please, enter a valid Page number').optional().isInt().trim().escape()
];

export var scanValidator = [
    // Check Product UPC
    check('productUpc', 'Please, enter a valid Product Code (UPC)').notEmpty().isInt().trim().escape(),
    // Check Product Qty
    check('productQty', 'Please, enter a valid Product Quantity').notEmpty().isInt().trim().escape()
  ];

export var scanOutValidator = [
    // Check Product UPC
    check('productUpc', 'Please, enter a valid Product Code (UPC)').notEmpty().isInt().trim().escape(),
    // Check Product Qty
    check('productQty', 'Please, enter a valid Product Quantity').notEmpty().isInt().trim().escape()
  ];