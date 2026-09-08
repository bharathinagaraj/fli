const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Wishlist = sequelize.define(
  "Wishlist",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "wishlists",
    indexes: [{ unique: true, fields: ["customer_id", "product_id"] }],
  }
);

module.exports = Wishlist;