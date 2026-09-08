const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || "mysql",
    timezone: "+05:30",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,        // max connections in pool
      min: 0,          // min connections kept alive
      acquire: 30000,  // max time (ms) to try getting a connection before erroring
      idle: 10000,     // max time (ms) a connection can be idle before being released
    },
    define: {
      timestamps: true,   // adds createdAt/updatedAt to all models
      underscored: true,  // uses snake_case column names (created_at, updated_at)
    },
  }
);

// Test the connection immediately on import
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };