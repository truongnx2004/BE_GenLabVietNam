const db = require("../config/database");
const { QueryTypes } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- MULTER CONFIGURATION ---
const uploadDir = path.join(__dirname, "../public/results");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const bookingId = req.params.id;
    const filename = `result_${bookingId}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép tải lên file PDF!"), false);
    }
  },
}).single("resultPdf");

exports.uploadMiddleware = upload;

// --- GET ALL BOOKINGS WITH STAFF_ID ---
exports.getAllBookingsWithInfo = async (req, res) => {
  try {
    const query = `
      SELECT 
        b.Booking_ID, b.BookingDate, b.Booking_Status, b.AppointmentDate, b.AppointmentTime,
        b.ReceiveDate, b.ReceiveResult, i.Name_Information AS CustomerName,
        acc.Email, acc.UserName, tr.Result_PDF_URL,
        ks.Account_ID AS Staff_ID,
        info_staff.Name_Information AS Staff_Name,
        (
          SELECT GROUP_CONCAT(CONCAT(s.Service_name, ' (', bd.Cate_Name, ')') SEPARATOR ', ')
          FROM Booking_Details bd
          JOIN Service s ON bd.Service_ID = s.Service_ID
          WHERE bd.Booking_ID = b.Booking_ID
        ) AS Service_Names
      FROM Booking b
      JOIN Information i ON b.InformationID = i.Information_ID
      JOIN ACCOUNT acc ON i.Account_ID = acc.Account_ID
      LEFT JOIN Test_Result tr ON b.Booking_ID = tr.Booking_ID
      LEFT JOIN Booking_Details bd ON b.Booking_ID = bd.Booking_ID
      LEFT JOIN Kit_Sample ks ON bd.BD_ID = ks.BD_ID
      LEFT JOIN Account acc_staff ON ks.Account_ID = acc_staff.Account_ID
      LEFT JOIN Information info_staff ON acc_staff.Account_ID = info_staff.Account_ID
      ORDER BY b.BookingDate DESC
    `;
    const results = await db.query(query, { type: QueryTypes.SELECT });
    return res.json(results);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu booking:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


// --- UPDATE BOOKING ---
exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const {
    Booking_Status,
    AppointmentDate,
    AppointmentTime,
    ReceiveDate,
    ReceiveResult,
    Staff_ID,
    Shipping_Status // nhận thêm trường này
  } = req.body;

  try {
    // Nếu là STAFF thì phải kiểm tra quyền
    if (req.user.role === "Staff") {
      const check = await db.query(
        `
        SELECT ks.Account_ID
        FROM Kit_Sample ks
        JOIN Booking_details bd ON ks.BD_ID = bd.BD_ID
        WHERE bd.Booking_ID = ? AND ks.Account_ID = ?
        `,
        {
          replacements: [id, req.user.id],
          type: QueryTypes.SELECT,
        }
      );
      if (!check.length) {
        return res.status(403).json({
          message: "Bạn không được phép chỉnh sửa booking này.",
        });
      }
    }

    await db.query(
      `
      UPDATE Booking 
      SET Booking_Status = ?, AppointmentDate = ?, AppointmentTime = ?, ReceiveDate = ?, ReceiveResult = ?, Shipping_Status = ?
      WHERE Booking_ID = ?
      `,
      {
        replacements: [
          Booking_Status,
          AppointmentDate || null,
          AppointmentTime || null,
          ReceiveDate || null,
          ReceiveResult || null,
          Shipping_Status || null,
          id,
        ],
        type: QueryTypes.UPDATE,
      }
    );

    // Nếu là Manager và có Staff_ID, cập nhật lại Account_ID của Kit_Sample
    if (req.user.role === "Manager" && Staff_ID) {
      await db.query(
        `UPDATE Kit_Sample ks
         JOIN Booking_details bd ON ks.BD_ID = bd.BD_ID
         SET ks.Account_ID = ?
         WHERE bd.Booking_ID = ?`,
        {
          replacements: [Staff_ID, id],
          type: QueryTypes.UPDATE,
        }
      );
    }

    res.json({ message: "Cập nhật booking thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật booking:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// --- UPLOAD RESULT PDF ---
exports.uploadTestResult = async (req, res) => {
  const bookingId = req.params.id;

  if (!req.file) {
    return res.status(400).json({
      message: "Không có file được tải lên hoặc định dạng không đúng.",
    });
  }

  const pdfUrl = `/results/${req.file.filename}`;
  const testDate = new Date().toISOString().slice(0, 10);

  try {
    const existingResult = await db.query(
      `SELECT * FROM Test_Result WHERE Booking_ID = ?`,
      { replacements: [bookingId], type: QueryTypes.SELECT }
    );

    if (existingResult.length > 0) {
      await db.query(
        `UPDATE Test_Result SET Result_PDF_URL = ?, Test_Date = ? WHERE Booking_ID = ?`,
        {
          replacements: [pdfUrl, testDate, bookingId],
          type: QueryTypes.UPDATE,
        }
      );
    } else {
      const defaultResultText = "Kết quả được đính kèm trong file PDF.";
      await db.query(
        `INSERT INTO Test_Result (Test_Date, Result, Result_PDF_URL, Booking_ID) VALUES (?, ?, ?, ?)`,
        {
          replacements: [testDate, defaultResultText, pdfUrl, bookingId],
          type: QueryTypes.INSERT,
        }
      );
    }

    await db.query(
      `UPDATE Booking SET Booking_Status = 'Hoàn tất' WHERE Booking_ID = ?`,
      { replacements: [bookingId], type: QueryTypes.UPDATE }
    );

    res.json({
      message: "Tải lên kết quả và cập nhật trạng thái thành công.",
      pdfUrl: pdfUrl,
    });
  } catch (error) {
    console.error("===== DATABASE ERROR DETAILS =====");
    console.error(error);
    console.error("==================================");

    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Lỗi khi xóa file sau khi DB fail:", unlinkErr);
      }
    }
    res.status(500).json({
      message: "Lỗi server khi cập nhật database",
      error: error.message,
    });
  }
};
