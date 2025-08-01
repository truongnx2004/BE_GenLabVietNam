const { DataTypes } = require("sequelize");
// **QUAN TRỌNG**: Hãy đảm bảo đường dẫn này trỏ đúng đến file cấu hình sequelize của bạn
const sequelize = require("../config/database");

const Information = sequelize.define(
  "Information",
  {
    Information_ID: {
      type: DataTypes.BIGINT,
      autoIncrement: true, // Báo cho Sequelize biết đây là cột tự động tăng
      primaryKey: true,
      allowNull: false,
    },
    // Khóa ngoại sẽ được liên kết thông qua associations
    Account_ID: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    Name_Information: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    Gender: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    Date_Of_Birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    Address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    CCCD: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "Information", // Tên bảng trong database
    timestamps: false, // Không tự động thêm các cột createdAt và updatedAt
  }
);

module.exports = Information;
