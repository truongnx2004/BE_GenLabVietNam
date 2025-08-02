const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sample = sequelize.define(
  "Sample",
  {
    Sample_ID: { type: DataTypes.BIGINT, primaryKey: true },
    Sample_Name: DataTypes.STRING,
    Received_At_Lab_Date: DataTypes.DATE,
    Collection_Date: DataTypes.DATE,
    Booking_ID: DataTypes.BIGINT,
    Kitdelivery_ID: DataTypes.BIGINT,
    AccountID: DataTypes.BIGINT,
  },
  {
    tableName: "SAMPLE",
    timestamps: false,
  }
);

module.exports = Sample;
