import express, { Express, Request, Response } from 'express';
const dotenv = require('dotenv')
const database = require('../Controllers/DatabaseController')
const cookieparser = require("cookie-parser")
const { verifyToken, decodeToken } = require('../Controllers/AuthController')
const { checkAdmin } = require('../Controllers/UserController')
const router = express.Router()

dotenv.config({ path: '../.env' });

const app = express()
app.use(cookieparser())

router.get('/', verifyToken, checkAdmin, (req, res) => {
    
    const limitPerPage = parseInt(req.query.limitPerPage as string);
    const page = parseInt(req.query.page as string);

    if(limitPerPage || page) {
        var offSet = (page - 1) * limitPerPage
        if(!offSet) {
            offSet = 0;
        }
        
        database.query("SELECT accounts.id, accounts.email, accounts.first_name, accounts.last_name, accounts.created_at, accounts.role_id, roles.role_title FROM ?? accounts, ?? roles WHERE roles.role_id = accounts.role_id ORDER BY accounts.id LIMIT ? OFFSET ?", [process.env.DB_ACCOUNTS_TABLE, process.env.DB_ROLES_TABLE, limitPerPage, offSet], async (err: any, result: any) => { 
            res.status(200).json(result)
        })

    } else {
        database.query("SELECT accounts.id, accounts.email, accounts.first_name, accounts.last_name, accounts.created_at, accounts.role_id, roles.role_title FROM ?? accounts, ?? roles WHERE roles.role_id = accounts.role_id ORDER BY accounts.id", [process.env.DB_ACCOUNTS_TABLE,process.env.DB_ROLES_TABLE], async (err: any, result: any) => { 
            res.status(200).json(result)
        })
    }

})
router.get('/me', verifyToken, (req, res) => {
  
    const email = decodeToken(req.cookies.session).email

    database.query("SELECT id, email, first_name, last_name, created_at, role_id FROM ?? WHERE email = ?", [process.env.DB_ACCOUNTS_TABLE, email], async (err: any, result: any) => { 
        res.status(200).json(result)
    })

})

router.get('/:email', verifyToken, checkAdmin, (req, res) => {

    const email = req.params.email

    database.query("SELECT id, email, first_name, last_name, created_at, role_id FROM ?? WHERE email = ?", [process.env.DB_ACCOUNTS_TABLE, email], async (err: any, result: any) => {

        if(result.length == 0) {
            res.status(404).json({errors: {msg: "User not Found"}})
        } else {
            res.status(200).json(result)
        }
    })

})

router.get('/id/:id', verifyToken, checkAdmin, (req, res) => {

    const id = req.params.id
    
    database.query("SELECT id, email, first_name, last_name, created_at, role_id FROM ?? WHERE id = ?", [process.env.DB_ACCOUNTS_TABLE, id], async (err: any, result: any) => {

        if(result.length == 0) {
            res.status(404).json({errors: {msg: "User not Found"}})
        } else {
            res.status(200).json(result)
        }
    })

})


module.exports = router