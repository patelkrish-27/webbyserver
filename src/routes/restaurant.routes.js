// BACKEND: restaurantRoutes.js
const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const fileUpload = require('express-fileupload');

router.use(fileUpload());

router.get('/get/:pages', restaurantController.getAllRestaurants);
router.post('/add', restaurantController.addRestaurant);
router.get('/getOne/:_id', restaurantController.getOneRestaurant);
router.get('/search', restaurantController.getRestaurantByTerm);

module.exports = router;