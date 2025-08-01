const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Test_Result = sequelize.define("Test_Result", {
  Test_ID: { type: DataTypes.BIGINT, primaryKey: true },
  Test_Date: DataTypes.DATEONLY,
  Result: DataTypes.STRING(255),
  Booking_ID: DataTypes.BIGINT
}, {
  tableName: "Test_Result",
  timestamps: false
});

module.exports = Test_Result;