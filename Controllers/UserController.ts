import express, { NextFunction, Request, Response } from 'express';
const dotenv = require('dotenv')
const database = require('./DatabaseController')
const cookieparser = require("cookie-parser")
const { decodeToken } = require('./AuthController')
const { errorHandling } = require('../Utilities/ErrorHandling');

dotenv.config({ path: '../../.env' });

const app = express()
app.use(cookieparser())

const checkAdmin = (req: Request, res: Response, next: NextFunction) => {

    const role = decodeToken(req.cookies.session).role

    if(role == 0) {
        return res.status(403).json({ errors: { msg: "Insufficient Permissions" } })
    }

    next()
}

const getUserId = async (req: Request, res: Response) => {

    const email = decodeToken(req.cookies.session).email

    const result = await new Promise((resolve, reject) => {
        database.query("SELECT id FROM ?? WHERE email = ?", [process.env.DB_ACCOUNTS_TABLE, email], (err: any, result: any) => {
            if(err) {
                errorHandling(err, req, res);
            } else if (result.lenght === 0) {
                res.status(404).json({ errors: { msg: "User ID not found in our records." } })
            } else {
                resolve(result[0].id)
            }
        })
    })

    return result;

}


module.exports = { checkAdmin, getUserId }