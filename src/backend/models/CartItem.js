const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    variant: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    priceAtAdd: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false, // snapshot price in case product price changes later
    },
  },
  {
    tableName: "cart_items",
    indexes: [{ unique: true, fields: ["cart_id", "product_id", "variant"] }],
  }
);

module.exports = CartItem;