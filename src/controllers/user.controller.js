const UserModel = require("../models/user.model");
const authController = require("./auth.controller");
const AuthModel = require("../models/auth.model");
class UserController {
  
async fetchAllFavoriteRestaurant (req,res) {
  try {
      const favoriteRestaurants = await UserModel.findById(req.body.userId)
      console.log(favoriteRestaurants.favoriteRestraunts)
      res.status(200).json({favoriteRestaurants:favoriteRestaurants.favoriteRestraunts});
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

async toggleFavoriteRestaurant(req, res) {
  try {
      console.log(req.body);
      const user = await UserModel.findById(req.body.userId);

      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      // Ensure correct field name
      if (!user.favoriteRestraunts) {
          user.favoriteRestraunts = [];
      }

      const index = user.favoriteRestraunts.indexOf(req.body.restaurantId);
      console.log("Index:", index);
      console.log("User before update:", user);

      if (index === -1) {
          // Add restaurant if not in the list
          user.favoriteRestraunts.push(req.body.restaurantId);
      } else {
          // Remove restaurant if already in the list
          user.favoriteRestraunts.splice(index, 1);
      }

      await user.save();
      console.log("User after update:", user);

      return res.status(200).json(user);
  } catch (error) {
      console.error("Error toggling favorite restaurant:", error);
      res.status(500).json({ error: error.message });
  }
}
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
    console.log("user id:"+_id)
    const user = await UserModel.findOne({_id});
    if (!user) {
      res.send({ status: false, message: "User not found" });
    } else {
      res.status(201).json({ status: true, message: "User found",user });
    }
  }

  async updateUser(req, res) {
    try {
      const { userId, name, address, phoneNumber, photoUrl } = req.body;

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { name, address, phoneNumber, photoUrl },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      res.status(200).json({ status: true, message: "User updated successfully", user: updatedUser });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }

  // **DELETE USER**
  async deleteUser(req, res) {
    try {
      const { userId } = req.body;
      const deletedUser = await UserModel.findByIdAndDelete(userId);

      if (!deletedUser) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      res.status(200).json({ status: true, message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
}

module.exports = new UserController();
