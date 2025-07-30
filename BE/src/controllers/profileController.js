const Account = require("../models/Account");
const Information = require("../models/Information");

exports.getProfile = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.accountId);
    if (!account) return res.status(404).json({ message: "Không tìm thấy tài khoản!" });

    const information = await Information.findOne({ where: { AccountID: account.AccountID } });

    res.json({
      account,
      information
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Lấy đúng tên trường FE gửi lên
    const { Name_Information, Gender, Date_Of_Birth, Address, Phone, CCCD } = req.body;
    const info = await Information.findOne({ where: { AccountID: req.params.accountId } });
    if (!info) return res.status(404).json({ message: "Không tìm thấy hồ sơ!" });

    await info.update({
      Name_Information,
      Gender,
      Date_Of_Birth,
      Address,
      Phone,
      CCCD
    });

    res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật!", error: error.message });
  }
};