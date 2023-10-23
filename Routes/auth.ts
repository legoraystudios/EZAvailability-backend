import express, { Express, Request, Response } from 'express';
const dotenv = require('dotenv')
const moment = require('moment')
const cookieparser = require("cookie-parser")
const { validationResult } = require('express-validator')
const database = require('../Controllers/DatabaseController')
const { errorHandling } = require('../Utilities/ErrorHandling')
const { hashPassword, verifyPassword, createToken, decodeRefresh, createRefresh, verifyToken } = require('../Controllers/AuthController')
const { checkAdmin } = require('../Controllers/UserController')
import { registerValidator, loginValidator } from '../Validation/AuthValidator'
const router = express.Router()

dotenv.config({ path: '../.env' });

const app = express();
app.use(cookieparser());

router.post('/login', loginValidator, (req: Request, res: Response) => {

  try {
    
    const validatorError = validationResult(req)
  
    if (!validatorError.isEmpty()) {
      res.status(400).json({ errors: validatorError.array() })
      return;
    } else {
  
      let email = req.body.email;
      let password = req.body.password;
  
      database.query("SELECT * FROM ?? WHERE email = ?", [process.env.DB_ACCOUNTS_TABLE, email], async (err: any, result: any) => {
      
        if(err) {
          errorHandling(err, req, res);
        } else if(result.length == 0) {
          res.status(404).json({ errors: {msg: "Account not found in our records."} })
        } else if(await verifyPassword(password, result[0]['hashed_passwd']) == false) {
          res.status(401).json({ errors: {msg: "Invalid password."} })
        } else {
  
          // Setting up Access Token
          const role = result[0].role_id
          const id = result[0].id
          const token = createToken(id, email, role)
  
          // Setting up Refresh Token
          const refreshToken = createRefresh(id, email)
  
          res.cookie('session', token, { httpOnly: true, 
            sameSite: 'none', secure: true, 
            maxAge: 30 * 60 * 1000 });
          res.cookie('refresh', refreshToken, { httpOnly: true, 
            sameSite: 'none', secure: true, 
            maxAge: 24 * 60 * 60 * 1000 });
          res.status(200).json({ token, msg: "Login Success" });
        }
      })
  
    }

  } catch (err) {
    errorHandling(err, req, res);
  }
    
  })

router.post('/register', registerValidator, verifyToken, checkAdmin, async (req: Request, res: Response) => {

  try {

    const validatorError = validationResult(req)
  
    if (!validatorError.isEmpty()) {
      res.status(422).json({ errors: validatorError.array() })
      return;
    } else {
      
      let firstName = req.body.firstName
      let lastName = req.body.lastName
      let email = req.body.email
      let password = req.body.password
      let confirmPassword = req.body.confirmPassword
      let roleId = req.body.roleId
  
      let createdAt = moment().format('l, h:mm:ss a');
      
      if(password !== confirmPassword) {
        res.status(422).json({ errors: {msg: "Confirm Password doesn't not match.", errCode: "Reg01"} })
      } else if (!roleId) {
        roleId = 0
      } else if (roleId < 0 || roleId >= 2) {
        res.status(422).json({ errors: {msg: "Please enter a valid Role ID.", errCode: "Reg02"} })
      }
  
      let hashedPassword = await hashPassword(password);
  
  
      database.query("SELECT * FROM ?? WHERE email = ?", [process.env.DB_ACCOUNTS_TABLE, email], (err: any, result: any) => {
          if(err) {
            errorHandling(err, req, res);
          } else if(result.length > 0) {
            res.status(422).json({ errors: {msg: "Email already exist in our records", errCode: "Reg03"} })
          } else {
            database.query('INSERT INTO ?? (email, first_name, last_name, hashed_passwd, created_at, role_id) VALUES (?, ?, ?, ?, ?, ?);',[process.env.DB_ACCOUNTS_TABLE, email, firstName, lastName, hashedPassword, createdAt, roleId], (err: any, result: any) => {
              if (err) {
                errorHandling(err, req, res);
              } else {
                res.status(200).json({ msg: "Account created successfully"});
              }
          })
          }
      })
  
    }

  } catch (err) {
    errorHandling(err, req, res);
  }
  
  })

router.post('/logout', (req, res) => {

  try {

    if(!req.cookies.session) {
      res.status(400).json({ msg: "No user to logout" })
    } else {
      res.clearCookie('session');
      res.clearCookie('refresh');
      res.status(200).json({ msg: "Logged out successfully" })
    }

  } catch (err) {
    errorHandling(err, req, res);
  }

})

router.post('/token', (req, res) => {

  try {

    const refreshToken = req.cookies.refresh;
  
    if (!refreshToken) {
      return res.status(401).json({ errors: { msg: "Invalid Token" } })
    } else {
  
      const id = decodeRefresh(refreshToken).id
  
      database.query("SELECT id, email, first_name, last_name, created_at, role_id FROM ?? WHERE id = ?", [process.env.DB_ACCOUNTS_TABLE, id], async (err: any, result: any) => {
        if (err) {
          errorHandling(err, req, res);
        } else if(result.length == 0) {
            return res.status(404).json({ errors: { msg: "Account not found" } })
        } else {
            const role = result[0].role_id
            const email = result[0].email
            const token = createToken(id, email, role)
    
          res.cookie('session', token, { httpOnly: true, 
            sameSite: 'none', secure: true,
            maxAge: 30 * 60 * 1000 });
  
            res.status(200).json(result);
  
        }
  
      })
    }

  } catch (err) {
    errorHandling(err, req, res);
  }
  

})


module.exports = router