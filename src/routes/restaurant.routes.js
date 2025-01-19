// BACKEND: restaurantRoutes.js
const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const fileUpload = require('express-fileupload');

router.use(fileUpload());

router.get('/', restaurantController.getAllRestaurants);
router.post('/add', restaurantController.addRestaurant);

module.exports = router;