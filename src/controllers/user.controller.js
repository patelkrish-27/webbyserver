const UserModel = require("../models/user.model");
const authController = require("./auth.controller");
const AuthModel = require("../models/auth.model");
class UserController {
  async registerUser(req, res) {
    const user = req.body;
    console.log("checkUser",user);
    const checkUser = await UserModel.findOne({ email: user.email });
    if (checkUser) {
      res.send({ status: false, message: "User already exists" });
    } else {
      const newUser = await UserModel.create({
        name: user.name,
        email: user.email,
        idToken:user.idToken,
        photoUrl: user.photoUrl,
        address:user.address,
        phoneNumber:user.phoneNumber,
        location:{
          latitude: user.location.latitude,
          longitude: user.location.longitude
        }
      });
      res.status(201).json({user:newUser});
    }
  }
  async registerUserByEmail(req, res) {
    // const user = {email, password, otp,photoUrl:'',name:username};
    const user = req.body;
    const checkUser = await UserModel.findOne({ email: user.email });
    if (checkUser) {
      res.send({ status: false, message: "User already exists" });
    } else {
        const idToken = await authController.hashPassword(user.password);
        console.log(idToken);
        const newUser = await UserModel.create({
          name: user.name,
          email: user.email,
          idToken,
          photoUrl: user.photoUrl,
          address:user.address,
          phoneNumber:user.phoneNumber,
          location:{
            latitude: user.location.latitude,
            longitude: user.location.longitude
          }
        });
        res.status(201).json({user:newUser});
      }
    }
  async loginUser(req, res) {
    const { email, idToken } = req.query;
    const user = await UserModel.findOne({email} );
    console.log("email",user)
    if (!user) {
      res.send({ status: false, message: "User not found" });
    } else {
      res.status(201).json({ status: true, message: "User found",user });
    }
  }
  async loginUserByEmail(req, res) {
    const { email, password } = req.query;
    const isMatch = await authController.verifyPassword(password,email);
    if(!isMatch){
        res.send({status:false,message:"Invalid password or email"});
        return;
    }else{
        const user = await UserModel.findOne({ email});
        res.status(201).json({user});
    }
  }

  async getUser(req, res) {
    const { _id } = req.body;
    const user = await UserModel.findOne({ _id });
    if (!user) {
      res.send({ status: false, message: "User not found" });
    } else {
      res.status(201).json({ status: true, message: "User found",user });
    }
  }
}

module.exports = new UserController();
