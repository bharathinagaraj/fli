// create-ecommerce.cjs — auto-creates a clean ecommerce database with 8 tables:
//   customers, categories, products, orders, order_items, guest_visits, payments, addresses
const path = require("path");
const mysql = require("mysql2/promise");

require("dotenv").config({ path: path.join(__dirname, "src", "backend", ".env") });

const DB = "ecommerce_db";
const { Sequelize, DataTypes } = require("sequelize");

async function main() {
  console.log("==============================================");
  console.log("  AUTO CREATE  ecommerce_db  (8 tables)");
  console.log("==============================================");

  // 1) Create database if missing
  console.log("\n[1] Creating database '" + DB + "'...");
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await conn.query("DROP DATABASE IF EXISTS `" + DB + "`");
  await conn.query("CREATE DATABASE `" + DB + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  await conn.end();

  // 2) Connect Sequelize to the new database
  const sequelize = new Sequelize(DB, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false,
    define: { timestamps: true, underscored: true },
  });

  // 3) Define the 8 tables (models)
  // ─── CUSTOMERS: signup + login + info + status + order history ───
  const Customer = sequelize.define("Customer", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    // Signup + login
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false }, // bcrypt-hashed
    // Customer information
    phone: { type: DataTypes.STRING, allowNull: true },
    avatar: { type: DataTypes.STRING, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
    // Login tracking
    last_login_at: { type: DataTypes.DATE, allowNull: true },
    login_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    // Customer status
    status: { type: DataTypes.ENUM("active", "blocked", "suspended"), defaultValue: "active" },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Order history summary (auto-updated when orders are placed)
    total_orders: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_spent: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  }, {
    tableName: "customers",
    defaultScope: { attributes: { exclude: ["password"] } },
    scopes: { withPassword: { attributes: {} } },
  });

  const Category = sequelize.define("Category", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    image: { type: DataTypes.STRING },
    parent_id: { type: DataTypes.UUID, allowNull: true },
  }, { tableName: "categories" });

  const Product = sequelize.define("Product", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    brand: { type: DataTypes.STRING },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    original_price: { type: DataTypes.DECIMAL(10, 2) },
    stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0 },
    images: { type: DataTypes.JSON, defaultValue: [] },
  }, { tableName: "products" });

  const Order = sequelize.define("Order", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    status: { type: DataTypes.ENUM("Processing", "Shipped", "Delivered", "Cancelled"), defaultValue: "Processing" },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    shipping_cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    payment_status: { type: DataTypes.ENUM("pending", "paid", "failed", "refunded"), defaultValue: "pending" },
    shipping_address: { type: DataTypes.JSON },
  }, { tableName: "orders" });

  const OrderItem = sequelize.define("OrderItem", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  }, { tableName: "order_items" });

  const GuestVisit = sequelize.define("GuestVisit", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    session_id: { type: DataTypes.STRING },
    ip: { type: DataTypes.STRING },
    user_agent: { type: DataTypes.TEXT },
    page: { type: DataTypes.STRING },
    visited_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: "guest_visits" });

  const Payment = sequelize.define("Payment", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    method: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM("pending", "paid", "failed", "refunded"), defaultValue: "pending" },
    transaction_id: { type: DataTypes.STRING },
    paid_at: { type: DataTypes.DATE },
  }, { tableName: "payments" });

  const Address = sequelize.define("Address", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    label: { type: DataTypes.STRING, defaultValue: "Home" },
    full_name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    street: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING },
    zip: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING, defaultValue: "India" },
    is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { tableName: "addresses" });

  // 4) Relationships (foreign keys)
  Category.hasMany(Category, { as: "subcategories", foreignKey: "parent_id" });
  Category.belongsTo(Category, { as: "parent", foreignKey: "parent_id" });

  Category.hasMany(Product, { foreignKey: "category_id" });
  Product.belongsTo(Category, { foreignKey: "category_id" });

  Customer.hasMany(Order, { foreignKey: "customer_id" });
  Order.belongsTo(Customer, { foreignKey: "customer_id" });

  Customer.hasMany(Address, { foreignKey: "customer_id", onDelete: "CASCADE" });
  Address.belongsTo(Customer, { foreignKey: "customer_id" });

  Order.hasMany(OrderItem, { foreignKey: "order_id", onDelete: "CASCADE" });
  OrderItem.belongsTo(Order, { foreignKey: "order_id" });

  Product.hasMany(OrderItem, { foreignKey: "product_id" });
  OrderItem.belongsTo(Product, { foreignKey: "product_id" });

  Order.hasMany(Payment, { foreignKey: "order_id" });
  Payment.belongsTo(Order, { foreignKey: "order_id" });

  // 5) Auto-create all 8 tables
  console.log("[2] Auto-creating all 8 tables with Sequelize...");
  await sequelize.sync();
  console.log("    -> tables created");

  // 6) Show created tables + columns + row counts
  console.log("[3] Created tables:");
  const [tables] = await sequelize.query(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = '" + DB + "' ORDER BY TABLE_NAME"
  );
  for (const t of tables) {
    const name = t.TABLE_NAME;
    const [cols] = await sequelize.query("SHOW COLUMNS FROM `" + name + "`");
    const [cnt] = await sequelize.query("SELECT COUNT(*) AS c FROM `" + name + "`");
    console.log("   ✔ " + name + "  (" + cols.length + " columns, " + cnt[0].c + " rows)");
  }

  await sequelize.close();
  console.log("\n✅ DONE — " + DB + " created with " + tables.length + " tables!");
  console.log("   customers, categories, products, orders, order_items, guest_visits, payments, addresses");
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
