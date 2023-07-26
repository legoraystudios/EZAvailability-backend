const mysql = require('mysql')
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const dbHost = process.env.DB_HOST
const dbUsername = process.env.DB_USERNAME
const dbPassword = process.env.DB_PASSWORD
const dbPort = process.env.DB_PORT
const dbName = process.env.DB_NAME

const connection = mysql.createConnection({
  host: dbHost,
  user: dbUsername,
  password: dbPassword,
  database: dbName,
  port: dbPort
})

connection.connect(function(err: any) {
  if (err) throw err

  console.log('[EZAvailability] Database connected successfully.')
});

module.exports = connection