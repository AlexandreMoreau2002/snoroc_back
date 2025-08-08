const { Sequelize } = require("sequelize");
const NODE_ENV = process.env.NODE_ENV || "development";
const allConfigs = require("./config.json");

// Build Sequelize instance depending on environment
function createSequelize() {
  // 1) If a DATABASE_URL (or MYSQL_URL) is provided, prefer it (useful on Railway)
  const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (connectionUrl) {
    return new Sequelize(connectionUrl, {
      dialect: "mysql",
      logging: false,
    });
  }

  // 2) Otherwise, use discrete env vars when in production (Railway exposes MYSQLHOST, MYSQLUSER, etc.)
  if (NODE_ENV === "production") {
    const host = process.env.MYSQLHOST || process.env.DB_HOST;
    const username = process.env.MYSQLUSER || process.env.DB_USER;
    const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
    const database = process.env.MYSQLDATABASE || process.env.DB_NAME;
    const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);

    if (host && username && database) {
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
  }

  // 3) Fallback: use local config file for development/testing
  const cfg = allConfigs[NODE_ENV] || allConfigs.development;
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