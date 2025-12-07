const { Sequelize } = require("sequelize");
const ENV = process.env.ENV || "dev";
const allConfigs = require("./config");

// Build Sequelize instance depending on environment
function createSequelize() {
  // 1) If a DATABASE_URL is provided, prefer it (useful for managed services)
  const connectionUrl = process.env.DATABASE_URL;
  if (connectionUrl) {
    return new Sequelize(connectionUrl, {
      dialect: "mysql",
      logging: false,
    });
  }

  // 2) Otherwise, if discrete env vars are present, use them
  const host = process.env.DB_HOST;
  const username = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = Number(process.env.DB_PORT || 3306);

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

  // 3) Fallback: use config helper for development/testing defaults
  const cfg = allConfigs[ENV] || allConfigs.dev;
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
