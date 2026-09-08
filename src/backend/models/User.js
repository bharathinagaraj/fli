const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");

// Staff / admin backend logins — deliberately separate from customers.
// Customers live in the `customers` table (Customer model); this table holds
// only people who manage the store from the admin dashboard.
const User = sequelize.define(
  "User",
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
    role: {
      type: DataTypes.ENUM("admin", "staff"),
      defaultValue: "staff",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
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

User.prototype.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
