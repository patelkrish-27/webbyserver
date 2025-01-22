const mongoose = require('mongoose')

const restaurantSchema = mongoose.Schema({
    name:String,
    address:String,
    image:String,
    cusine:String,
    description:String,
    promoted:Boolean,
    rating:Number,
    time:String,
})

const RestaurantModel= mongoose.model("restaurant",restaurantSchema)

module.exports = RestaurantModel