// back/app.js
const express = require('express')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const { version } = require('./package.json')

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// Log access to static uploads to debug broken links
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(__dirname, 'public/uploads', req.path)
  console.log('[static uploads] request:', req.method, req.originalUrl, '| resolved:', filePath)
  next()
})
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

app.use('/user', require('./src/routes/user.routes'))
app.use('/news', require('./src/routes/news.routes'))
// app.use('/event', require('./src/routes/event.routes'))
// app.use('/album', require(./src/routes/album.router))
// app.use('/media', require('./src/routes/media.routes'))
app.use('/contact', require('./src/routes/contact.routes'))

// Test API
app.get('/', (req, res) => res.send(`Hello World - v${version}`))

module.exports = app
