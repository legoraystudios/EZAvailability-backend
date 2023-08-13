import express, { Express, Request, Response } from 'express';
const dotenv = require('dotenv')
const database = require('../Controllers/DatabaseController')
const cookieparser = require("cookie-parser")
const { verifyToken, decodeToken } = require('../Controllers/Auth/AuthController')
const { checkAdmin } = require('../Controllers/User/UserController')
const router = express.Router()

dotenv.config({ path: '../.env' });

const app = express()
app.use(cookieparser())

router.get('/', verifyToken, (req, res) => {
  
    const email = decodeToken(req.cookies.session).email

    database.query("SELECT id, email, first_name, last_name, created_at, role_id FROM ?? WHERE email = ?", [process.env.DB_ACCOUNTS_TABLE, email], async (err: any, result: any) => { 
        res.status(200).json({users: {result}})
    })

})

router.get('/:email', verifyToken, checkAdmin, (req, res) => {

    const email = req.params.email

    database.query("SELECT id, email, first_name, last_name, created_at, role_id FROM ?? WHERE email = ?", [process.env.DB_ACCOUNTS_TABLE, email], async (err: any, result: any) => {

        if(result.length == 0) {
            res.status(404).json({errors: {msg: "User not Found"}})
        } else {
            res.status(200).json({users: {result}})
        }
    })

})

router.get('/id/:id', verifyToken, checkAdmin, (req, res) => {

    const id = req.params.id
    
    database.query("SELECT id, email, first_name, last_name, created_at, role_id FROM ?? WHERE id = ?", [process.env.DB_ACCOUNTS_TABLE, id], async (err: any, result: any) => {

        if(result.length == 0) {
            res.status(404).json({errors: {msg: "User not Found"}})
        } else {
            res.status(200).json({users: {result}})
        }
    })

})


module.exports = router