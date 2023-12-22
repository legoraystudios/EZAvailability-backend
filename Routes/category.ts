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

        database.query("SELECT * FROM ??;", [process.env.DB_CATEGORY_TABLE], (err: any, result: any) => {
            if (err) {
                errorHandling(err, req, res);
            } else {
                res.status(200).json(result)
            }
        })

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
            const categoryId = await createCatId();

            database.query("SELECT * FROM ?? WHERE category_name = ?;", [process.env.DB_CATEGORY_TABLE, categoryName], (err: any, result: any) => {
                if (err) {
                    errorHandling(err, req, res);
                } else if(result.length > 0) {
                    res.status(422).json({ errors: {msg: "Category Name already exist in our records."} })
                } else {
                    database.query("INSERT INTO ?? (category_id, category_name, category_desc) VALUES (?, ?, ?);", [process.env.DB_CATEGORY_TABLE, categoryId, categoryName, categoryDesc], async (err: any, result: any) => {
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

            database.query("SELECT * FROM ?? WHERE category_id = ?;", [process.env.DB_CATEGORY_TABLE, categoryId], (err: any, result: any) => {
                if (err) {
                    errorHandling(err, req, res);
                } else if(result.length === 0) {
                    res.status(404).json({ errors: {msg: "Category not found in our records."} })
                } else {
                    database.query("UPDATE ?? SET category_name = ?, category_desc = ? WHERE category_id = ?;", [process.env.DB_CATEGORY_TABLE, categoryName, categoryDesc, categoryId], (err: any, result: any) => {
                        res.status(200).json({ msg: "Category edited successfully" })
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