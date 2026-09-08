const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Address = sequelize.define(
  "Address",
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
    label: {
      type: DataTypes.STRING, // e.g. "Home", "Office"
      defaultValue: "Home",
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "US",
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "addresses",
  }
);

module.exports = Address;