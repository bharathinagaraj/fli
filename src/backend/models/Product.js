const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON, // array of image URLs
      defaultValue: [],
    },
    variants: {
      type: DataTypes.JSON, // e.g. ["Black", "White", "Blue"]
      defaultValue: [],
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("Active", "Out of Stock", "Inactive", "Missing Images"),
      defaultValue: "Active",
    },
    inStock: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue("stockQuantity") > 0;
      },
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "products",
    indexes: [{ fields: ["name"] }, { fields: ["brand"] }],
  }
);

module.exports = Product;