const db = require('../config/database');
const { QueryTypes } = require('sequelize');
const nodemailer = require('nodemailer');

//Create
exports.createBooking = async (req, res) => {
    const {
        email,
        name,
        phone,
        address,
        appointmentDate,
        appointmentHour,
        receiveDate,
        receiveResult,
        serviceName,
        service_ID,
        cateName,
        note
    } = req.body;

    try {
        // Debug log input
        console.log('==[DEBUG] Booking input==', { email, serviceName, service_ID, cateName, name, phone, address });
        if (!email || (!serviceName && !service_ID) || !cateName) {
            console.warn('==[DEBUG] Thiếu trường:', { email, serviceName, service_ID, cateName });
            return res.status(400).json({ message: "Thiếu email, serviceName/service_ID hoặc cateName." });
        }

        // 🔍 Lấy Account_ID và Information_ID
        const infoRows = await db.query(
            `SELECT ACCOUNT.Account_ID, INFORMATION.Information_ID 
             FROM ACCOUNT 
             JOIN INFORMATION ON ACCOUNT.Account_ID = INFORMATION.Account_ID 
             WHERE ACCOUNT.Email = ?`,
            {
                replacements: [email],
                type: QueryTypes.SELECT
            }
        );

        if (infoRows.length === 0) {
            console.warn('==[DEBUG] Không tìm thấy thông tin người dùng với email:', email);
            return res.status(404).json({ message: "Không tìm thấy thông tin người dùng." });
        }

        const { Account_ID, Information_ID } = infoRows[0];

        // ✅ Cập nhật lại thông tin user
        await db.query(
            `UPDATE INFORMATION 
             SET Name_Information = ?, Phone = ?, Address = ?
             WHERE Information_ID = ?`,
            {
                replacements: [name || null, phone || null, address || null, Information_ID],
                type: QueryTypes.UPDATE
            }
        );

        // 🔍 Lấy Service_ID và Service_name
        let serviceId = service_ID;
        let serviceNameFinal = serviceName;
        let price = null;
        if (serviceId) {
            // Nếu có service_ID, lấy serviceName và price từ DB
            const [serviceRow] = await db.query(
                `SELECT Service_ID, Service_name, Price FROM SERVICE WHERE Service_ID = ?`,
                {
                    replacements: [serviceId],
                    type: QueryTypes.SELECT
                }
            );
        if (!serviceRow) {
            console.warn('==[DEBUG] service_ID không hợp lệ:', serviceId);
            return res.status(400).json({ message: "service_ID không hợp lệ." });
        }
            serviceNameFinal = serviceRow.Service_name;
            price = parseInt(serviceRow.Price);
        } else {
            // Nếu không có service_ID, lấy như cũ từ serviceName
            const [serviceRow] = await db.query(
                `SELECT Service_ID, Service_name, Price FROM SERVICE WHERE Service_name = ?`,
                {
                    replacements: [serviceName],
                    type: QueryTypes.SELECT
                }
            );
        if (!serviceRow) {
            console.warn('==[DEBUG] serviceName không hợp lệ:', serviceName);
            return res.status(400).json({ message: "Tên dịch vụ không hợp lệ." });
        }
            serviceId = serviceRow.Service_ID;
            serviceNameFinal = serviceRow.Service_name;
            price = parseInt(serviceRow.Price);
        }

        // 🔍 Lấy Category_ID
        const [cateRow] = await db.query(
            `SELECT Category_ID FROM CATEGORY WHERE Cate_name = ?`,
            {
                replacements: [cateName],
                type: QueryTypes.SELECT
            }
        );
        if (!cateRow) {
            console.warn('==[DEBUG] cateName không hợp lệ:', cateName);
            return res.status(400).json({ message: "Loại xét nghiệm không hợp lệ." });
        }
        const categoryId = cateRow.Category_ID;



        // ✅ Kiểm tra đã có Booking_ID cho user này chưa (chỉ trạng thái Chờ xác nhận)
        let bookingId = null;
        const [existingBooking] = await db.query(
            `SELECT Booking_ID FROM BOOKING WHERE InformationID = ? AND Booking_Status = 'Chờ xác nhận' ORDER BY Booking_ID DESC LIMIT 1`,
            {
                replacements: [Information_ID],
                type: QueryTypes.SELECT
            }
        );

        if (existingBooking && existingBooking.Booking_ID) {
            bookingId = existingBooking.Booking_ID;
        } else {
            // Nếu chưa có, tạo mới Booking
            const today = new Date().toISOString().split("T")[0];
            const [bookingResult, bookingMeta] = await db.query(
                `INSERT INTO BOOKING 
                    (BookingDate, Booking_Status, AppointmentDate, AppointmentTime, ReceiveDate, ReceiveResult, InformationID)
                 VALUES 
                    (?, 'Chờ xác nhận', ?, ?, ?, ?, ?)`,
                {
                    replacements: [
                        today,
                        appointmentDate || null,
                        appointmentHour || null,
                        receiveDate || null,
                        receiveResult || null,
                        Information_ID
                    ],
                    type: QueryTypes.INSERT
                }
            );
            bookingId = bookingMeta && bookingMeta.insertId ? bookingMeta.insertId : bookingResult;
        }

        // Insert vào BOOKING_DETAILS, không truyền BD_ID (auto_increment)
        await db.query(
            `INSERT INTO BOOKING_DETAILS 
                (Quantity, Cate_Name, Comment, Rate, Service_ID, Booking_ID)
             VALUES 
                (1, ?, ?, NULL, ?, ?)`,
            {
                replacements: [cateName, note || null, serviceId, bookingId],
                type: QueryTypes.INSERT
            }
        );

        return res.status(201).json({
            message: "Đặt lịch thành công",
            Booking_ID: bookingId
        });

    } catch (err) {
        console.error("Lỗi khi tạo booking:", err, err?.parent?.sqlMessage || err?.message);
        return res.status(500).json({ message: "Lỗi server", error: err?.parent?.sqlMessage || err?.message });
    }
};

// Hàm tính tổng tiền cho 1 booking_ID
// Trả về tổng tiền (number) hoặc null nếu không tìm thấy booking
exports.calculateBookingTotal = async (bookingId) => {
    try {
        if (!bookingId) {
            console.warn('[calculateBookingTotal] bookingId không hợp lệ:', bookingId);
            return null;
        }
        // Lấy tất cả các Booking_Details cho bookingId
        const details = await db.query(
            `SELECT Service_ID, Quantity FROM BOOKING_DETAILS WHERE Booking_ID = ?`,
            {
                replacements: [bookingId],
                type: QueryTypes.SELECT
            }
        );
        if (!details || details.length === 0) return null;

        let total = 0;
        for (const detail of details) {
            if (!detail.Service_ID) {
                console.warn('[calculateBookingTotal] Service_ID không hợp lệ trong detail:', detail);
                continue;
            }
            // Lấy giá của service
            const [service] = await db.query(
                `SELECT Price FROM SERVICE WHERE Service_ID = ?`,
                {
                    replacements: [detail.Service_ID],
                    type: QueryTypes.SELECT
                }
            );
            if (!service) {
                console.warn('[calculateBookingTotal] Không tìm thấy service với ID:', detail.Service_ID);
                continue;
            }
            const price = parseInt(service.Price) || 0;
            const quantity = parseInt(detail.Quantity) || 1;
            total += price * quantity;
        }
        return total;
    } catch (err) {
        console.error('Lỗi khi tính tổng tiền booking:', err);
        return null;
    }
};

// 1. Lấy tất cả đơn hàng (join Account, Information, Service)
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                {
                    model: Account,
                    attributes: ["Account_ID", "UserName", "Email", "Role"],
                    include: [{ model: Information }],
                },
                {
                    model: Service,
                    attributes: ["Service_ID", "Service_Name", "Price"],
                },
            ],
        });
        res.json(bookings);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Lỗi lấy danh sách đơn hàng", error: err.message });
    }
};

// 2. Lấy chi tiết 1 đơn hàng
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [
                {
                    model: Account,
                    attributes: ["Account_ID", "UserName", "Email", "Role"],
                    include: [{ model: Information }],
                },
                {
                    model: Service,
                    attributes: ["Service_ID", "Service_Name", "Price"],
                },
            ],
        });
        if (!booking)
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy đơn hàng", error: err.message });
    }
};

// 4. Sửa đơn hàng
exports.updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking)
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        await booking.update(req.body);
        res.json(booking);
    } catch (err) {
        res 
            .status(500)
            .json({ message: "Lỗi cập nhật đơn hàng", error: err.message });
    }
};

// 6. API lấy giá tiền đơn hàng
exports.getBookingPrice = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking)
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        res.json({ price: booking.Money });
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy giá tiền", error: err.message });
    }
};

