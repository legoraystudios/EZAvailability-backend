import express, { Express, Request, Response } from 'express';
const dotenv = require('dotenv')
const moment = require('moment')
const { check, validationResult } = require('express-validator')
const database = require('../Controllers/DatabaseController')
const cookieparser = require("cookie-parser")
const { hashPassword, verifyPassword, createToken, verifyToken, createRefreshToken, decodeToken } = require('../Controllers/Auth/AuthController')
const router = express.Router()

dotenv.config({ path: '../.env' });

const app = express()
app.use(cookieparser())

// Validations Array

var registerValidator = [
  // Check First Name
  check('firstName').trim().escape(),
  // Check Last Name
  check('lastName').trim().escape(),
  // Check Email
  check('email', 'Please enter a valid email address').isEmail().trim()
  .escape().normalizeEmail(),
  // Check Password
  check('password').isLength({ min: 8, max: 16 }).withMessage('Password must have 8-16 characters')
  .matches('[0-9]').withMessage('Password must contain an number').
  matches('[A-Z]').withMessage('Password must contain an uppercase letter')
  .trim().escape(),
  check('confirmPassword').trim().escape()
];

var loginValidator = [
  // Check Email
  check('email', 'Please enter a valid email address').isEmail().trim()
  .escape().normalizeEmail(),
  // Check Password
  check('password').trim().escape()
];

router.post('/login', loginValidator, (req: Request, res: Response) => {
    
    const validatorError = validationResult(req)

    if (!validatorError.isEmpty()) {
      res.status(400).json({ errors: validatorError.array() })
      return;
    } else {

      let email = req.body.email;
      let password = req.body.password;

      database.query("SELECT * FROM ?? WHERE email = ?", [process.env.DB_ACCOUNTS_TABLE, email], async (err: any, result: any) => {
        if(err) {
          console.log(err);
        }

        if(result.length == 0) {
          res.status(401).json({ errors: {msg: "Account not found in our records."} })
        } else if(await verifyPassword(password, result[0]['hashed_passwd']) == false) {
          res.status(401).json({ errors: {msg: "Invalid password."} })
        } else {

          // Setting up Access Token
          const token = createToken(email)

          // Setting up Refresh Token
          res.cookie('session', token, { httpOnly: true, 
            sameSite: 'none', secure: true, 
            maxAge: 24 * 60 * 60 * 1000 });
          return res.status(200).json({ token, msg: "Login Success" });
        }
      })

    }
  })

router.post('/register', registerValidator, async (req: Request, res: Response) => {

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

      let createdAt = moment().format('l, h:mm:ss a');
      
      if(password !== confirmPassword) {
        return res.status(422).json({ errors: {msg: "Confirm Password doesn't not match."} })
      }

      let hashedPassword = await hashPassword(password);


      database.query("SELECT * FROM ?? WHERE email = ?", [process.env.DB_ACCOUNTS_TABLE, email], (err: any, result: any) => {
          if(err) {
            console.log(err);
          }

          if(result.length > 0) {
            res.status(422).json({ errors: {msg: "Email already exist in our records"} })
          } else {
            database.query('INSERT INTO ?? (email, first_name, last_name, hashed_passwd, created_at, role_id) VALUES (?, ?, ?, ?, ?, ?);',[process.env.DB_ACCOUNTS_TABLE, email, firstName, lastName, hashedPassword, createdAt, 0], (err: any, result: any) => {
              res.status(200).json({ msg: "Account created successfully"} )
          })
          }
      })

    }

  })

router.post('/logout', verifyToken, (req, res) => {
    if(!req.cookies.session) {
      res.status(400).json({ msg: "No user to logout" })
    } else {
      res.clearCookie('session');
      res.status(200).json({ msg: "Logged out successfully" })
    }
})


router.post('/verifysession', verifyToken, (req, res) => {

})


module.exports = router