<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
router.post("/register", userController.registerUser);
router.post("/registerbyemail", userController.registerUserByEmail);

router.get("/login", userController.loginUser);
router.get("/loginbyemail", userController.loginUserByEmail);
router.post("/send-otp", authController.sendOtp);
module.exports = router;
=======
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
router.post("/register", userController.registerUser);
router.post("/registerbyemail", userController.registerUserByEmail);

router.get("/login", userController.loginUser);
router.get("/loginbyemail", userController.loginUserByEmail);
router.post("/send-otp", authController.sendOtp);
module.exports = router;
>>>>>>> master
