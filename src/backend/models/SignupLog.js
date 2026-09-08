const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SignupLog = sequelize.define(
  "SignupLog",
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
    signedUpAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "signup_logs",
    indexes: [{ fields: ["customer_id"] }, { fields: ["signed_up_at"] }],
  }
);

module.exports = SignupLog;
