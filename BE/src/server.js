require("dotenv").config();
const express = require("express");
<<<<<<< HEAD
const cors = require("cors"); // CORS middleware
const configViewEngine = require("./config/viewEngine");
const webRoutes = require("./routes/web");
//booking
const bookingRoute = require("./routes/bookingRoutes");  
//const connection = require("./config/database");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes"); // đúng đường dẫn tới authRoutes.js
const profileRoutes = require("./routes/profileRoutes");
//const serviceRoutes = require("./routes/serviceRoutes");
const managerRoutes = require("./routes/managerRoutes");
const adminRoutes = require("./routes/adminRoutes"); 
//staff 
const sampleRoutes = require("./routes/staffSampleRoutes"); 

const app = express();
const port = process.env.PORT || 8888;
const hostname = process.env.HOSTNAME || "localhost";

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
//configure template engine
//configViewEngine(app);

// khai báo routes
//app.use("/", webRoutes);

// connection.query("select * from account", function (err, results, fields) {
//   console.log("results: ", results);
// });

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bookings", bookingRoute);
//app.use("/api/service", serviceRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/admin", adminRoutes); 
//staff 
app.use("/api/staff/samples", sampleRoutes); 
// Kết nối DB & chạy serverz`
=======
const cors = require("cors");
const sequelize = require("./config/database");

// Import các routes
const bookingRoute = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const managerRoutes = require("./routes/managerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const sampleRoutes = require("./routes/staffSampleRoutes");

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

// Khởi động socket server
socketServer(server); // truyền server vào để socket.io hoạt động

// Kết nối DB và khởi động cả server + socket
>>>>>>> d06bfb0a (cập nhật các function CRUD của manager và admin, xem profile và chức năng login)
sequelize
    .authenticate()
    .then(() => {
        console.log("✅ Kết nối database thành công");
<<<<<<< HEAD
        app.listen(3001, () =>
            console.log("🚀 Server chạy tại http://localhost:3001")
        );
=======
        server.listen(3001, () => {
            console.log("🚀 Server + Socket.IO chạy tại http://localhost:3001");
        });
>>>>>>> d06bfb0a (cập nhật các function CRUD của manager và admin, xem profile và chức năng login)
    })
    .catch((err) => {
        console.error("❌ Lỗi kết nối:", err);
    });
<<<<<<< HEAD

// app.listen(port, hostname, () => {
//   console.log(`Example app listening on port ${port}`);
// });
=======
>>>>>>> d06bfb0a (cập nhật các function CRUD của manager và admin, xem profile và chức năng login)
