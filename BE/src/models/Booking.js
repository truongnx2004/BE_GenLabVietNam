const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Booking = sequelize.define(
  "Booking",
  {
    Booking_ID: { type: DataTypes.BIGINT, primaryKey: true },
    BookingDate: DataTypes.DATE,
    Status: DataTypes.STRING,
    Category: DataTypes.STRING,
    Money: DataTypes.DECIMAL(18, 2),
    AccountID: DataTypes.BIGINT,
    Service_ID: DataTypes.INTEGER,
    PM_ID: DataTypes.BIGINT,
    Kitdelivery_ID: DataTypes.BIGINT,
    Feedback_ID: DataTypes.BIGINT,
  },
  {
    tableName: "BOOKING",
    timestamps: false,
  }
);

module.exports = Booking;
