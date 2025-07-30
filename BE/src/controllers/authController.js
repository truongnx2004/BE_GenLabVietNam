// const Account = require("../models/Account");

// exports.login = async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const user = await Account.findOne({
//       where: {
//         UserName: username,
//         Password: password, // ⚠️ phải đúng cả hai
//       },
//     });

//     if (!user) {
//       return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
//     }

//     return res.status(200).json({
//       message: "Đăng nhập thành công",
//       data: {
//         id: user.AccountID,
//         username: user.UserName,
//         role: user.Role,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Lỗi đăng nhập" });
//   }
// };
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


const { OAuth2Client } = require("google-auth-library"); // ✅ Dòng này bắt buộc

const { Op } = require("sequelize");
const Account = require("../models/Account");
const Information = require("../models/Information");
const transporter = require("../utils/mailer");

const login = async (req, res) => {
  const { username, password } = req.body; 

  // 🟢 SỐ (1): In giá trị người dùng nhập
  console.log("👉 Đang kiểm tra tài khoản:", username, password);

  try {
    // 🟢 SỐ (2): Truy vấn tài khoản từ database
    const user = await Account.findOne({
      where: {
        [Op.or]: [{ UserName: username }, { Email: username }],
        Password: password,
      },
    });

    // 🟢 SỐ (3): In kết quả tìm được
    console.log("🔍 Kết quả tìm user:", user);

    if (!user) {
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    // Tạo JWT chứa role
    const token = jwt.sign(
      {
        id: user.AccountID,
            username: user.UserName,
            email: user.Email,
            role: user.Role
      },
      process.env.JWT_SECRET || "your-secret",
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user.AccountID,
        username: user.UserName,
        email: user.Email,
        role: user.Role,
      },
      token
    });
  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi đăng nhập", error: err.message });
  }
};

const client = new OAuth2Client(
  "367898675068-fmj2mrtue07srrmg83hg0v48vg59aqpv.apps.googleusercontent.com"
);

const googleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    // 1. Xác thực credential
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience:
        "367898675068-fmj2mrtue07srrmg83hg0v48vg59aqpv.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    // 2. Tìm hoặc tạo tài khoản trong DB
    let user = await Account.findOne({ where: { Email: email } });

    if (!user) {
      user = await Account.create({
        UserName: email.split("@")[0],
        Email: email,
        Password: "", // để trống vì dùng Google
        Role: "Customer",
      });
    }

    // 3. Tạo JWT chứa role
    const token = jwt.sign(
      {
        id: user.AccountID,
        username: user.UserName,
        role: user.Role
      },
      process.env.JWT_SECRET || "your-secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Đăng nhập Google thành công",
      token,
      user: {
        id: user.AccountID,
        username: user.UserName,
        email: user.Email,
        role: user.Role,
      },
    });
  } catch (error) {
    console.error("Lỗi Google Login:", error);
    res.status(401).json({ message: "Không thể xác thực tài khoản Google." });
  }
};

////////////////////////////////////////////////////////////////////////////////

const otpStore = new Map(); // lưu OTP tạm thời

const generateId = () => {
  return Date.now(); // hoặc dùng logic tạo ID theo chuẩn của bạn
};

const register = async (req, res) => {
  const {
    username,
    password,
    email,
    role = "Customer",
    name,
    gender,
    dob,
    address,
    phone,
    cccd
  } = req.body;

  try {
    // Kiểm tra email đã tồn tại
    const existing = await Account.findOne({ where: { Email: email } });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại!" });

    // Tạo ID và mã hóa mật khẩu
    const accountId = generateId();
    const plainPassword = password;


    // Tạo tài khoản
    await Account.create({
      AccountID: accountId,
      UserName: username,
      Password: plainPassword,
      Email: email,
      Role: role,
      Status: 'on'
    });

    // Tạo hồ sơ người dùng
    await Information.create({
      InformationID: accountId + 1,
      Name_Information: name,
      Gender: gender,
      Date_Of_Birth: dob,
      Address: address,
      Phone: phone,
      CCCD: cccd,
      AccountID: accountId
    });

    // Gửi email xác nhận
    await transporter.sendMail({
      from: "GENLAB Vietnam <ngxtruong010204@gmail.com>",
      to: email,
      subject: "Đăng ký thành công",
      text: `Chào ${name},\n\nBạn đã đăng ký tài khoản thành công tại GENLAB.\n\nThông tin tài khoản:\nTên đăng nhập: ${username}\nEmail: ${email}\n\nCảm ơn bạn!`,
    });

    res.json({ message: "Đăng ký thành công! Vui lòng kiểm tra email." });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
};


const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const validOtp = otpStore.get(email);

  if (!validOtp || otp !== validOtp) {
    return res
      .status(400)
      .json({ message: "OTP không hợp lệ hoặc đã hết hạn." });
  }

  // ❌ Không mã hóa mật khẩu (CHỈ dùng cho mục đích học tập/demo)
  await Account.update({ Password: newPassword }, { where: { Email: email } });

  otpStore.delete(email);

  res.json({ message: "Đặt lại mật khẩu thành công!" });
};

const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Account.findOne({ where: { Email: email } });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, otp); // Lưu OTP tạm thời

    await transporter.sendMail({
      from: "GENLAB <ngxtruong010204@gmail.com>",
      to: email,
      subject: "Mã OTP khôi phục mật khẩu",
      text: `Mã OTP của bạn là: ${otp}`,
    });

    res.json({ message: "OTP đã được gửi tới email của bạn." });
  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    res.status(500).json({ message: "Không thể gửi OTP" });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  resetPassword,
  sendResetOtp
};

