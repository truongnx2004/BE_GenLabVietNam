const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BookingCancel = sequelize.define(
  "BookingCancel",
  {
    Cancel_ID: { type: DataTypes.BIGINT, primaryKey: true },
    Note: DataTypes.STRING,
    Total_Refund: DataTypes.DECIMAL(18, 2),
    InformationID: DataTypes.BIGINT,
    Booking_ID: DataTypes.BIGINT,
  },
  {
    tableName: "BOOKING_CANCEL",
    timestamps: false,
  }
);

module.exports = BookingCancel;
