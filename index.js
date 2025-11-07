// back/index.js
const ENV = process.env.ENV || 'development'
if (ENV !== 'production') {
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
const initDatabase = require('./config/init-database')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// user route
app.use('/user', require('./src/routes/user.routes'))

// // news route
app.use('/news', require('./src/routes/news.routes'))

// // event route
// app.use('/event', require('./src/routes/event.routes'));

// album route
// // app.use('/album', require(./src/routes/album.router));

// // media route
// app.use('/media', require('./src/routes/media.routes'));

// // Contact routes
app.use('/contact', require('./src/routes/contact.routes'))

// test de l'api
app.get('/', (req, res) => res.send(`Hello World - v${version}`))

async function start() {
  try {
    await initDatabase()
    await sequelize.authenticate()
    console.log(`[${ENV}] Connexion DB établie avec succès.`)
    console.log(`Server v${version} listening on port ${port}`)
  } catch (error) {
    console.error('impossible de se connecter a la bdd:', error)
    process.exit(1)
  }

  app.listen(port, () => {
    console.log(`Server ready on port ${port}`)
  })
}

start()
