const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Kit_delivery = sequelize.define("Kit_delivery", {
  Kitdelivery_ID: { type: DataTypes.BIGINT, primaryKey: true },
  Send_Date: DataTypes.DATEONLY,
  Receive_Date: DataTypes.DATEONLY,
  Status: { type: DataTypes.ENUM("ON", "OFF"), defaultValue: "OFF" },
  BD_ID: DataTypes.BIGINT
}, {
  tableName: "Kit_delivery",
  timestamps: false
});

module.exports = Kit_delivery;