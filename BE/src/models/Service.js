const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Service = sequelize.define(
  "Service",
  {
    Service_ID: { type: DataTypes.INTEGER, primaryKey: true },
    Service_Name: { type: DataTypes.STRING(100), allowNull: false },
    Description: { type: DataTypes.STRING(255), allowNull: true },
    Sample_Method: { type: DataTypes.STRING(100), allowNull: false },
    Estimated_Time: { type: DataTypes.STRING(50), allowNull: false },
    Price: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    Status: { 
      type: DataTypes.ENUM('on', 'off'), 
      defaultValue: 'on' 
    }
  },
  {
    tableName: "SERVICE",
    timestamps: false,
  }
);

module.exports = Service;
