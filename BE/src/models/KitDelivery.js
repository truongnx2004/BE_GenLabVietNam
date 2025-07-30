const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const KitDelivery = sequelize.define(
  "KitDelivery",
  {
    Kitdelivery_ID: { type: DataTypes.BIGINT, primaryKey: true },
    Send_Date: DataTypes.DATE,
    Receive_Date: DataTypes.DATE,
    Status: DataTypes.STRING,
    Booking_ID: DataTypes.BIGINT,
  },
  {
    tableName: "KIT_DELIVERY",
    timestamps: false,
  }
);

module.exports = KitDelivery;
