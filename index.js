// back/index.js
const NODE_ENV = process.env.NODE_ENV || 'development'
if (NODE_ENV !== 'production') {
  // Load local env vars in development
  require('dotenv').config()
}

const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const port = process.env.PORT || 3030
const bodyParser = require('body-parser')
const { version } = require('./package.json')
const sequelize = require('./config/database.config')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// user route
app.use('/user', require('./src/routes/user.routes'))

// // news route
app.use('/news', require('./src/routes/news.routes'))
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// // event route
// app.use('/event', require('./src/routes/event.routes'));

// album route
// // app.use('/album', require(./src/routes/album.router));

// // media route
// app.use('/media', require('./src/routes/media.routes'));

// // Contact routes
app.use('/contact', require('./src/routes/contact.routes'));

// test de l'api
app.get('/', (req, res) => res.send(`Hello World - v${version}`))

app.listen(port, async () => {
  try {
    await sequelize.authenticate()
    console.log(`[${NODE_ENV}] Connexion DB établie avec succès.`)
    console.log(`Server v${version} listening on port ${port}`)
  } catch (error) {
    console.error('impossible de se connecter a la bdd:', error)
  }
})
