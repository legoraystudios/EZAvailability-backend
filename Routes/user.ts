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

    const email = req.params

})


module.exports = router