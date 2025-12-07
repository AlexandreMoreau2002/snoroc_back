const dotenv = require('dotenv')

if (!process.env.__ENV_LOADED__) {
  dotenv.config({ quiet: true })
  process.env.__ENV_LOADED__ = 'true'
}

module.exports = process.env
