import express, { NextFunction, Request, Response } from 'express';
const dotenv = require('dotenv')
const database = require('../DatabaseController')
const cookieparser = require("cookie-parser")
const { decodeToken } = require('../Auth/AuthController')

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


module.exports = { checkAdmin }