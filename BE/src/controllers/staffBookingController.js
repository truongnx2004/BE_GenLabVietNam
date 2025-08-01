const db = require("../config/database");
const { QueryTypes } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- MULTER CONFIGURATION ---
// Path này trỏ tới BE/src/public/results
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
    const filename = `result_${bookingId}_${Date.now()}${path.extname(
      file.originalname
    )}`;
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

// Lấy danh sách booking
exports.getAllBookingsWithInfo = async (req, res) => {
  try {
    const query = `
      SELECT 
        b.Booking_ID, b.BookingDate, b.Booking_Status, b.AppointmentDate, b.AppointmentTime,
        b.ReceiveDate, b.ReceiveResult, i.Name_Information AS CustomerName,
        acc.Email, acc.UserName, tr.Result_PDF_URL
      FROM Booking b
      JOIN Information i ON b.InformationID = i.Information_ID
      JOIN ACCOUNT acc ON i.Account_ID = acc.Account_ID
      LEFT JOIN Test_Result tr ON b.Booking_ID = tr.Booking_ID
      ORDER BY b.BookingDate DESC
    `;
    const results = await db.query(query, { type: QueryTypes.SELECT });
    return res.json(results);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu booking:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật trạng thái booking
exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const {
    Booking_Status,
    AppointmentDate,
    AppointmentTime,
    ReceiveDate,
    ReceiveResult,
  } = req.body;
  try {
    await db.query(
      `UPDATE Booking 
       SET Booking_Status = ?, AppointmentDate = ?, AppointmentTime = ?, ReceiveDate = ?, ReceiveResult = ?
       WHERE Booking_ID = ?`,
      {
        replacements: [
          Booking_Status,
          AppointmentDate || null,
          AppointmentTime || null,
          ReceiveDate || null,
          ReceiveResult || null,
          id,
        ],
        type: QueryTypes.UPDATE,
      }
    );
    res.json({ message: "Cập nhật booking thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật booking:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Upload Test Result PDF and Update Status
exports.uploadTestResult = async (req, res) => {
  const bookingId = req.params.id;

  if (!req.file) {
    return res
      .status(400)
      .json({
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
        { replacements: [pdfUrl, testDate, bookingId], type: QueryTypes.UPDATE }
      );
    } else {
      // SỬA LỖI: Thêm giá trị mặc định cho cột 'Result' để tránh lỗi
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

    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Lỗi khi xóa file sau khi DB fail:", unlinkErr);
      }
    }
    res
      .status(500)
      .json({
        message: "Lỗi server khi cập nhật database",
        error: error.message,
      });
  }
};
