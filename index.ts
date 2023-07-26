import express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const appRouter = require('./Routes/app')
const authRouter = require('./Routes/auth')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', appRouter)
app.use('/auth', authRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})