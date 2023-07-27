import express, { Express, NextFunction, Request, Response } from 'express';
const jwt = require("jsonwebtoken")
const dotenv = require('dotenv')
const database = require('../DatabaseController')
const bcrypt = require("bcryptjs")

dotenv.config({ path: '../../.env' });

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

  var result;

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

function createToken(email: any) {
  const token = jwt.sign({ email }, 
    process.env.JWT_SECRET_TOKEN, {
        expiresIn: 86400
    });
    return token;
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.body.token;
  if (!token) {
    return res.status(403).json({ errors: {msg: "Token Required, please log in again"} })
  }

  try {
    
    const verified = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
      if(!verified){
        return res.status(401).send({ msg: "Invalid Token"});
      }
  } catch (err) {
    return res.status(401).json({ 
        msg: "Invalid Token" 
    });
  }
  next();

}


module.exports = { hashPassword, verifyPassword, createToken, verifyToken }