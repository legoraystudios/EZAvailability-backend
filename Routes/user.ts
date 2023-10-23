import express, { Express, Request, Response } from 'express';
import { editAccountValidator } from '../Validation/UserValidator';
import { validationResult } from 'express-validator';
const dotenv = require('dotenv')
const database = require('../Controllers/DatabaseController')
const cookieparser = require("cookie-parser")
const { errorHandling } = require('../Utilities/ErrorHandling');
const { verifyToken, decodeToken, hashPassword } = require('../Controllers/AuthController')
const { checkAdmin } = require('../Controllers/UserController')
const router = express.Router()

dotenv.config({ path: '../.env' });

const app = express()
app.use(cookieparser())

router.get('/', verifyToken, checkAdmin, (req, res) => {

    try {

        const limitPerPage = parseInt(req.query.limitPerPage as string);
        const page = parseInt(req.query.page as string);
    
        if(limitPerPage || page) {
            var offSet = (page - 1) * limitPerPage
            if(!offSet) {
                offSet = 0;
            }
            
            database.query("SELECT accounts.id, accounts.email, accounts.first_name, accounts.last_name, accounts.created_at, accounts.role_id, roles.role_title FROM ?? accounts, ?? roles WHERE roles.role_id = accounts.role_id ORDER BY accounts.id LIMIT ? OFFSET ?;", [process.env.DB_ACCOUNTS_TABLE, process.env.DB_ROLES_TABLE, limitPerPage, offSet], async (err: any, result: any) => { 
                if (err) {
                    errorHandling(err, req, res);
                } else {
                    res.status(200).json(result)
                }
            })
    
        } else {
            database.query("SELECT accounts.id, accounts.email, accounts.first_name, accounts.last_name, accounts.created_at, accounts.role_id, roles.role_title FROM ?? accounts, ?? roles WHERE roles.role_id = accounts.role_id ORDER BY accounts.id;", [process.env.DB_ACCOUNTS_TABLE,process.env.DB_ROLES_TABLE], async (err: any, result: any) => { 
                if (err) {
                    errorHandling(err, req, res);
                } else {
                    res.status(200).json(result)
                }
            })
        }

    } catch (err) {
        errorHandling(err, req, res);
    }
    

})
router.get('/me', verifyToken, (req, res) => {

    try {

        const email = decodeToken(req.cookies.session).email
    
        database.query("SELECT id, email, first_name, last_name, created_at, role_id FROM ?? WHERE email = ?;", [process.env.DB_ACCOUNTS_TABLE, email], async (err: any, result: any) => { 
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

router.get('/:email', verifyToken, checkAdmin, (req, res) => {

    try {

        const email = req.params.email
    
        database.query("SELECT id, email, first_name, last_name, created_at, role_id FROM ?? WHERE email = ?;", [process.env.DB_ACCOUNTS_TABLE, email], async (err: any, result: any) => {
            if (err) {
                errorHandling(err, req, res);
            } else if(result.length == 0) {
                res.status(404).json({errors: {msg: "User not Found"}})
            } else {
                res.status(200).json(result)
            }
        })

    } catch (err) {
        errorHandling(err, req, res);
    }

})

router.get('/id/:id', verifyToken, checkAdmin, (req, res) => {

    try {

        const id = req.params.id
        
        database.query("SELECT id, email, first_name, last_name, created_at, role_id FROM ?? WHERE id = ?;", [process.env.DB_ACCOUNTS_TABLE, id], async (err: any, result: any) => {
            if (err) {
                errorHandling(err, req, res);
            } else if(result.length == 0) {
                res.status(404).json({errors: {msg: "User not Found"}})
            } else {
                res.status(200).json(result)
            }
        })

    } catch (err) {
        errorHandling(err, req, res);
    }


})

router.put('/edit', verifyToken, editAccountValidator, async (req: Request, res: Response) => {

    try {

        const validatorError = validationResult(req)
  
        if (!validatorError.isEmpty()) {
          res.status(422).json({ errors: validatorError.array() })
          return;
        } else {

            const id = req.body.id;
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const email = req.body.email;
            var roleId = req.body.roleId;

            if (!roleId) {
                roleId = 0
            } else if (roleId < 0 || roleId >= 2) {
                res.status(422).json({ errors: {msg: "Please enter a valid Role ID.", errCode: "Reg02"} })
            } else {

                database.query("SELECT * FROM ?? WHERE id = ?", [process.env.DB_ACCOUNTS_TABLE, id], (err: any, result: any) => {
                    if (err) {
                        errorHandling(err, req, res);
                    } else if (result[0].id === id) {
                        res.status(404).json({errors: {msg: "User ID not found in our records."}})
                    } else {
                        database.query("SELECT * FROM ?? WHERE id != ? AND email = ?", [process.env.DB_ACCOUNTS_TABLE, id, email], async (err: any, result: any) => {
                            if (err) {
                                errorHandling(err, req, res);
                            } else if (result.length > 0) {
                                res.status(422).json({ errors: {msg: "Email already exist in our records", errCode: "Reg03"} })
                            } else {

                                const role = await decodeToken(req.cookies.session).role;
                                const loggedUser = await decodeToken(req.cookies.session).id;

                                console.log(loggedUser != id)

                                if (role > 0 && loggedUser != id) {
                                    database.query("UPDATE ?? SET first_name = ?, last_name = ?, email = ?, role_id = ? WHERE id = ?;", [process.env.DB_ACCOUNTS_TABLE, firstName, lastName, email, roleId, id], (err: any, result: any) => {
                                        if (err) {
                                            errorHandling(err, req, res);
                                        } else {
                                            res.status(200).json({ msg: "Account updated successfully"});
                                        }
                                    })
                                } else if (loggedUser == id) {
                                    database.query("UPDATE ?? SET first_name = ?, last_name = ?, email = ? WHERE id = ?;", [process.env.DB_ACCOUNTS_TABLE, firstName, lastName, email, id], (err: any, result: any) => {
                                        if (err) {
                                            errorHandling(err, req, res);
                                        } else {
                                            res.status(200).json({ msg: "Account updated successfully"});
                                        }
                                    })
                                } else {
                                    res.status(403).json({ msg: "You don't have permissions to perform this action."});
                                }

                            }
                        })
                    }
                })

            }

        }

    } catch (err) {
        errorHandling(err, req, res);
    }
    
})

router.delete('/:id', verifyToken, checkAdmin, async (req, res) => {

    try {

        const id = req.params.id
        
        database.query("SELECT * FROM ?? WHERE email = ?;", [process.env.DB_ACCOUNTS_TABLE, await decodeToken(req.cookies.session).email], async (err: any, result: any) => {
            if (err) {
                errorHandling(err, req, res);
            } else if (result[0].id === id) {
                res.status(400).json({errors: {msg: "Cannot delete your own username."}})
            } else {
                database.query("SELECT * FROM ?? WHERE id = ?;", [process.env.DB_ACCOUNTS_TABLE, id], async (err: any, result: any) => {
                    if (err) {
                        errorHandling(err, req, res);
                    } else if (result.length === 0) {
                        res.status(404).json({errors: {msg: "User ID not found in our records."}})
                    } else if (result[0].role_id === 2) {
                        res.status(400).json({errors: {msg: "User with Super Administrator role can't be deleted."}})
                    } else {
                        database.query("DELETE FROM ?? WHERE id = ?;", [process.env.DB_ACCOUNTS_TABLE, id], (err: any, result: any) => {
                            if (err) {
                                errorHandling(err, req, res);
                            } else {
                                res.status(200).json({errors: {msg: "User deleted successfully."}})
                            }
                        })
                    }
                })
            }
        })

    } catch (err) {
        errorHandling(err, req, res);
    }


})


module.exports = router