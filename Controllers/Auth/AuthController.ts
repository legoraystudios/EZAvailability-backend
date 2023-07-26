import express, { Express, Request, Response } from 'express';
const dotenv = require('dotenv')
const database = require('../DatabaseController')
const bcrypt = require("bcryptjs")

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

module.exports = { hashPassword }