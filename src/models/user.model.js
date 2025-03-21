const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    idToken: String,
    photoUrl: String,
    address: String,
    phoneNumber: String,
    favoriteRestraunts: [{ type: mongoose.Schema.Types.ObjectId, ref: "RestaurantData", default: [] }], 
    location: {
        latitude: Number,
        longitude: Number
    }
});

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;