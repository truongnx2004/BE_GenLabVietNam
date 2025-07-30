const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Account = sequelize.define(
  "Account",
  {
    AccountID: { type: DataTypes.BIGINT, primaryKey: true },
    UserName: { type: DataTypes.STRING(100), allowNull: false },
    Password: { type: DataTypes.STRING(100), allowNull: false },
    Email: { type: DataTypes.STRING(100), allowNull: false },
    Role: { type: DataTypes.STRING(50), allowNull: false },
    Status: { 
      type: DataTypes.ENUM('on', 'off'), 
      defaultValue: 'on' 
    }
  },
  {
    tableName: "ACCOUNT",
    timestamps: false,
  }
);

module.exports = Account;
