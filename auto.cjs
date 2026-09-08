// One-command auto setup: create database -> auto-create all tables -> seed demo data (only if empty)
const path = require("path");
const { execSync } = require("child_process");
const mysql = require("mysql2/promise");

require("dotenv").config({ path: path.join(__dirname, "src", "backend", ".env") });

const ROOT = __dirname;

async function main() {
  console.log("[1/3] Creating database if it does not exist...");
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.end();
  console.log(`      Database "${process.env.DB_NAME}" ready.`);

  console.log("[2/3] Auto-creating all tables with Sequelize...");
  const { sequelize } = require("./src/backend/config/database");
  require("./src/backend/models");
  await sequelize.sync();
  const { Product } = require("./src/backend/models");
  const count = await Product.count();

  if (count > 0) {
    console.log(`      ${count} products already present — skipping seed.`);
  } else {
    console.log("[3/3] Empty database — seeding demo data (422 products, demo users)...");
    execSync("node src/backend/seed.js", { stdio: "inherit", cwd: ROOT });
  }

  await sequelize.close();
  console.log("\n✅ Setup complete. Run the servers now.");
}

main().catch((err) => {
  console.error("❌ Auto setup failed:", err.message);
  process.exit(1);
});
