import express, { Request, Response } from 'express';
import { createCatValidator, editCatValidator, deleteCatValidator, getCatValidator } from '../Validation/CategoryValidator';
const { validationResult } = require('express-validator')
const dotenv = require('dotenv')
const database = require('../Controllers/DatabaseController')
const { errorHandling } = require('../Utilities/ErrorHandling')
const { verifyToken } = require('../Controllers/AuthController')
const { createCatId } = require('../Controllers/CategoryController')
const router = express.Router();

dotenv.config({ path: '../.env' });

router.get('/:id', getCatValidator, verifyToken, (req: Request, res: Response) => {

    try {

        const validatorError = validationResult(req)

        if (!validatorError.isEmpty()) {
          return res.status(400).json({ errors: validatorError.array() })
        } else {

            const { id } = req.params;

            database.query("SELECT * FROM ?? WHERE category_id = ?;", [process.env.DB_CATEGORY_TABLE, id], (err: any, result: any) => {
                if (err) {
                    errorHandling(err, req, res);
                } else if(result.length === 0) {
                    res.status(404).json({ errors: {msg: "Category not found in our records."} })
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
        const { categoryName, categoryId } = req.query;

        var offSet = (page - 1) * limitPerPage
        if(!offSet) {
            offSet = 0;
        }

        if(!limitPerPage) {
            limitPerPage = 10;
        }

        if(categoryName) {
            database.query(
                `
                WITH TotalCount AS(
                    SELECT COUNT(*) AS total_rows
                    FROM ?? 
                ),
                TotalProducts AS (
                    SELECT
                        categories.category_id,
                        COUNT(products.product_id) AS total_products
                    FROM
                        ?? categories
                    LEFT JOIN
                        ?? products ON products.category_id = categories.category_id
                    GROUP BY
                        categories.category_id
                )
                SELECT
                    categories.category_id,
                    categories.category_name,
                    categories.category_desc,
                    categories.low_stock_alert,
                    (SELECT total_rows FROM TotalCount) AS total_rows,
                    tp.total_products
                FROM ?? categories
                LEFT JOIN
                    TotalProducts tp ON tp.category_id = categories.category_id
                WHERE
                    categories.category_name LIKE ?
                LIMIT ? OFFSET ?;
                `
                , [process.env.DB_CATEGORY_TABLE,  process.env.DB_CATEGORY_TABLE, process.env.DB_PRODUCTS_TABLE, process.env.DB_CATEGORY_TABLE, [`%${categoryName}%`], limitPerPage, offSet], (err: any, result: any) => {
                if (err) {
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
                ),
                TotalProducts AS (
                    SELECT
                        categories.category_id,
                        COUNT(products.product_id) AS total_products
                    FROM
                        ?? categories
                    LEFT JOIN
                        ?? products ON products.category_id = categories.category_id
                    GROUP BY
                        categories.category_id
                )
                SELECT
                    categories.category_id,
                    categories.category_name,
                    categories.category_desc,
                    categories.low_stock_alert,
                    (SELECT total_rows FROM TotalCount) AS total_rows,
                    tp.total_products
                FROM ?? categories
                LEFT JOIN
                    TotalProducts tp ON tp.category_id = categories.category_id
                WHERE
                    categories.category_id = ?
                LIMIT ? OFFSET ?;
                `
                , [process.env.DB_CATEGORY_TABLE,  process.env.DB_CATEGORY_TABLE, process.env.DB_PRODUCTS_TABLE, process.env.DB_CATEGORY_TABLE, categoryId, limitPerPage, offSet], (err: any, result: any) => {
                if (err) {
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
                ),
                TotalProducts AS (
                    SELECT
                        categories.category_id,
                        COUNT(products.product_id) AS total_products,
                        SUM(products.product_qty) AS total_qty
                    FROM
                        ?? categories
                    LEFT JOIN
                        ?? products ON products.category_id = categories.category_id
                    GROUP BY
                        categories.category_id
                )
                SELECT
                    categories.category_id,
                    categories.category_name,
                    categories.category_desc,
                    categories.low_stock_alert,
                    (SELECT total_rows FROM TotalCount) AS total_rows,
                    tp.total_products,
                    tp.total_qty
                FROM ?? categories
                LEFT JOIN
                    TotalProducts tp ON tp.category_id = categories.category_id
                LIMIT ? OFFSET ?;
                `
                , [process.env.DB_CATEGORY_TABLE,  process.env.DB_CATEGORY_TABLE, process.env.DB_PRODUCTS_TABLE, process.env.DB_CATEGORY_TABLE, limitPerPage, offSet], (err: any, result: any) => {
                if (err) {
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

router.post('/create', createCatValidator, verifyToken, async (req: Request, res: Response) => {
    
    try {

        const validatorError = validationResult(req)

        if (!validatorError.isEmpty()) {
          return res.status(400).json({ errors: validatorError.array() })
        } else {

            const categoryName = req.body.categoryName;
            const categoryDesc = req.body.categoryDesc;
            var lowStockAlert = req.body.lowStockAlert;
            const categoryId = await createCatId();

            if(!lowStockAlert) {
                lowStockAlert = 0;
            }

            database.query("SELECT * FROM ?? WHERE category_name = ?;", [process.env.DB_CATEGORY_TABLE, categoryName], (err: any, result: any) => {
                if (err) {
                    errorHandling(err, req, res);
                } else if(result.length > 0) {
                    res.status(422).json({ errors: {msg: "Category Name already exist in our records.", errCode: "Cat01"} })
                } else {
                    database.query("INSERT INTO ?? (category_id, category_name, category_desc, low_stock_alert) VALUES (?, ?, ?, ?);", [process.env.DB_CATEGORY_TABLE, categoryId, categoryName, categoryDesc, lowStockAlert], async (err: any, result: any) => {
                        if (err) {
                            errorHandling(err, req, res);
                        } else {
                            res.status(200).json({ msg: "Category created successfully" })
                        }
                    })
                }

            })
            }
        } catch (err) {
            errorHandling(err, req, res);
        }
    })

router.put('/edit', verifyToken, editCatValidator, (req: Request, res: Response) => {
    try {
        
        const validatorError = validationResult(req);

        if (!validatorError.isEmpty()) {
            return res.status(400).json({ errors: validatorError.array() })
          } else {
            
            const categoryId = req.body.categoryId;
            const categoryName = req.body.categoryName;
            const categoryDesc = req.body.categoryDesc;
            const lowStockAlert = req.body.lowStockAlert;

            database.query("SELECT * FROM ?? WHERE category_id = ?;", [process.env.DB_CATEGORY_TABLE, categoryId], (err: any, result: any) => {
                if (err) {
                    errorHandling(err, req, res);
                } else if(result.length === 0) {
                    res.status(404).json({ errors: {msg: "Category not found in our records."} })
                } else {
                    database.query("SELECT * FROM ?? WHERE category_name = ? AND category_id NOT LIKE ?", [process.env.DB_CATEGORY_TABLE, categoryName, categoryId], (err: any, result: any) => {
                        if (err) {
                            errorHandling(err, req, res);
                        } else if (result.length > 0) {
                            res.status(422).json({ errors: {msg: "Category Name already exist in our records.", errCode: "Cat01"} })
                        } else {
                            database.query("UPDATE ?? SET category_name = ?, category_desc = ?, low_stock_alert = ? WHERE category_id = ?;", [process.env.DB_CATEGORY_TABLE, categoryName, categoryDesc, lowStockAlert, categoryId], (err: any, result: any) => {
                                if (err) {
                                    errorHandling(err, req, res);
                                } else {
                                    res.status(200).json({ msg: "Category edited successfully" })
                                }
                            })
                        }
                    })
                }
            })

          }

    } catch(err) {
        errorHandling(err, req, res);
    }
})

router.delete('/delete', verifyToken, deleteCatValidator, async (req: Request, res: Response) => {
    
    try {

        const validatorError = validationResult(req)

        if (!validatorError.isEmpty()) {
          return res.status(400).json({ errors: validatorError.array() })
        } else {

            const categoryId = req.body.categoryId;

            database.query("SELECT * FROM ?? WHERE category_id = ?", [process.env.DB_CATEGORY_TABLE, categoryId], async (err: any, result: any) => {
                if (err) {
                    errorHandling(err, req, res);
                } else if(result.length === 0) {
                    res.status(404).json({ msg: "Category not found in our records" })
                } else {
                    database.query("DELETE FROM ?? WHERE category_id = ?", [process.env.DB_CATEGORY_TABLE, categoryId], async (err: any, result: any) => {
                        if (err) {
                            errorHandling(err, req, res);
                        } else {
                            res.status(200).json({ msg: "Category deleted successfully" })
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