import express, { Express, NextFunction, Request, Response } from 'express';
const jwt = require("jsonwebtoken")
const dotenv = require('dotenv')
const bcrypt = require("bcryptjs")
const cookieparser = require("cookie-parser")

dotenv.config({ path: '../../.env' });

const app = express()
app.use(cookieparser())

async function hashPassword(password: any) {

    const saltRounds = 10;
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function(err: any, hash: any) {
          if (err) reject(err)
          resolve(hash)
        });
      })
      
    return hashedPassword;
}

function verifyPassword(password: any, hashedPassword: any) {

  bcrypt.compare(password, hashedPassword,
    async function (err: any, isMatch: any) {
      if(!isMatch) {
        return Promise.resolve(false)
      } else {
        return Promise.resolve(true)
      }
    })

    return bcrypt.compare(password, hashedPassword);
}

function createToken(email: any, role: any) {
  const token = jwt.sign({ email, role }, 
    process.env.JWT_SECRET_TOKEN, {
        expiresIn: '30m'
    });
    return token;
}

function createRefresh(email: any) {
  const token = jwt.sign({ email }, 
    process.env.JWT_REFRESH_TOKEN, {
        expiresIn: '1d'
    });
    return token;
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.session;

  if (!token) {
    return res.status(403).json({ errors: {msg: "Token Required, please log in again"} })
  }

  try {
    
    const verify = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

      if(!verify){
        return res.status(401).json({ errors: { msg: "Invalid Token" } });
      }

  } catch (err) {
    console.log(err)
  }
  next();

}

function decodeToken(token: any) {
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
  return decodedToken
}

function decodeRefresh(refreshToken: any) {
  const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN)
  return decodedRefresh
}


module.exports = { hashPassword, verifyPassword, createToken, createRefresh, verifyToken, decodeToken, decodeRefresh }