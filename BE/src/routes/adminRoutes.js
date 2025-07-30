const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

const {
  authenticateJWT,
  authorizeRoles,
  allowManagerOrAdmin,
} = require("../middleware/authMiddleware");

// Route quản lý account
router.get("/account/", accountController.getAllAccounts);
router.post("/account/", accountController.createAccount);
router.put("/account/:id", accountController.updateAccount);
router.put("/account/:id/status", accountController.deleteAccountStatus);
// Route quản lý dịch vụ
const {
  addService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

router.get(
  "/account/service/",
  authenticateJWT,
  allowManagerOrAdmin,
  getAllServices
);
router.get(
  "/account/service/:id",
  authenticateJWT,
  allowManagerOrAdmin,
  getServiceById
);
router.post(
  "/account/service/",
  authenticateJWT,
  allowManagerOrAdmin,
  addService
);
router.put(
  "/account/service/:id",
  authenticateJWT,
  allowManagerOrAdmin,
  updateService
);
router.delete(
  "/account/service/:id",
  authenticateJWT,
  allowManagerOrAdmin,
  deleteService
);
module.exports = router;
