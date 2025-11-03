require("dotenv/config");

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

module.exports = {
  development: {
    username: process.env.DB_USER || process.env.MYSQL_USER || "snoroc",
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "1234",
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || "snoroc",
    host: process.env.DB_HOST || process.env.MYSQL_HOST || "127.0.0.1",
    port: toNumber(process.env.DB_PORT || process.env.MYSQL_PORT, 3306),
    dialect: "mysql",
  },
  test: {
    username: process.env.TEST_DB_USER || "root",
    password: process.env.TEST_DB_PASSWORD || null,
    database: process.env.TEST_DB_NAME || "database_test",
    host: process.env.TEST_DB_HOST || "127.0.0.1",
    port: toNumber(process.env.TEST_DB_PORT, 3306),
    dialect: "mysql",
  },
  production: {
    use_env_variable: process.env.DB_URL_ENV_KEY || "DATABASE_URL",
    dialect: "mysql",
  },
};
