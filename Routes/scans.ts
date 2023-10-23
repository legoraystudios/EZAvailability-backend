import express, { Request, Response } from 'express';
import moment from 'moment';
import { scanValidator, scanListValidator } from '../Validation/ScansValidator';
import { validationResult } from 'express-validator';
const dotenv = require('dotenv');
const database = require('../Controllers/DatabaseController');
const { errorHandling } = require('../Utilities/ErrorHandling');
const { verifyToken } = require('../Controllers/AuthController');
const { createScanId } = require('../Controllers/ScansController');
const { getUserId } = require('../Controllers/UserController');

const router = express.Router();

dotenv.config({ path: '../.env' });

router.get('/', verifyToken, scanListValidator, (req: Request, res: Response) => {
    
    try {

        const validatorError = validationResult(req)

        if (!validatorError.isEmpty()) {
          return res.status(400).json({ errors: validatorError.array() })
        } else {

        const limitPerPage = parseInt(req.query.limitPerPage as string);
        const page = parseInt(req.query.page as string);
    
        if(limitPerPage && page) {
            var offSet = (page - 1) * limitPerPage
            if(!offSet) {
                offSet = 0;
            }

            database.query("SELECT * FROM ?? LIMIT ? OFFSET ?;", [process.env.DB_SCANS_TABLE, limitPerPage, offSet], (err: any, result: any) => {
                if(err) {
                    errorHandling(err, req, res);
                } else if (result.length == 0) {
                    res.status(404).json({ errors: {msg: "No scans available to display."} });
                } else {
                    res.status(200).json(result);
                }
            })
        } else {
            database.query("SELECT * FROM ??;", [process.env.DB_SCANS_TABLE], (err: any, result: any) => {
                if(err) {
                    errorHandling(err, req, res);
                } else if (result.length == 0) {
                    res.status(404).json({ errors: {msg: "No scans available to display."} });
                } else {
                    res.status(200).json(result);
                }
            })
        }

    }


    } catch (err) {
        errorHandling(err, req, res);
    }

})

router.get('/:id', verifyToken, (req: Request, res: Response) => {
    
    try {

        const { id } = req.params;

        database.query("SELECT * FROM ?? WHERE scan_id = ?", [process.env.DB_SCANS_TABLE, id], (err: any, result: any) => {
            if(err) {
                errorHandling(err, req, res);
            } else if (result.length == 0) {
                res.status(404).json({ errors: {msg: "No scans available to display."} });
            } else {
                res.status(200).json(result);
            }
        })

    } catch (err) {
        errorHandling(err, req, res);
    }

})

router.get('/product/:id', verifyToken, scanListValidator, (req: Request, res: Response) => {
    
    try {

        const validatorError = validationResult(req)

        if (!validatorError.isEmpty()) {
          return res.status(400).json({ errors: validatorError.array() })
        } else {

        const { id } = req.params;
        const limitPerPage = parseInt(req.query.limitPerPage as string);
        const page = parseInt(req.query.page as string);
    
        if(limitPerPage && page) {
            var offSet = (page - 1) * limitPerPage
            if(!offSet) {
                offSet = 0;
            }

            database.query("SELECT * FROM ?? WHERE product_id = ? LIMIT ? OFFSET ?;", [process.env.DB_SCANS_TABLE, id, limitPerPage, offSet], (err: any, result: any) => {
                if(err) {
                    errorHandling(err, req, res);
                } else if (result.length == 0) {
                    res.status(404).json({ errors: {msg: "No scans available to display."} });
                } else {
                    res.status(200).json(result);
                }
            })
        
        } else {
            database.query("SELECT * FROM ?? WHERE product_id = ?", [process.env.DB_SCANS_TABLE, id], (err: any, result: any) => {
                if(err) {
                    errorHandling(err, req, res);
                } else if (result.length == 0) {
                    res.status(404).json({ errors: {msg: "No scans available to display."} });
                } else {
                    res.status(200).json(result);
                }
            })
        }

    }

    } catch (err) {
        errorHandling(err, req, res);
    }

})

router.post('/in', verifyToken, scanValidator, (req: Request, res: Response) => {

    try {

        const validatorError = validationResult(req)

        if (!validatorError.isEmpty()) {
          return res.status(400).json({ errors: validatorError.array() })
        } else {
        
            const productUpc = req.body.productUpc;
            const productQty = req.body.productQty;

            database.query("SELECT * FROM ?? WHERE product_upc = ?;", [process.env.DB_PRODUCTS_TABLE, productUpc], async (err: any, result: any) => {
                if(err) {
                    errorHandling(err, req, res);
                } else if(result.length === 0) {
                    res.status(404).json({ errors: {msg: "Product not found in our records."} })
                } else {

                    const productId = result[0].product_id;
                    const productName = result[0].product_name; 
                    const scanDate = moment().format('l, h:mm:ss a');
                    const scanType = "IN (+" + productQty + ")";
                    const totalQty = parseInt(result[0].product_qty) + parseInt(productQty);

                    database.query("UPDATE ?? SET product_qty = ? WHERE product_upc = ?;", [process.env.DB_PRODUCTS_TABLE, totalQty, productUpc], async (err: any, result: any) => {
                        if (err) {
                            errorHandling(err, req, res);
                        } else {
                            database.query("INSERT INTO ?? (scan_id, product_id, scan_date, scan_type, actioned_by) VALUES (?, ?, ?, ?, ?);", [process.env.DB_SCANS_TABLE, await createScanId(), productId, scanDate, scanType, await getUserId(req, res)], (err: any, result: any) => {
                                if (err) {
                                    errorHandling(err, req, res);
                                } else {
                                    res.status(200).json({ msg: "Added " + productQty + " item(s) to " + productName + "." })
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

router.post('/out', verifyToken, scanValidator, (req: Request, res: Response) => {

    try {

        const validatorError = validationResult(req)

        if (!validatorError.isEmpty()) {
          return res.status(400).json({ errors: validatorError.array() })
        } else {
        
            const productUpc = req.body.productUpc;
            const productQty = req.body.productQty;   

            database.query("SELECT * FROM ?? WHERE product_upc = ?;", [process.env.DB_PRODUCTS_TABLE, productUpc], (err: any, result: any) => {

                if (err) {
                    errorHandling(err, req, res);
                } else if(result.length === 0) {
                    res.status(404).json({ errors: {msg: "Product not found in our records."} })
                } else {

                    const productId = result[0].product_id;
                    const productName = result[0].product_name; 
                    const scanDate = moment().format('l, h:mm:ss a');
                    const scanType = "OUT (-" + productQty + ")";
                    const totalQty = parseInt(result[0].product_qty) - parseInt(productQty);

                    if(totalQty < 0) {
                        res.status(422).json({ errors: {msg: "Desired quantity exceeds the quantity in inventory."} })
                    } else {
                        database.query("UPDATE ?? SET product_qty = ? WHERE product_upc = ?", [process.env.DB_PRODUCTS_TABLE, totalQty, productUpc], async (err: any, result: any) => {
                            if(err) {
                                errorHandling(err, req, res);
                            } else {
                                database.query("INSERT INTO ?? (scan_id, product_id, scan_date, scan_type, actioned_by) VALUES (?, ?, ?, ?, ?);", [process.env.DB_SCANS_TABLE, await createScanId(), productId, scanDate, scanType, await getUserId(req, res)], (err: any, result: any) => {
                                    if (err) {
                                        errorHandling(err, req, res);
                                    } else {
                                        res.status(200).json({ msg: "Removed " + productQty + " item(s) to " + productName + "." })
                                    }
                                })
                                
                            }
                        })
                    }
                }

            })

        }

    } catch (err) {
        errorHandling(err, req, res);
    }

})

module.exports = router;
