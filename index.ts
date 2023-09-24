import express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv')
const app = express()
const cors = require('cors')

dotenv.config({ path: '.env' });
const port = process.env.APP_PORT

const appRouter = require('./Routes/app')
const userRouter = require('./Routes/user')
const authRouter = require('./Routes/auth')

app.use(cors({
  origin: process.env.FRONTEND_DOMAIN,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', appRouter)
app.use('/auth', authRouter)
app.use('/user', userRouter)

app.listen(port, () => {
  console.log(`[EZAvailability Backend] App listening on port: ${port}`)
})