const { check } = require('express-validator')

export var scanInValidator = [
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