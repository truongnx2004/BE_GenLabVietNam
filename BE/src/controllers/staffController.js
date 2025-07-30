const Account = require("../models/Account");
const Information = require("../models/Information");

const generateId = () => Date.now();

// 🔁 Ensure association is loaded before queries
Account.hasOne(Information, { foreignKey: "AccountID", as: "INFORMATION" });
Information.belongsTo(Account, { foreignKey: "AccountID", as: "ACCOUNT" });

exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await Account.findAll({
            where: { Role: "Staff", Status: "on" },
            include: [
                {
                    model: Information,
                    as: "INFORMATION", // must match alias in frontend
                },
            ],
        });
        res.json(staffList);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Lỗi khi lấy danh sách nhân viên", error: err.message });
    }
};

exports.getStaffById = async (req, res) => {
    try {
        const staff = await Account.findOne({
            where: { AccountID: req.params.id, Role: "Staff" },
            include: [
                {
                    model: Information,
                    as: "INFORMATION",
                },
            ],
        });
        if (!staff)
            return res.status(404).json({ message: "Không tìm thấy nhân viên" });
        res.json(staff);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Lỗi khi lấy nhân viên", error: err.message });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const {
            username,
            password,
            email,
            name,
            gender,
            dob,
            address,
            phone,
            cccd,
        } = req.body;

        const id = generateId();

        await Account.create({
            AccountID: id,
            UserName: username,
            Password: password,
            Email: email,
            Role: "Staff",
            Status: "on",
        });

        await Information.create({
            InformationID: id + 1,
            Name_Information: name,
            Gender: gender,
            Date_Of_Birth: dob,
            Address: address,
            Phone: phone,
            CCCD: cccd,
            AccountID: id,
        });

        res.json({ message: "Thêm nhân viên thành công!" });
    } catch (error) {
        console.error("Lỗi tạo staff:", error);
        res
            .status(500)
            .json({ message: "Lỗi server khi tạo nhân viên!", error: error.message });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const {
            username,
            password,
            email,
            name,
            gender,
            dob,
            address,
            phone,
            cccd,
        } = req.body;
        const { id } = req.params;

        await Account.update(
            {
                UserName: username,
                Password: password,
                Email: email,
            },
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

        res.json({ message: "Cập nhật thông tin nhân viên thành công!" });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Lỗi cập nhật nhân viên", error: error.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        await Account.update({ Status: "off" }, { where: { AccountID: id } });
        res.json({ message: "Đã vô hiệu hóa nhân viên thành công." });
    } catch (err) {
        res
            .status(500)
            .json({ message: "Lỗi khi xóa nhân viên", error: err.message });
    }
};
