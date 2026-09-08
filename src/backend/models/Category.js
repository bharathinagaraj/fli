const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Category = sequelize.define(
  "Category",
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
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true, // null = top-level category, set = subcategory
    },
  },
  {
    tableName: "categories",
  }
);

module.exports = Category;