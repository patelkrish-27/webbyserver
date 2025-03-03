const mongoose = require('mongoose')

const categoriesSchema = mongoose.Schema({
    name:String,
    image:String,
})

const CategoriesModel= mongoose.model("categories",categoriesSchema)

module.exports = CategoriesModel