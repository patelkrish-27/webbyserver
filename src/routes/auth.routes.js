<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
router.post("/send-otp", authController.sendOtp);
=======
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
router.post("/send-otp", authController.sendOtp);
>>>>>>> master
module.exports = router;