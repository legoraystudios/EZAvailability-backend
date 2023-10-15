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

                if(result.length === 0) {
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

        database.query("SELECT * FROM ??;", [process.env.DB_PRODUCTS_TABLE], (err: any, result: any) => {
                res.status(200).json({result})
        })

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
            if(result.length > 0) {
                res.status(400).json({ errors: {msg: "Product Name already exist in our records."} })
            } else {
                database.query("SELECT * FROM ?? WHERE category_id = ?;", [process.env.DB_CATEGORY_TABLE, categoryId], (err: any, result: any) => {
                    if(result.length === 0) {
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

                if(result.length === 0) {
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
                if(result.length === 0) {
                    res.status(404).json({ msg: "Product not found in our records" })
                } else {
                    database.query("DELETE FROM ?? WHERE product_id = ?", [process.env.DB_PRODUCTS_TABLE, productId], async (err: any, result: any) => {
                        res.status(200).json({ msg: "Product deleted successfully" })
                    })
                }
            })

        }

    } catch (err) {
        console.log(err);
    }

})


module.exports = router