const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const GuestVisit = sequelize.define(
  "GuestVisit",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionId: {
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
    page: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    visitedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "guest_visits",
    indexes: [{ fields: ["session_id"] }, { fields: ["visited_at"] }],
  }
);

module.exports = GuestVisit;
