const { check } = require('express-validator')

export var createProductValidator = [
    // Check Product Name
    check('productName', 'Please, enter a valid Product Name').notEmpty().trim().escape(),
    // Check Product Description
    check('productDesc', 'Please, enter a valid Product Description').trim().escape(),
    // Check Product Qty
    check('productQty', 'Please, enter a valid Product Quantity').notEmpty().isInt().trim().escape(),
    // Check Product UPC
    check('productUpc', 'Please, enter a valid Product Code (UPC)').notEmpty().isInt().trim().escape(),
    // Check Low Stock Alert
    check('lowStockAlert', 'Please, enter a minimun amount for Low Stock Alert').notEmpty().isInt().trim().escape(),
    // Check CategoryID
    check('categoryId', 'Please, enter a valid Category ID').notEmpty().isInt().trim().escape()
  ];

export var editProductValidator = [
    // Check Product ID
    check('productId', 'Please, enter a valid Product Id').isInt().notEmpty().trim().escape(),
    // Check Product Name
    check('productName', 'Please, enter a valid Product Name').notEmpty().trim().escape(),
    // Check Product Description
    check('productDesc', 'Please, enter a valid Product Description').trim().escape(),
    // Check Product Qty
    check('productQty', 'Please, enter a valid Product Quantity').notEmpty().isInt().trim().escape(),
    // Check Product UPC
    check('productUpc', 'Please, enter a valid Product Code (UPC)').notEmpty().isInt().trim().escape(),
    // Check Low Stock Alert
    check('lowStockAlert', 'Please, enter a minimun amount for Low Stock Alert').notEmpty().isInt().trim().escape(),
        // Check CategoryID
        check('categoryId', 'Please, enter a valid Category ID').notEmpty().isInt().trim().escape()
  ];

export var deleteProductValidator = [
  // Check Product ID
  check('prodcutId', 'Please, enter a valid Product Id').isInt().notEmpty().trim().escape(),
];

export var getProductValidator = [
  // Check Product ID
  check('id', 'Please, enter a valid Product Id').isInt().notEmpty().isInt().trim().escape(),
];
