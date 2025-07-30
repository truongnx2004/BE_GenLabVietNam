const express = require("express");
const router = express.Router();
const {
  getHomepage,
  getABC,
  getTest,
} = require("../controllers/homeController");
// route.Method('path', handler)

router.get("/", getHomepage); //getHomepage is a function imported from homeController

router.get("/abc", getABC); //getABC is a function imported from homeController

router.get("/test", getTest); //getTest is a function imported from homeController
module.exports = router; //export default router
