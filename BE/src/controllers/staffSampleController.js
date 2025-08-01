const db = require("../config/database");
const { QueryTypes } = require("sequelize");
const nodemailer = require("nodemailer");

// Lấy tất cả mẫu, kèm theo tên khách hàng và trạng thái booking
exports.getAllSamplesWithInfo = async (req, res) => {
  try {
    // Câu truy vấn này JOIN các bảng theo đúng mối quan hệ để lấy thông tin cần thiết
    const query = `
            SELECT 
                s.Sample_ID,
                s.Sample_name,
                s.Sample_Method,
                s.Collection_Date,
                s.Account_ID AS StaffAccountID, -- ID của nhân viên thu mẫu
                i.Name_Information AS CustomerName, -- Tên của khách hàng
                b.Booking_ID,
                b.BookingDate,
                b.Booking_Status
            FROM Sample s
            JOIN Kit_delivery kd ON s.Kitdelivery_ID = kd.Kitdelivery_ID
            JOIN Booking_details bd ON kd.BD_ID = bd.BD_ID
            JOIN Booking b ON bd.Booking_ID = b.Booking_ID
            JOIN Information i ON b.InformationID = i.Information_ID
            ORDER BY s.Collection_Date DESC
        `;
    const results = await db.query(query, { type: QueryTypes.SELECT });
    return res.json(results);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu mẫu:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Hàm gửi email xác nhận lịch hẹn
const sendConfirmationEmail = async (
  email,
  name,
  bookingId,
  appointmentDate,
  appointmentTime
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Lấy từ biến môi trường
      pass: process.env.EMAIL_PASS, // Lấy từ biến môi trường (App Password)
    },
  });

  const mailOptions = {
    from: `"GenLab Vietnam" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `[GenLab] Xác nhận lịch hẹn #${bookingId}`,
    html: `
            <h3>Chào ${name},</h3>
            <p>Lịch hẹn của bạn (Mã: <strong>${bookingId}</strong>) đã được <strong>xác nhận</strong>.</p>
            <p>Thời gian hẹn: <strong>${
              appointmentTime || "N/A"
            }</strong> ngày <strong>${appointmentDate || "N/A"}</strong></p>
            <p>Vui lòng chuẩn bị mẫu hoặc có mặt tại điểm hẹn đúng giờ.</p>
            <br>
            <em>Trân trọng,<br>Đội ngũ GenLab Vietnam</em>
        `,
  };
  await transporter.sendMail(mailOptions);
};

// Cập nhật thông tin mẫu và trạng thái booking liên quan
exports.updateSample = async (req, res) => {
  const { id: sampleId } = req.params;
  const {
    Sample_name,
    Sample_Method,
    Collection_Date,
    Booking_Status, // Trạng thái mới của booking
    ReceiveDate, // Ngày khách nhận kết quả (chỉ khi 'Hoàn tất')
  } = req.body;

  const t = await db.transaction();

  try {
    // 1. Lấy thông tin booking và khách hàng từ Sample ID
    const [bookingInfo] = await db.query(
      `SELECT 
                b.Booking_ID, 
                b.Booking_Status AS Previous_Status,
                b.AppointmentDate,
                b.AppointmentTime,
                acc.Email,
                i.Name_Information
             FROM Sample s
             JOIN Kit_delivery kd ON s.Kitdelivery_ID = kd.Kitdelivery_ID
             JOIN Booking_details bd ON kd.BD_ID = bd.BD_ID
             JOIN Booking b ON bd.Booking_ID = b.Booking_ID
             JOIN Information i ON b.InformationID = i.Information_ID
             JOIN ACCOUNT acc ON i.Account_ID = acc.Account_ID
             WHERE s.Sample_ID = ?`,
      { replacements: [sampleId], type: QueryTypes.SELECT, transaction: t }
    );

    if (!bookingInfo) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Không tìm thấy mẫu hoặc booking liên quan." });
    }

    const {
      Booking_ID,
      Previous_Status,
      AppointmentDate,
      AppointmentTime,
      Email,
      Name_Information,
    } = bookingInfo;

    // 2. Cập nhật bảng SAMPLE
    await db.query(
      `UPDATE Sample SET Sample_name = ?, Sample_Method = ?, Collection_Date = ? WHERE Sample_ID = ?`,
      {
        replacements: [Sample_name, Sample_Method, Collection_Date, sampleId],
        type: QueryTypes.UPDATE,
        transaction: t,
      }
    );

    // 3. Nếu có trạng thái mới, cập nhật bảng BOOKING
    if (Booking_Status) {
      await db.query(
        `UPDATE Booking SET Booking_Status = ?, ReceiveDate = ? WHERE Booking_ID = ?`,
        {
          replacements: [
            Booking_Status,
            Booking_Status === "Hoàn tất" ? ReceiveDate : null, // Chỉ set ReceiveDate khi hoàn tất
            Booking_ID,
          ],
          type: QueryTypes.UPDATE,
          transaction: t,
        }
      );

      // 4. Gửi email nếu trạng thái chuyển thành "Đã xác nhận"
      if (
        Booking_Status === "Đã xác nhận" &&
        Previous_Status !== "Đã xác nhận"
      ) {
        await sendConfirmationEmail(
          Email,
          Name_Information,
          Booking_ID,
          AppointmentDate,
          AppointmentTime
        );
      }
    }

    await t.commit();
    res.json({ message: "Cập nhật thông tin mẫu và booking thành công." });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi khi cập nhật mẫu:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
