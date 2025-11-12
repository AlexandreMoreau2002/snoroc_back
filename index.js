// back/index.js
require('./config/loadEnv')
const app = require('./app')
const { version } = require('./package.json')
const sequelize = require('./config/database.config')
const initDatabase = require('./config/init-database')

const ENV = process.env.ENV || 'dev'
const port = process.env.PORT || 3030

async function start() {
  try {
    await Promise.all([initDatabase(), sequelize.authenticate()])
    console.log(
      `Connexion a la base de donnée établie avec succès, Server v${version}, mode : [${ENV}]`
    )
  } catch (error) {
    console.error('impossible de se connecter a la bdd:', error)
    process.exit(1)
  }

  app.listen(port, () => {
    console.log(`Server ready on port ${port}`)
  })
}

start()
