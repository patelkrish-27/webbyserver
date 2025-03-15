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
    const emailBody = ` <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Webby OTP Email</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .email-header {
          background-color: #4CAF50;
          color: white;
          text-align: center;
          padding: 20px;
        }
        .email-header img {
          max-width: 100px;
          margin-bottom: 10px;
        }
        .email-body {
          padding: 20px;
          color: #333;
          line-height: 1.5;
        }
        .otp-box {
          display: inline-block;
          background-color: #f4f4f4;
          padding: 10px 20px;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 2px;
          color: #4CAF50;
          border-radius: 4px;
          margin: 20px 0;
        }
        .email-footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #999;
          background: #f4f4f4;
        }
        .email-footer a {
          color: #4CAF50;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .email-body {
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Email Header -->
        <div class="email-header">
          <img src="https://res.cloudinary.com/webbybyweber/image/upload/v1737285403/logo_webby_sqzj33.png" alt="Webby Logo">
          <h1>Welcome to Webby!</h1>
        </div>

        <!-- Email Body -->
        <div class="email-body">
          <p>Dear User,</p>
          <p>Thank you for signing up with Webby, your go-to restaurant app! To complete your registration or verify your account, please use the following One-Time Password (OTP):</p>
          
          <div class="otp-box">${otp}</div>
          
          <p>Please note that this OTP is valid for the next 10 minutes. If you didn’t request this, please ignore this email.</p>
          
          <p>Enjoy your experience with Webby!</p>
          <p>Best regards,<br>The Webby Team</p>
        </div>

        <!-- Email Footer -->
        <div class="email-footer">
          <p>If you have any questions, feel free to <a href="mailto:support@webby.com">contact us</a>.</p>
          <p>© 2025 Webby. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>`;
    const info = mailSender(email, "OTP", emailBody);
    if(info.status === false){
        res.send({status:false,message:"Got an error while sending otp"});
    }else{
      res.status(200).json({ status: true, message: "OTP sent" });
      console.log(info);
    }
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

  async verifyPassword(password, email) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return false;
    } else {
      const isMatch = await bcrypt.compare(password, user.idToken);
      return isMatch;
    }
  }

  async verifyOtp(req, res) {
    const { email, otp } = req.body;
    const checkOtp = await AuthModel.findOne({ email, otp });
    if (!checkOtp) {
      res.send({ status: false, message: "OTP is invalid" });
      return;
    }
    res.send({ status: true, message: "OTP is valid" });
  }
}

module.exports = new AuthController();