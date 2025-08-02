const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Appointment = sequelize.define(
  "Appointment",
  {
    Appointment_ID: { type: DataTypes.BIGINT, primaryKey: true },
    Booking_ID: DataTypes.BIGINT,
    Location: DataTypes.STRING,
    ScheduledDate: DataTypes.DATE,
    Staff_ID: DataTypes.BIGINT,
  },
  {
    tableName: "APPOINTMENT",
    timestamps: false,
  }
);

module.exports = Appointment;
