const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const AuthModel = require("../models/auth.model");
const UserModel = require("../models/user.model");
class AuthController {
  async sendOtp(req, res) {
    const { email } = req.body;
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const response = await AuthModel.create({ email, otp });
    console.log(response);
    mailSender(email, "OTP", `<b>Your OTP is ${otp}</b>`);
    res.status(200).json({ status: true, message: "OTP sent" });
  }
  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      throw error;
    }
  }
  async verifyPassword(password,email) {
    const user = await UserModel.findOne({email});
    const isMatch = await bcrypt.compare(password,user.idToken);
    return isMatch;
  }
}

module.exports = new AuthController();
