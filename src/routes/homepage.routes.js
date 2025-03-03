// BACKEND: restaurantRoutes.js
const express = require('express');
const router = express.Router();
const CategoriesController = require('../controllers/categories.controller');


router.get("/getCategories", CategoriesController.getCategories);
router.get("/addCategories", CategoriesController.addCategories);
module.exports = router;