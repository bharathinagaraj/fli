const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // e.g. ORD-1001
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
      ),
      defaultValue: "Processing",
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shippingAddress: {
      type: DataTypes.JSON, // snapshot of address at time of order
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING, // e.g. "Visa ending in 4242"
      allowNull: true,
    },
    paymentDetails: {
      type: DataTypes.JSON, // structured details e.g. UPI app / txn id / card last4
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },
    shippedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    hooks: {
      beforeValidate: (order) => {
        if (!order.orderNumber) {
          order.orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
        }
      },
    },
  }
);

module.exports = Order;