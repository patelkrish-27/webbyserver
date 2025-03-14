const RestaurantModel = require('../models/restaurant.model');
const uploadService = require('../services/upload.service');
const path = require('path');
const fs = require('fs');
class RestaurantController {
    async getAllRestaurants(req, res) {
        const page = req.params.pages;
        try {
            const restaurants = await RestaurantModel.find({}).skip((page-1)*100).limit(100);
            console.log(restaurants[0].image);
            res.status(200).json(restaurants);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async  getOneRestaurant(req, res) {
        try {
            const _id = req.params._id;  // Assume id is sent in the request body (you can adjust to use query params if needed)
            
            // Check if an id is provided
            if (!_id) {
                return res.status(400).json({ error: 'Restaurant id is required' });
            }
    
            // Query the restaurant by its ID
            const restaurant = await RestaurantModel.findById(_id);
            
            // If the restaurant is not found, return a 404 response
            if (!restaurant) {
                return res.status(404).json({ error: 'Restaurant not found' });
            }
    
            // Return the found restaurant in the response
            res.status(200).json(restaurant);
        } catch (error) {
            // Handle any errors (e.g., invalid ID format, server errors)
            res.status(500).json({ error: error.message });
        }
    }

    async addRestaurant(req, res) {
        try {
            const { name, address } = req.body;
            const image = req.files?.image;

            if (!image) {
                return res.status(400).json({ error: 'Image is required' });
            }
            const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Use full path for file upload
            const uploadPath = path.join(uploadsDir, Date.now() + '-' + image.name);
            await image.mv(uploadPath);
            const uploadResult = await uploadService.uploadFile(uploadPath);
            const restaurant = await RestaurantModel.create({
                name,
                address,
                image: uploadResult.secure_url
            });

            res.status(201).json(restaurant);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getRestaurantByTerm(req, res) {
        const restaurants = await RestaurantModel.find({});
        const term = (req.query.term || "").toLowerCase().trim();
        console.log("Search term received on server:", term);
      
        if (!term) {
          return res.status(400).json({ error: "Search term is required" });
        }
      
        // Filter restaurants by name
        const filtered = restaurants.filter((restaurant) => {
          if (restaurant.restaurantName && typeof restaurant.restaurantName === "string") {
            return restaurant.restaurantName.toLowerCase().includes(term);
          }
          console.warn("Skipping invalid item:", restaurant);
          return false;
        });
      
        res.json({ results: filtered });
    }
    // 5 random restaurants
    async getRandomRestaurants(req, res) {
        try {
          const randomRestaurants = await RestaurantModel.aggregate([
            { $sample: { size: 5 } },
          ]);
    
          if (!randomRestaurants || randomRestaurants.length === 0) {
            return res.status(404).json({ error: "No restaurants found" });
          }
    
          res.status(200).json({ results: randomRestaurants });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
}

module.exports = new RestaurantController();


    