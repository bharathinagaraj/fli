const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Return = sequelize.define(
  "Return",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    issueType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "other",
    },
    returnType: {
      type: DataTypes.ENUM("refund", "exchange"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "Requested",
        "Approved",
        "Picked Up",
        "Completed",
        "Rejected"
      ),
      defaultValue: "Requested",
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "returns",
  }
);

module.exports = Return;
