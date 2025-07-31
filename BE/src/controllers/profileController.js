const Account = require("../models/Account");
const Information = require("../models/Information");
<<<<<<< HEAD
=======
const axios = require("axios");
>>>>>>> d06bfb0a (cập nhật các function CRUD của manager và admin, xem profile và chức năng login)

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

<<<<<<< HEAD
=======
    // Nếu người dùng có cập nhật địa chỉ → geocode tọa độ
      if (Address) {
          const coords = await geocodeAddress(Address);
          if (coords) {
              updateData.Latitude = coords.latitude;
              updateData.Longitude = coords.longitude;
          }
      }

>>>>>>> d06bfb0a (cập nhật các function CRUD của manager và admin, xem profile và chức năng login)
    res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật!", error: error.message });
  }
<<<<<<< HEAD
};
=======
};

async function geocodeAddress(address) {
    try {
        const response = await axios.get(
            "https://api.openrouteservice.org/geocode/search",
            {
                params: {
                    api_key: process.env.ORS_API_KEY, // lấy từ .env
                    text: address,
                    boundary_country: "VN"
                }
            }
        );

        const coords = response.data.features[0]?.geometry?.coordinates;
        return coords ? { longitude: coords[0], latitude: coords[1] } : null;
    } catch (err) {
        console.error("❌ Lỗi khi geocode địa chỉ:", err.message);
        return null;
    }
}
>>>>>>> d06bfb0a (cập nhật các function CRUD của manager và admin, xem profile và chức năng login)
