const axios = require("axios");
const MenuModel = require("../models/menu.model");

class MenuController {
  // Get menu items by restaurant ID
  async getMenuByRestaurantId(req, res) {
    try {
      const restaurantId = req.params.restaurantId;

      // Check if restaurant ID is provided
      if (!restaurantId) {
        return res.status(400).json({ error: "Restaurant ID is required" });
      }

      // Find menu items for the given restaurant ID
      const menuItems = await MenuModel.findOne({
        restaurant_id: restaurantId,
      });

      // If no menu items found
      if (!menuItems) {
        return res
          .status(404)
          .json({ error: "No menu items found for this restaurant" });
      }

      // Return the menu items
      res.status(200).json(menuItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all menus (optional - for admin purposes)
  async getAllMenus(req, res) {
    try {
      const menus = await MenuModel.find({});
      res.status(200).json(menus);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get menu items by category
  async getMenuByCategory(req, res) {
    try {
      const { category } = req.params;

      if (!category) {
        return res.status(400).json({ error: "Category is required" });
      }

      // Find all restaurants that have menu items in the given category
      const menus = await MenuModel.find({ "menu.category": category });

      if (!menus.length) {
        return res
          .status(404)
          .json({ error: "No menu items found in this category" });
      }

      // Fetch restaurant details for each restaurant_id
      const restaurantDetailsPromises = menus.map((menu) =>
        axios
          .get(
            `http://localhost:3000/api/restaurants/getOne/${menu.restaurant_id}`
          )
          .then((response) => ({
            restaurant_id: menu.restaurant_id,
            restaurant_name: response.data.restaurantName,
            restaurant_rating: response.data.rating,
            restaurant_address: response.data.location.city + " ,"+response.data.location.area,
            menu_items: menu.menu.filter((item) => item.category === category),
          }))
          .catch((error) => ({
            restaurant_id: menu.restaurant_id,
            error: "Failed to fetch restaurant details",
            menu_items: menu.menu.filter((item) => item.category === category),
          }))
      );

      // Resolve all promises and send the response
      const results = await Promise.all(restaurantDetailsPromises);
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MenuController();
``;
