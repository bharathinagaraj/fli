const { sequelize } = require("../config/database");

const User = require("./User");
const Customer = require("./Customer");
const Category = require("./Category");
const Product = require("./Product");
const Address = require("./Address");
const Cart = require("./Cart");
const CartItem = require("./CartItem");
const Wishlist = require("./Wishlist");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Review = require("./Review");
const Return = require("./Return");
const LoginLog = require("./LoginLog");
const GuestVisit = require("./GuestVisit");
const SignupLog = require("./SignupLog");

// ─── Customer associations (customers own all storefront data) ──
Customer.hasOne(Cart, { foreignKey: "customerId", onDelete: "CASCADE" });
Cart.belongsTo(Customer, { foreignKey: "customerId" });

Customer.hasMany(Address, { foreignKey: "customerId", onDelete: "CASCADE" });
Address.belongsTo(Customer, { foreignKey: "customerId" });

Customer.hasMany(Order, { foreignKey: "customerId" });
Order.belongsTo(Customer, { foreignKey: "customerId" });

Customer.hasMany(Wishlist, { foreignKey: "customerId", onDelete: "CASCADE" });
Wishlist.belongsTo(Customer, { foreignKey: "customerId" });

Customer.hasMany(Review, { foreignKey: "customerId" });
Review.belongsTo(Customer, { foreignKey: "customerId" });

// ─── Category associations (self-referencing for subcategories) ──
Category.hasMany(Category, { as: "subcategories", foreignKey: "parentId" });
Category.belongsTo(Category, { as: "parent", foreignKey: "parentId" });

Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

// ─── Product associations ────────────────────────────
Product.hasMany(CartItem, { foreignKey: "productId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(Wishlist, { foreignKey: "productId", onDelete: "CASCADE" });
Wishlist.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(Review, { foreignKey: "productId", onDelete: "CASCADE" });
Review.belongsTo(Product, { foreignKey: "productId" });

// ─── Cart associations ────────────────────────────────
Cart.hasMany(CartItem, { foreignKey: "cartId", onDelete: "CASCADE" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

// ─── Order associations ───────────────────────────────
Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// ─── Return associations ────────────────────────────────
Order.hasMany(Return, { foreignKey: "orderId", onDelete: "CASCADE" });
Return.belongsTo(Order, { foreignKey: "orderId" });

Customer.hasMany(Return, { foreignKey: "customerId", onDelete: "CASCADE" });
Return.belongsTo(Customer, { foreignKey: "customerId" });

Product.hasMany(Return, { foreignKey: "productId" });
Return.belongsTo(Product, { foreignKey: "productId" });

// ─── Login / signup tracking associations ────────────────────────────────
Customer.hasMany(LoginLog, { foreignKey: "customerId", onDelete: "CASCADE" });
LoginLog.belongsTo(Customer, { foreignKey: "customerId" });

Customer.hasMany(SignupLog, { foreignKey: "customerId", onDelete: "CASCADE" });
SignupLog.belongsTo(Customer, { foreignKey: "customerId" });

// ─── Many-to-many convenience (Customer <-> Product via Wishlist) ────
Customer.belongsToMany(Product, { through: Wishlist, foreignKey: "customerId" });
Product.belongsToMany(Customer, { through: Wishlist, foreignKey: "productId" });

module.exports = {
  sequelize,
  User,
  Customer,
  Category,
  Product,
  Address,
  Cart,
  CartItem,
  Wishlist,
  Order,
  OrderItem,
  Review,
  Return,
  LoginLog,
  GuestVisit,
  SignupLog,
};
