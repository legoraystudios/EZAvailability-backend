import express, { Express, NextFunction, Request, Response } from 'express';
const dotenv = require('dotenv')
const database = require('../DatabaseController')
const cookieparser = require("cookie-parser")
const { decodeToken } = require('../Auth/AuthController')

dotenv.config({ path: '../../.env' });

const app = express()
app.use(cookieparser())

const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    
    const email = decodeToken(req.cookies.session).email

    database.query("SELECT role_id FROM ?? WHERE email = ?", [process.env.DB_ACCOUNTS_TABLE, email], async (err: any, result: any) => { 
        console.log(result)
    })

    next()
}


module.exports = { checkAdmin }