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
router.get("/random", restaurantController.getRandomRestaurants);
// router.get('/filtered', restaurantController.getFilteredRestaurants);
router.get('/filtered-search', restaurantController.searchAndFilterRestaurants);
router.post("/toggleFavorite", restaurantController.toggleFavoriteRestaurant);
router.post("/fetchAllFavorite", restaurantController.fetchAllFavoriteRestaurant);

module.exports = router;