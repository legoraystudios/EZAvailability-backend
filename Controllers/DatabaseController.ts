import express from 'express'
const mysql = require('mysql')
const dotenv = require('dotenv')

const app = express()

dotenv.config({ path: './.env' });

const dbHost = process.env.DB_HOST
const dbUser = process.env.DB_USERNAME
const dbPassword = process.env.DB_PASSWORD
const dbDatabase= process.env.DB_NAME
const dbPort = process.env.DB_PORT


const pool = mysql.createPool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbDatabase,
    connectionLimit : 10,
})


pool.getConnection((err: any, connection: any) => {
    if (err) {
        console.log(`\u001b[31m[EZAvailabity Backend] Something went wrong when connecting to database: \u001b[0m` + err)
    }
})

console.log(`\u001b[32m[EZAvailability Backend] Database connected successfully! \u001b[0m`)


module.exports = pool;