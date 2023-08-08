import express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const app = express()
const cors = require('cors')
const port = 3000

const appRouter = require('./Routes/app')
const userRouter = require('./Routes/user')
const authRouter = require('./Routes/auth')

app.use(cors({
  origin: 'http://localhost:3006',
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
  console.log(`Example app listening on port ${port}`)
})