const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // one active cart per customer
    },
  },
  {
    tableName: "carts",
  }
);

module.exports = Cart;