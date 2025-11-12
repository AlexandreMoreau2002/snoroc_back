require('./loadEnv')
const mysql = require('mysql2/promise')
const configs = require('./config')

const ENV = process.env.ENV || 'dev'
let initPromise = null

function getDbConfig() {
  const fallback = configs[ENV] || configs.dev || {};
  return {
    host: process.env.DB_HOST || fallback.host,
    port: Number(process.env.DB_PORT || fallback.port || 3306),
    user: process.env.DB_USER || fallback.username,
    password: process.env.DB_PASSWORD || fallback.password,
    database: process.env.DB_NAME || fallback.database,
  };
}

async function initDatabase() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const { host, port, user, password, database } = getDbConfig();

    if (!host || !user || !database) {
      console.warn("[DB] Création auto impossible: configuration incomplète.");
      return;
    }

    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();
  })();

  return initPromise;
}

module.exports = initDatabase;
