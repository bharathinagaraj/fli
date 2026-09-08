const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");

// Registered store customers — who signed up and bought things.
// Kept fully separate from the staff `User` table (backend/admin login).
const Customer = sequelize.define(
  "Customer",
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "customers",
    hooks: {
      beforeCreate: async (customer) => {
        customer.password = await bcrypt.hash(customer.password, 10);
      },
      beforeUpdate: async (customer) => {
        if (customer.changed("password")) {
          customer.password = await bcrypt.hash(customer.password, 10);
        }
      },
    },
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: { attributes: {} },
    },
  }
);

Customer.prototype.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = Customer;
