// back/app.js
const express = require('express')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const { version } = require('./package.json')
const errorHandler = require('./src/middlewares/errorHandler')

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

app.use('/user', require('./src/routes/user.routes'))
app.use('/news', require('./src/routes/news.routes'))
app.use('/event', require('./src/routes/event.routes'))
app.use('/about', require('./src/routes/about.routes'))
// app.use('/album', require(./src/routes/album.router))
app.use('/media', require('./src/routes/media.routes'))
app.use('/contact', require('./src/routes/contact.routes'))

// Test API
app.get('/', (req, res) => res.send(`Hello World - v${version}`))
app.get('/test-log', (req, res) => {
    console.log('Test log entry')
    res.send('Test log entry created')
})

app.use(errorHandler)

module.exports = app
