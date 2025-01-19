const RestaurantModel = require('../models/restaurant.model');
const uploadService = require('../services/upload.service');
const path = require('path');
const fs = require('fs');
class RestaurantController {
    async getAllRestaurants(req, res) {
        try {
            const restaurants = await RestaurantModel.find({});
            res.status(200).json(restaurants);
        } catch (error) {
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
}

module.exports = new RestaurantController();