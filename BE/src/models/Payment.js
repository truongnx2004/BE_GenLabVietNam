const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define(
  "Payment",
  {
    PM_ID: { type: DataTypes.BIGINT, primaryKey: true },
    Amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    Type: { type: DataTypes.STRING(50), allowNull: false },
    Payment_Date: { type: DataTypes.DATE, allowNull: false },
    Status: { 
      type: DataTypes.ENUM("Chờ xác nhận", "Đã thanh toán", "Thất bại"), 
      defaultValue: "Chờ xác nhận" 
    }
  },
  {
    tableName: "PAYMENT",
    timestamps: false,
  }
);

module.exports = Payment;
