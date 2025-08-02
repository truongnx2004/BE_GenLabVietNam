const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Refund = sequelize.define(
  "Refund",
  {
    Cancel_ID: { type: DataTypes.BIGINT, primaryKey: true },
    InformationID: DataTypes.BIGINT,
    Booking_ID: DataTypes.BIGINT,
    Refund_Date: DataTypes.DATE,
  },
  {
    tableName: "REFUND",
    timestamps: false,
  }
);

module.exports = Refund;
