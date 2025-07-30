const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const TestResult = sequelize.define(
  "TestResult",
  {
    Test_ID: { type: DataTypes.BIGINT, primaryKey: true },
    Test_Date: DataTypes.DATE,
    Result: DataTypes.STRING,
    Sample_ID: DataTypes.BIGINT,
    Booking_ID: DataTypes.BIGINT,
  },
  {
    tableName: "TEST_RESULT",
    timestamps: false,
  }
);

module.exports = TestResult;
