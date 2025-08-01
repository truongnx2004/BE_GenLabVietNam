const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Booking = sequelize.define("Booking", {
  Booking_ID: { type: DataTypes.BIGINT, primaryKey: true },
  BookingDate: DataTypes.DATEONLY,
  Booking_Status: {
    type: DataTypes.ENUM(
      'Chờ xác nhận', 'Đã xác nhận', 'Đang gửi kit', 'Đã thu mẫu',
      'Đang xét nghiệm', 'Hoàn tất', 'Đang hủy', 'Đã hủy'
    ),
    defaultValue: 'Chờ xác nhận'
  },
  AppointmentTime: DataTypes.TIME,
  AppointmentDate: DataTypes.DATEONLY,
  ReceiveDate: DataTypes.DATEONLY,
  ReceiveResult: DataTypes.ENUM('Tại cơ sở', 'Gửi về địa chỉ'),
  InformationID: { type: DataTypes.BIGINT, allowNull: false },
  PM_ID: { type: DataTypes.BIGINT, allowNull: true }
}, {
  tableName: "Booking",
  timestamps: false
});

module.exports = Booking;