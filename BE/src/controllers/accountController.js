const Account = require("../models/Account");
const Information = require("../models/Information");
const { Op } = require("sequelize");

exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll({
      include: [{ model: Information, as: "INFORMATION" }],
    });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách tài khoản" });
  }
};

exports.createAccount = async (req, res) => {
  const {
    username,
    password,
    email,
    role = "Customer", // mặc định nếu không truyền
    status = "on",
    name,
    gender,
    dob,
    address,
    phone,
    cccd,
  } = req.body;

  const validRoles = ["Customer", "Staff", "Manage", "Admin"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Vai trò không hợp lệ!" });
  }

  const accountId = Date.now();

  try {
    // Kiểm tra trùng Email hoặc Username
    const existing = await Account.findOne({
      where: {
        [Op.or]: [{ Email: email }, { UserName: username }],
      },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Email hoặc Username đã tồn tại!" });
    }

    await Account.create({
      AccountID: accountId,
      UserName: username,
      Password: password,
      Email: email,
      Role: role,
      Status: status,
    });

    await Information.create({
      InformationID: accountId + 1,
      Name_Information: name,
      Gender: gender,
      Date_Of_Birth: dob,
      Address: address,
      Phone: phone,
      CCCD: cccd,
      AccountID: accountId,
    });

    res.json({ message: "Tạo tài khoản thành công!" });
  } catch (err) {
    console.error("Lỗi tạo tài khoản:", err);
    res.status(500).json({ message: "Lỗi tạo tài khoản", error: err.message });
  }
};

exports.updateAccount = async (req, res) => {
  const { id } = req.params;
  const { username, email, role, name, gender, dob, address, phone, cccd } =
    req.body;

  try {
    await Account.update(
      { UserName: username, Email: email, Role: role },
      { where: { AccountID: id } }
    );

    await Information.update(
      {
        Name_Information: name,
        Gender: gender,
        Date_Of_Birth: dob,
        Address: address,
        Phone: phone,
        CCCD: cccd,
      },
      { where: { AccountID: id } }
    );

    res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi cập nhật thông tin", error: err.message });
  }
};

exports.deleteAccountStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await Account.update({ Status: status }, { where: { AccountID: id } });
    res.json({ message: "Cập nhật trạng thái thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
  }
};
