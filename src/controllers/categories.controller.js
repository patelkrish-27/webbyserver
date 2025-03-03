const CategoriesModel = require('../models/categories.model');
class CategoriesController {
  async getCategories(req,res){
    try {
      const categories = await CategoriesModel.find({});
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addCategories(req,res){
    try{
        const {name,image} = req.body;
        const category = await CategoriesModel.create({name,image});
        res.status(201).json(category);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CategoriesController();
