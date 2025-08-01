const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Booking_details = sequelize.define("Booking_details", {
  BD_ID: { type: DataTypes.BIGINT, primaryKey: true },
  Quantity: DataTypes.INTEGER,
  Cate_Name: DataTypes.STRING(200),
  Comment: DataTypes.STRING(255),
  Rate: DataTypes.DECIMAL(2,1),
  Service_ID: DataTypes.INTEGER,
  Booking_ID: DataTypes.BIGINT
}, {
  tableName: "Booking_details",
  timestamps: false
});

module.exports = Booking_details;