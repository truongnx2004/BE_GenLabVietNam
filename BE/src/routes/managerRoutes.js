const express = require("express");
const router = express.Router();
const {
    authenticateJWT,
    authorizeRoles,
    allowManagerOrAdmin,
} = require("../middleware/authMiddleware");
// const managerController = require("../controllers/serviceController ");

// Chỉ cho phép staff, manager, admin truy cập
// router.get("/dashboard",  authenticateJWT, authorizeRoles("Staff", "Manager", "Admin"), managerController.dashboard);
// Routes quản lý dịch vụ
const {
    addService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
} = require("../controllers/serviceController");

router.get("/service/", authenticateJWT, allowManagerOrAdmin, getAllServices);
router.get(
    "/service/:id",
    authenticateJWT,
    allowManagerOrAdmin,
    getServiceById
);
router.post("/service/", authenticateJWT, allowManagerOrAdmin, addService);
router.put("/service/:id", authenticateJWT, allowManagerOrAdmin, updateService);
router.delete(
    "/service/:id",
    authenticateJWT,
    allowManagerOrAdmin,
    deleteService
);

// Routes quản lý nhân viên
const staffcontroller = require("../controllers/staffController");
router.get(
    "/staff/",
    authenticateJWT,
    authorizeRoles("Manager"),
    staffcontroller.getAllStaff
);
router.get(
    "/staff/:id",
    authenticateJWT,
    authorizeRoles("Manager"),
    staffcontroller.getStaffById
);
router.post(
    "/staff/",
    authenticateJWT,
    authorizeRoles("Manager"),
    staffcontroller.createStaff
);
router.put(
    "/staff/:id",
    authenticateJWT,
    authorizeRoles("Manager"),
    staffcontroller.updateStaff
);
router.delete(
    "/staff/:id",
    authenticateJWT,
    authorizeRoles("Manager"),
    staffcontroller.deleteStaff
);
module.exports = router;
