require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");

// Import các routes
const bookingRoute = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const managerRoutes = require("./routes/managerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const sampleRoutes = require("./routes/staffSampleRoutes");

//Test route
const testRoutes = require('./routes/testRoutes');

// 🔌 IMPORT SOCKET SERVER
const http = require("http");
const socketServer = require("./socketServer"); // Đảm bảo đúng đường dẫn

const app = express();
const server = http.createServer(app); // tạo HTTP server

// Khai báo middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

//Map
const routeMap = require("./routes/routeMap");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/booking", bookingRoute);
app.use("/api/manager", managerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", sampleRoutes);
app.use("/api/route", routeMap);

// Test route
app.use('/test', testRoutes);


// Khởi động socket server
socketServer(server); // truyền server vào để socket.io hoạt động

// Kết nối DB và khởi động cả server + socket
sequelize
    .authenticate()
    .then(() => {
        console.log("✅ Kết nối database thành công");
        server.listen(3001, () => {
            console.log("🚀 Server + Socket.IO chạy tại http://localhost:3001");
        });
    })
    .catch((err) => {
        console.error("❌ Lỗi kết nối:", err);
    });
