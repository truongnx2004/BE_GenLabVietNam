const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");
const { authenticateJWT, authorizeRoles } = require("../middleware/authMiddleware");


router.get('/:accountId', authenticateJWT,  profileController.getProfile);
router.put('/:accountId', authenticateJWT, profileController.updateProfile);
  
module.exports = router;
  