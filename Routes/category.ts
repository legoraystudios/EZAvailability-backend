import express, { Request, Response } from 'express';
import { createCatValidator, editCatValidator, deleteCatValidator } from '../Validation/CategoryValidator';
const { validationResult } = require('express-validator')
const dotenv = require('dotenv')
const database = require('../Controllers/DatabaseController')
const { verifyToken } = require('../Controllers/AuthController')
const { createCatId } = require('../Controllers/CategoryController')
const router = express.Router();

dotenv.config({ path: '../.env' });

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

                if(result.length > 0) {
                    res.status(422).json({ errors: {msg: "Category Name already exist in our records."} })
                } else {
                    database.query("INSERT INTO ?? (category_id, category_name, category_desc) VALUES (?, ?, ?);", [process.env.DB_CATEGORY_TABLE, categoryId, categoryName, categoryDesc], async (err: any, result: any) => {
                        res.status(200).json({ msg: "Category created successfully" })
                    })
                }

            })
            }
        } catch (err) {
            console.log(err);
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

                if(result.length === 0) {
                    res.status(422).json({ errors: {msg: "Category not found in our records."} })
                } else {
                    database.query("UPDATE ?? SET category_name = ?, category_desc = ? WHERE category_id = ?;", [process.env.DB_CATEGORY_TABLE, categoryName, categoryDesc, categoryId], (err: any, result: any) => {
                        res.status(200).json({ msg: "Category edited successfully" })
                    })
                }
            })

          }

    } catch(err) {
        console.log(err);
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
                if(result.length === 0) {
                    res.status(404).json({ msg: "Category not found in our records" })
                } else {
                    database.query("DELETE FROM ?? WHERE category_id = ?", [process.env.DB_CATEGORY_TABLE, categoryId], async (err: any, result: any) => {
                        res.status(200).json({ msg: "Category deleted successfully" })
                    })
                }
            })

        }

    } catch (err) {
        console.log(err);
    }

})

module.exports = router