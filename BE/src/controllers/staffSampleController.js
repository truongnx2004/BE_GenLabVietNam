const db = require('../config/database');
const { QueryTypes } = require('sequelize');

// GET - Lấy tất cả mẫu (kèm thông tin chủ sở hữu và booking)
const getAllSamplesWithInfo = async (req, res) => {
    try {
        const results = await db.query(
            `SELECT s.*, i.Name_Information, b.BookingDate, b.Status AS BookingStatus
             FROM SAMPLE s
             JOIN INFORMATION i ON s.AccountID = i.AccountID
             JOIN BOOKING b ON s.Booking_ID = b.Booking_ID`,
            { type: QueryTypes.SELECT }
        );
        return res.json(results);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu mẫu:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// PUT - Cập nhật mẫu (chỉ cho phép cập nhật các trường được phép sửa)
const updateSample = async (req, res) => {
    const sampleId = req.params.id;
    const {
        Sample_Name = null,
        Received_At_Lab_Date = null,
        Collection_Date = null,
        Kitdelivery_ID = null
    } = req.body;

    try {
        await db.query(
            `UPDATE SAMPLE SET 
                Sample_Name = ?, 
                Received_At_Lab_Date = ?, 
                Collection_Date = ?, 
                Kitdelivery_ID = ?
             WHERE Sample_ID = ?`,
            {
                replacements: [
                    Sample_Name,
                    Received_At_Lab_Date,
                    Collection_Date,
                    Kitdelivery_ID,
                    sampleId
                ],
                type: QueryTypes.UPDATE
            }
        );

        res.json({ message: "Cập nhật mẫu thành công" });
    } catch (error) {
        console.error("Lỗi khi cập nhật mẫu:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    getAllSamplesWithInfo,
    updateSample
};
