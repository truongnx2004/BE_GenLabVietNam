const db = require("../config/database");
const { QueryTypes } = require("sequelize");

// 1. Lấy tất cả Kit_Sample
exports.getAllKits = async (req, res) => {
  try {
    const query = `
      SELECT 
        ks.Kit_ID,
        ks.Send_Date,
        ks.Receive_Date,
        ks.Status,
        ks.Sample_Method,
        ks.Sample_Status,
        ks.Sample_Owner,
        ks.BD_ID,
        bd.Booking_ID,
        ks.Account_ID,
        info.Name_Information AS StaffName
      FROM Kit_Sample ks
      JOIN Booking_details bd ON ks.BD_ID = bd.BD_ID
      JOIN Booking b ON bd.Booking_ID = b.Booking_ID
      JOIN ACCOUNT acc ON ks.Account_ID = acc.Account_ID
      JOIN INFORMATION info ON acc.Account_ID = info.Account_ID
      ORDER BY ks.Send_Date DESC
    `;

    const results = await db.query(query, { type: QueryTypes.SELECT });
    res.json(results);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách Kit:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Hàm lấy staff tiếp theo (gán luân phiên)
  async function getNextStaff() {
  const [staff] = await db.sequelize.query(
    `SELECT acc.Account_ID
     FROM ACCOUNT acc
     LEFT JOIN Staff_Assign_Log sal ON acc.Account_ID = sal.Staff_ID
     WHERE acc.Role = 'Staff' AND acc.Status = 'ON'
     ORDER BY sal.Last_Assigned IS NULL DESC, sal.Last_Assigned ASC, acc.Account_ID ASC
     LIMIT 1`,
    { type: QueryTypes.SELECT }
  );

  if (!staff) throw new Error("Không tìm thấy nhân viên phù hợp");

  await db.sequelize.query(
    `INSERT INTO Staff_Assign_Log (Staff_ID, Last_Assigned)
     VALUES (?, NOW())
     ON DUPLICATE KEY UPDATE Last_Assigned = NOW()`,
    {
      replacements: [staff.Account_ID],
      type: QueryTypes.INSERT
    }
  );

  return staff.Account_ID;
  }



// 2. Tạo Kit_Sample mới
exports.createKit = async (req, res) => {
  const { BD_ID, Send_Date, Receive_Date, Sample_Method, Status, Sample_Status, Sample_Owner } = req.body;

  if (!BD_ID) return res.status(400).json({ message: "Thiếu BD_ID" });

  try {
    const assignedStaffID = await getNextStaff(); // gọi logic luân phiên

    await db.query(
      `INSERT INTO Kit_Sample 
        (Send_Date, Receive_Date, Sample_Method, Status, Sample_Status, Sample_Owner, BD_ID, Account_ID) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          Send_Date || null,
          Receive_Date || null,
          Sample_Method || null,
          Status || 'OFF',
          Sample_Status || null,
          Sample_Owner || null,
          BD_ID,
          assignedStaffID
        ],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: "Tạo Kit thành công", AssignedStaffID: assignedStaffID });
  } catch (error) {
    console.error("Lỗi khi tạo Kit:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 3. Cập nhật Kit_Sample
exports.updateKit = async (req, res) => {
  const { id } = req.params; // Kit_ID
  const {
    Send_Date,
    Receive_Date,
    Status,
    Sample_Status,
    Sample_Method,
    Sample_Owner
  } = req.body;

  try {
    await db.query(
      `UPDATE Kit_Sample 
       SET Send_Date = ?, Receive_Date = ?, Status = ?, Sample_Status = ?, Sample_Method = ?, Sample_Owner = ?
       WHERE Kit_ID = ?`,
      {
        replacements: [
          Send_Date || null,
          Receive_Date || null,
          Status || "OFF",
          Sample_Status || null,
          Sample_Method || null,
          Sample_Owner || null,
          id
        ],
        type: QueryTypes.UPDATE
      }
    );

    res.json({ message: "Cập nhật Kit thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật Kit:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 4. Lấy danh sách BD_ID, Booking_ID và Account_ID cho dropdown khi tạo mới Kit
exports.getBookingWithStatus = async (req, res) => {
  try {
    const query = `
      SELECT 
      bd.BD_ID, 
      b.Booking_ID, 
      info.Account_ID,
      info.Name_Information
      FROM Booking b
      JOIN Booking_details bd ON b.Booking_ID = bd.Booking_ID
      JOIN Information info ON b.InformationID = info.Information_ID
      WHERE TRIM(b.Booking_Status) = 'Đang gửi kit'
      `;

    const results = await db.query(query, { type: QueryTypes.SELECT });
    res.json(results);
  } catch (error) {
    console.error("Lỗi lấy danh sách booking đang gửi kit:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

