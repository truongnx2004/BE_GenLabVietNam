const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Feedback = sequelize.define(
  "Feedback",
  {
    Feedback_ID: { type: DataTypes.BIGINT, primaryKey: true },
    Comment: DataTypes.STRING,
    Date: DataTypes.DATE,
    Booking_ID: DataTypes.BIGINT,
  },
  {
    tableName: "FEEDBACK_AND_RATING",
    timestamps: false,
  }
);

module.exports = Feedback;
