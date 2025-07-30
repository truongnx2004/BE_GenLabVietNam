const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Feedback = require("./Feedback");

const Rating = sequelize.define(
  "Rating",
  {
    Rate_ID: { type: DataTypes.BIGINT, primaryKey: true },
    Number: DataTypes.INTEGER,
    Feedback_ID: { type: DataTypes.BIGINT, unique: true },
  },
  {
    tableName: "RATING",
    timestamps: false,
  }
);

Rating.belongsTo(Feedback, { foreignKey: "Feedback_ID" });

module.exports = Rating;
