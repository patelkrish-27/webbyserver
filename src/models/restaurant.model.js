const mongoose = require('mongoose')

const restaurantSchema = mongoose.Schema({
    name:String,
    address:String,
    image:String
})

const RestaurantModel= mongoose.model("restaurant",restaurantSchema)

module.exports = RestaurantModel