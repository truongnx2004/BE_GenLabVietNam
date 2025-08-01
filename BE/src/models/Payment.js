const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define("Payment", {
  PM_ID: { type: DataTypes.BIGINT, primaryKey: true },
  Transaction_no: DataTypes.INTEGER,
  PM_Refund: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: "Payment",
  timestamps: false
});

module.exports = Payment;