const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Booking_details = sequelize.define("Booking_details", {
  BD_ID: { type: DataTypes.BIGINT, primaryKey: true },
  Quantity: DataTypes.INTEGER,
  Cate_Name: DataTypes.STRING(200),
  Comment: DataTypes.STRING(255),
  Rate: DataTypes.DECIMAL(2, 1),
  IsCommented: { type: DataTypes.BOOLEAN, defaultValue: false },
  Service_ID: DataTypes.INTEGER,
  Booking_ID: DataTypes.BIGINT
}, {
  tableName: "Booking_details",
  timestamps: false
});

// 🟢 Thiết lập quan hệ
const Service = require("./Service");
Booking_details.belongsTo(Service, {foreignKey: "Service_ID",});

const Booking = require("./Booking");
Booking_details.belongsTo(Booking, { foreignKey: "Booking_ID" });
      
module.exports = Booking_details;
