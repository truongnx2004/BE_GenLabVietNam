const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Reason = sequelize.define(
  "Reason",
  {
    RS_ID: { type: DataTypes.BIGINT, primaryKey: true },
    Content: DataTypes.STRING,
    Cancel_ID: DataTypes.BIGINT,
  },
  {
    tableName: "REASON",
    timestamps: false,
  }
);

module.exports = Reason;
