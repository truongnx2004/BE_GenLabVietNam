const db = require('../config/database');
const { QueryTypes } = require('sequelize');

const createBooking = async (req, res) => {
    const {
        name,
        phone,
        address,
        relationshipType,
        note,
        formType,
        email,
        appointmentDate,
        appointmentHour
    } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: "Thiếu email người dùng." });
        }

        const accountRows = await db.query(
            'SELECT AccountID FROM ACCOUNT WHERE Email = ?',
            {
                replacements: [email],
                type: QueryTypes.SELECT
            }
        );

        if (accountRows.length === 0) {
            return res.status(404).json({ message: "Tài khoản không tồn tại." });
        }

        const accountId = accountRows[0].AccountID;

        let serviceId;
        switch (formType) {
            case 'MedicalFacility': serviceId = 1; break;
            case 'SendSampling': serviceId = 2; break;
            case 'HomeSampling': serviceId = 3; break;
            case 'AdminFacility': serviceId = 4; break;
            default: return res.status(400).json({ message: 'Loại form không hợp lệ' });
        }

        const serviceRows = await db.query(
            'SELECT Price FROM SERVICE WHERE Service_ID = ?',
            {
                replacements: [serviceId],
                type: QueryTypes.SELECT
            }
        );

        if (serviceRows.length === 0) {
            return res.status(400).json({ message: 'Dịch vụ không hợp lệ' });
        }

        const price = serviceRows[0].Price;

        if (serviceId === 3) {
            if (!appointmentDate || !appointmentHour) {
                return res.status(400).json({ message: 'Vui lòng chọn ngày và giờ hẹn.' });
            }

            const [countRow] = await db.query(
                `SELECT COUNT(*) AS total FROM BOOKING 
                 WHERE AppointmentDate = ? AND AppointmentTime = ? AND Service_ID = 3`,
                {
                    replacements: [appointmentDate, appointmentHour],
                    type: QueryTypes.SELECT
                }
            );

            if (countRow.total >= 3) {
                return res.status(400).json({ message: 'Khung giờ này đã đủ người.' });
            }
        }

        if ((serviceId === 2 || serviceId === 3) && !address) {
            return res.status(400).json({ message: 'Địa chỉ là bắt buộc với dịch vụ này.' });
        }

        const today = new Date().toISOString().split('T')[0];

        // 👇 Tạo booking trước
        const [result] = await db.query(
            `INSERT INTO BOOKING 
                (BookingDate, Status, Category, Money, Phone, Address, AppointmentDate, AppointmentTime, AccountID, Service_ID)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    today,
                    'Đang xử lý',
                    relationshipType,
                    price,
                    phone || null,
                    (serviceId === 2 || serviceId === 3) ? address : null,
                    serviceId === 3 ? appointmentDate : null,
                    serviceId === 3 ? appointmentHour : null,
                    accountId,
                    serviceId
                ],
                type: QueryTypes.INSERT
            }
        );

        const bookingId = result; // nếu dùng MySQL thì đúng là insertId

        // Sau khi có bookingId, mới tạo SAMPLE
        await db.query(
            `INSERT INTO SAMPLE (Booking_ID, AccountID) VALUES (?, ?)`,
            {
                replacements: [bookingId, accountId],
                type: QueryTypes.INSERT
            }
        );

        return res.status(201).json({ message: 'Đặt lịch thành công', Booking_ID: bookingId });

    } catch (err) {
        console.error("Lỗi khi tạo booking:", err);
        return res.status(500).json({ message: "Lỗi server." });
    }
};

module.exports = {
    createBooking
};
