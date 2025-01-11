const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
    email: String,
    otp: String,
    createdAt: { type: Date, default: Date.now, expires: 60 * 5 },
})

const AuthModel = mongoose.model("auth", authSchema);

module.exports = AuthModel;
