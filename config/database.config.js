const { Sequelize } = require("sequelize");
const NODE_ENV = process.env.NODE_ENV || "dev";
const allConfigs = require("./config.json");

// Build Sequelize instance depending on environment
function createSequelize() {
  // 1) If a DATABASE_URL (or MYSQL_URL) is provided, prefer it (useful on Railway)
  const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (connectionUrl) {
    console.log(`[DB] Using connection URL from env (${NODE_ENV}).`);
    return new Sequelize(connectionUrl, {
      dialect: "mysql",
      logging: false,
    });
  }

  // 2) Otherwise, if discrete env vars are present, use them (Railway exposes MYSQLHOST, MYSQLUSER, etc.)
  const host = process.env.MYSQLHOST || process.env.DB_HOST;
  const username = process.env.MYSQLUSER || process.env.DB_USER;
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
  const database = process.env.MYSQLDATABASE || process.env.DB_NAME;
  const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);

  if (host && username && database) {
    console.log(`[DB] Using discrete env vars (${NODE_ENV}) host=${host} db=${database} port=${port}`);
    return new Sequelize({
      host,
      username,
      password,
      database,
      port,
      dialect: "mysql",
      logging: false,
    });
  }

  // 3) Fallback: use local config file for development/testing
  const cfg = allConfigs[NODE_ENV] || allConfigs.dev;
  console.log(`[DB] Using config.json profile: ${NODE_ENV} host=${cfg.host} db=${cfg.database} port=${cfg.port || 3306}`);
  return new Sequelize({
    host: cfg.host,
    username: cfg.username,
    password: cfg.password,
    database: cfg.database,
    port: Number(cfg.port || 3306),
    dialect: cfg.dialect || "mysql",
    logging: false,
  });
}

const sequelize = createSequelize();

module.exports = sequelize;