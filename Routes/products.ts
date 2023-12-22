import express, { Request, Response } from 'express';
import { createProductValidator, editProductValidator, deleteProductValidator, getProductValidator } from '../Validation/ProductValidator';
const { errorHandling } = require('../Utilities/ErrorHandling');
const { validationResult } = require('express-validator')
const dotenv = require('dotenv')
const database = require('../Controllers/DatabaseController')
const { verifyToken } = require('../Controllers/AuthController')
const { createProductId } = require('../Controllers/ProductsController')
const router = express.Router();

dotenv.config({ path: '../.env' });

router.get('/:id', getProductValidator, verifyToken, (req: Request, res: Response) => {

    try {

        const validatorError = validationResult(req)

        if (!validatorError.isEmpty()) {
          return res.status(400).json({ errors: validatorError.array() })
        } else {

            const { id } = req.params;

            database.query("SELECT * FROM ?? WHERE product_id = ?;", [process.env.DB_PRODUCTS_TABLE, id], (err: any, result: any) => {
                if (err) {
                    errorHandling(err, req, res);
                } else if(result.length === 0) {
                    res.status(422).json({ errors: {msg: "Product not found in our records."} })
                } else {
                    res.status(200).json({result})
                }

            })
        
        }

    } catch (err) {
        errorHandling(err, req, res);
    }

})

router.get('/', verifyToken, (req: Request, res: Response) => {

    try {

        var limitPerPage = parseInt(req.query.limitPerPage as string);
        const page = parseInt(req.query.page as string);
        const { productName, productId, productUpc, categoryId } = req.query;

        var offSet = (page - 1) * limitPerPage
        if(!offSet) {
            offSet = 0;
        }

        if(!limitPerPage) {
            limitPerPage = 10;
        }

        if(productName) {
            database.query(
                `
                WITH TotalCount AS(
                    SELECT COUNT(*) AS total_rows
                    FROM ??
                )
                SELECT
                    products.product_id,
                    products.product_name,
                    products.product_desc,
                    products.product_qty,
                    products.product_upc,
                    products.low_stock_alert,
                    products.category_id,
                    category.category_name,
                    (SELECT total_rows FROM TotalCount) AS total_rows
                    FROM
                        ?? products,
                        ?? category
                    WHERE 
                        products.product_name LIKE ? AND
                        category.category_id = products.category_id
                    LIMIT ? OFFSET ?;
                `
            , [process.env.DB_PRODUCTS_TABLE, process.env.DB_PRODUCTS_TABLE,
            process.env.DB_CATEGORY_TABLE, [`%${productName}%`], limitPerPage, offSet], (err: any, result: any) => {
                if(err) {
                    errorHandling(err, req, res);
                } else {
                    res.status(200).json(result);
                }
            })
        } else if (productId) {
            database.query(
                `
                WITH TotalCount AS(
                    SELECT COUNT(*) AS total_rows
                    FROM ??
                )
                SELECT
                    products.product_id,
                    products.product_name,
                    products.product_desc,
                    products.product_qty,
                    products.product_upc,
                    products.low_stock_alert,
                    products.category_id,
                    category.category_name,
                    (SELECT total_rows FROM TotalCount) AS total_rows
                    FROM
                        ?? products,
                        ?? category
                    WHERE 
                        products.product_id = ? AND
                        category.category_id = products.category_id
                    LIMIT ? OFFSET ?;
                `
            , [process.env.DB_PRODUCTS_TABLE, process.env.DB_PRODUCTS_TABLE,
            process.env.DB_CATEGORY_TABLE, productId, limitPerPage, offSet], (err: any, result: any) => {
                if(err) {
                    errorHandling(err, req, res);
                } else {
                    res.status(200).json(result);
                }
            })
        } else if (productUpc) {
            database.query(
                `
                WITH TotalCount AS(
                    SELECT COUNT(*) AS total_rows
                    FROM ??
                )
                SELECT
                    products.product_id,
                    products.product_name,
                    products.product_desc,
                    products.product_qty,
                    products.product_upc,
                    products.low_stock_alert,
                    products.category_id,
                    category.category_name,
                    (SELECT total_rows FROM TotalCount) AS total_rows
                    FROM
                        ?? products,
                        ?? category
                    WHERE 
                        products.product_upc = ? AND
                        category.category_id = products.category_id
                    LIMIT ? OFFSET ?;
                `
            , [process.env.DB_PRODUCTS_TABLE, process.env.DB_PRODUCTS_TABLE,
            process.env.DB_CATEGORY_TABLE, productUpc, limitPerPage, offSet], (err: any, result: any) => {
                if(err) {
                    errorHandling(err, req, res);
                } else {
                    res.status(200).json(result);
                }
            })
        } else if (categoryId) {
            database.query(
                `
                WITH TotalCount AS(
                    SELECT COUNT(*) AS total_rows
                    FROM ??
                )
                SELECT
                    products.product_id,
                    products.product_name,
                    products.product_desc,
                    products.product_qty,
                    products.product_upc,
                    products.low_stock_alert,
                    products.category_id,
                    category.category_name,
                    (SELECT total_rows FROM TotalCount) AS total_rows
                    FROM
                        ?? products,
                        ?? category
                    WHERE 
                        category.category_id = products.category_id AND
                        products.category_id = ?
                    LIMIT ? OFFSET ?;
                `
            , [process.env.DB_PRODUCTS_TABLE, process.env.DB_PRODUCTS_TABLE,
            process.env.DB_CATEGORY_TABLE, categoryId, limitPerPage, offSet], (err: any, result: any) => {
                if(err) {
                    errorHandling(err, req, res);
                } else {
                    res.status(200).json(result);
                }
            })
        } else {
            database.query(
                `
                WITH TotalCount AS(
                    SELECT COUNT(*) AS total_rows
                    FROM ??
                )
                SELECT
                    products.product_id,
                    products.product_name,
                    products.product_desc,
                    products.product_qty,
                    products.product_upc,
                    products.low_stock_alert,
                    products.category_id,
                    category.category_name,
                    (SELECT total_rows FROM TotalCount) AS total_rows
                    FROM
                        ?? products,
                        ?? category
                    WHERE 
                        category.category_id = products.category_id
                    LIMIT ? OFFSET ?;
                `
            , [process.env.DB_PRODUCTS_TABLE, process.env.DB_PRODUCTS_TABLE,
            process.env.DB_CATEGORY_TABLE, limitPerPage, offSet], (err: any, result: any) => {
                if(err) {
                    errorHandling(err, req, res);
                } else {
                    res.status(200).json(result);
                }
            })
        }

    } catch (err) {
        errorHandling(err, req, res);
    }

})

router.post('/create', verifyToken, createProductValidator, async (req: Request, res: Response) => {

    try {

        const validatorError = validationResult(req)

        if (!validatorError.isEmpty()) {
          return res.status(400).json({ errors: validatorError.array() })
        } else {

            const productId = await createProductId();
            const productName = req.body.productName;
            const productDesc = req.body.productDesc;
            const productQty = req.body.productQty;
            const productUpc = req.body.productUpc;
            const lowStockAlert = req.body.lowStockAlert;
            const categoryId = req.body.categoryId;

            
        database.query("SELECT * FROM ?? WHERE product_name = ?;", [process.env.DB_PRODUCTS_TABLE, productName], (err: any, result: any) => {
            if (err) {
                res.status(200).json({result})
            } else if(result.length > 0) {
                res.status(400).json({ errors: {msg: "Product Name already exist in our records."} })
            } else {
                database.query("SELECT * FROM ?? WHERE category_id = ?;", [process.env.DB_CATEGORY_TABLE, categoryId], (err: any, result: any) => {
                    if (err) {
                        res.status(200).json({result})
                    } else if(result.length === 0) {
                        res.status(400).json({ errors: {msg: "Category ID doesn't exist in our records."} })
                    } else {
                        database.query("INSERT INTO ?? (product_id, product_name, product_desc, product_qty, product_upc, low_stock_alert, category_id) VALUES (?, ?, ?, ?, ?, ?, ?);", [process.env.DB_PRODUCTS_TABLE, productId, productName, productDesc, productQty, productUpc, lowStockAlert, categoryId], (err: any, result: any) => {
                            if (err) {
                                errorHandling(err, req, res);
                            } else {
                                res.status(200).json({ msg: "Product created successfully" })
                            }
                        })
                    }
                })
            }
        })
            
        }

    } catch (err) {
        errorHandling(err, req, res);
    }

})

router.put('/edit', verifyToken, editProductValidator, (req: Request, res: Response) => {

    try {

        const validatorError = validationResult(req);

        if (!validatorError.isEmpty()) {
            return res.status(400).json({ errors: validatorError.array() })
          } else {
            
            const productId = req.body.productId;
            const productName = req.body.productName;
            const productDesc = req.body.productDesc;
            const productQty = req.body.productQty;
            const productUpc = req.body.productUpc;
            const lowStockAlert = req.body.lowStockAlert;
            const categoryId = req.body.categoryId;

            database.query("SELECT * FROM ?? WHERE product_id = ?;", [process.env.DB_PRODUCTS_TABLE, productId], (err: any, result: any) => {
                if (err) {
                    res.status(200).json({result})
                } else if(result.length === 0) {
                    res.status(422).json({ errors: {msg: "Product not found in our records."} })
                } else {
                    database.query("UPDATE ?? SET product_name = ?, product_desc = ?, product_qty = ?, product_upc = ?, low_stock_alert = ?, category_id = ? WHERE product_id = ?;", 
                    [process.env.DB_PRODUCTS_TABLE, productName, productDesc, productQty, productUpc, lowStockAlert, categoryId, productId], (err: any, result: any) => {
                        if (err) {
                            errorHandling(err, req, res);
                        } else {
                            res.status(200).json({ msg: "Product edited successfully" });
                        }
                    })
                }
            })

    } 
    
    } catch (err) {
        errorHandling(err, req, res);
    }

})

router.delete('/delete', verifyToken, deleteProductValidator, async (req: Request, res: Response) => {
    
    try {

        const validatorError = validationResult(req)

        if (!validatorError.isEmpty()) {
          return res.status(400).json({ errors: validatorError.array() })
        } else {

            const productId = req.body.productId;

            database.query("SELECT * FROM ?? WHERE product_id = ?", [process.env.DB_PRODUCTS_TABLE, productId], async (err: any, result: any) => {
                if (err) {
                    errorHandling(err, req, res);
                } else if(result.length === 0) {
                    res.status(404).json({ msg: "Product not found in our records" })
                } else {
                    database.query("DELETE FROM ?? WHERE product_id = ?", [process.env.DB_PRODUCTS_TABLE, productId], async (err: any, result: any) => {
                        if (err) {
                            errorHandling(err, req, res);
                        } else {
                            res.status(200).json({ msg: "Product deleted successfully" })
                        }
                    })
                }
            })
        }

    } catch (err) {
        errorHandling(err, req, res);
    }

})


module.exports = router