const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Account = require("./Account");

const Information = sequelize.define(
  "Information",
  {
    InformationID: { type: DataTypes.BIGINT, primaryKey: true },
    Name_Information: DataTypes.STRING,
    Gender: DataTypes.STRING,
    Date_Of_Birth: DataTypes.DATE,
    Address: DataTypes.STRING,
    Phone: DataTypes.STRING,
    CCCD: DataTypes.STRING,
    AccountID: DataTypes.BIGINT,
  },
  {
    tableName: "INFORMATION",
    timestamps: false,
  }
);

Account.hasOne(Information, { foreignKey: "AccountID" });
Information.belongsTo(Account, { foreignKey: "AccountID" });

module.exports = Information;
