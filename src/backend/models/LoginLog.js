const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const LoginLog = sequelize.define(
  "LoginLog",
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
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    loginAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "login_logs",
    indexes: [{ fields: ["customer_id"] }, { fields: ["login_at"] }],
  }
);

module.exports = LoginLog;
