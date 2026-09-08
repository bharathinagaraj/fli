// create-tables.cjs — ONE command creates ALL tables automatically with Sequelize:
// users, login_logs, signup_logs, guest_visits (visitors), categories, products,
// carts, cart_items, wishlists, orders, order_items, reviews, addresses, returns
const path = require("path");
const mysql = require("mysql2/promise");

// 1) Load DB config from backend .env
require("dotenv").config({ path: path.join(__dirname, "src", "backend", ".env") });

async function main() {
  console.log("==============================================");
  console.log("  AUTO CREATE ALL TABLES (Sequelize)");
  console.log("==============================================");

  // 2) Create the database if it does not exist yet
  console.log("\n[1] Creating database '" + process.env.DB_NAME + "' if missing...");
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await conn.query(
    "CREATE DATABASE IF NOT EXISTS `" + process.env.DB_NAME +
      "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
  );
  await conn.end();
  console.log("    -> database ready");

  // 3) Register every model (defines each table)
  console.log("[2] Loading all Sequelize models...");
  const { sequelize } = require("./src/backend/config/database");
  const models = require("./src/backend/models");
  const names = Object.keys(models).filter((k) => k !== "sequelize");
  console.log("    -> models: " + names.join(", "));

  // 4) Auto-create every table (sequelize.sync)
  console.log("[3] Auto-creating all tables...");
  await sequelize.sync();
  console.log("    -> sync done");

  // 5) Show every created table + its columns
  console.log("[4] Created tables:");
  const [tables] = await sequelize.query(
    "SELECT TABLE_NAME FROM information_schema.TABLES " +
      "WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME"
  );
  for (const t of tables) {
    const name = t.TABLE_NAME;
    const [cols] = await sequelize.query("SHOW COLUMNS FROM `" + name + "`");
    const colList = cols.map((c) => c.Field).join(", ");
    console.log("   ✔ " + name + "  (" + cols.length + " columns: " + colList + ")");
  }

  await sequelize.close();
  console.log("\n✅ DONE — all tables created automatically!");
  console.log("   Database: " + process.env.DB_NAME + " | Tables: " + tables.length);
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
