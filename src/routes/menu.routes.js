const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");

// Route to get menu items by restaurant ID
router.get("/restaurant/:restaurantId", menuController.getMenuByRestaurantId);

// Route to get all menus (optional - for admin purposes)
router.get("/all", menuController.getAllMenus);

// Route to get menu items by category
router.get("/category/:category", menuController.getMenuByCategory);

module.exports = router;
