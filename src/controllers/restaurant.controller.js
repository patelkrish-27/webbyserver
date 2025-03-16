const RestaurantModel = require('../models/restaurant.model');
const axios = require("axios");
const uploadService = require('../services/upload.service');
const path = require('path');
const fs = require('fs');
const UserModel = require('../models/user.model');

class RestaurantController {
  async fetchAllFavoriteRestaurant(req, res) {
    try {
      
      // Fetch user and populate favoriteRestaurants
      const user = await UserModel.findById(req.body.userId).populate('favoriteRestraunts');
      console.log("populated user:"+user);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log(user.favoriteRestraunts);
        res.status(200).json({ favoriteRestaurants: user.favoriteRestraunts });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


async toggleFavoriteRestaurant(req, res) {
    try {
        console.log(req.body);
        const user = await UserModel.findById(req.body.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Ensure correct field name
        if (!user.favoriteRestraunts) {
            user.favoriteRestraunts = [];
        }

        const index = user.favoriteRestraunts.indexOf(req.body.restaurantId);
        console.log("Index:", index);
        console.log("User before update:", user);

        if (index === -1) {
            // Add restaurant if not in the list
            user.favoriteRestraunts.push(req.body.restaurantId);
        } else {
            // Remove restaurant if already in the list
            user.favoriteRestraunts.splice(index, 1);
        }

        await user.save();
        console.log("User after update:", user);

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error toggling favorite restaurant:", error);
        res.status(500).json({ error: error.message });
    }
}

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
          res.status(500).json({ error: error.message });
        }
    }

    async searchAndFilterRestaurants(req, res) {
        try {
          const { term, sort, ratings, cuisines } = req.query;
    
          if (!term || term.trim() === "") {
            return res.status(400).json({ error: "Search term is required" });
          }
    
          // ✅ Step 1: Fetch restaurants from search API
          const searchResponse = await axios.get(
            `http://localhost:3000/api/restaurants/search?term=${term}`
          );
          let restaurants = searchResponse.data.results;
    
          // ✅ Step 2: Fetch additional restaurant details asynchronously
          const restaurantDetailsPromises = restaurants.map((restaurant) =>
            axios
              .get(`http://localhost:3000/api/restaurants/getOne/${restaurant._id}`)
              .then((response) => ({
                _id: restaurant._id,
                restaurantName: response.data.restaurantName,
                rating: response.data.rating,
                location: response.data.location,
                cuisine: response.data.cuisine,
                image: response.data.image,
              }))
              .catch(() => ({
                _id: restaurant._id,
                restaurantName: restaurant.restaurantName,
                error: "Failed to fetch restaurant details",
              }))
          );
    
          let enrichedRestaurants = await Promise.all(restaurantDetailsPromises);
    
          // ✅ Step 3: Apply filters
          if (cuisines) {
            const cuisineArray = cuisines.split(",").map((c) => c.trim().toLowerCase());
            enrichedRestaurants = enrichedRestaurants.filter((r) =>
              r.cuisine && cuisineArray.some(cuisine => r.cuisine.toLowerCase().includes(cuisine))
            );
          }
    
          if (ratings) {
            const numericRating = parseFloat(ratings);
            if (!isNaN(numericRating)) {
              enrichedRestaurants = enrichedRestaurants.filter((r) =>
                (numericRating === 3.5 && r.rating >= 3.5) ||
                (numericRating === 4 && r.rating >= 4) ||
                (numericRating === 4.5 && r.rating >= 4.5)
              );
            }
          }
    
          // ✅ Step 4: Sorting
          if (sort === "popularity") {
            enrichedRestaurants.sort((a, b) => b.rating - a.rating);
          }
    
          res.status(200).json({
            results: enrichedRestaurants,
          });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    }
    async getRandomPromotedRestaurants(req, res) {
      try {
          const { count } = req.query;
          const numberOfRestaurants = count ? Math.min(parseInt(count), 5) : 5; // Default to 5 if count is not provided
  
          // Fetch all promoted restaurants
          let promotedRestaurants = await RestaurantModel.find({ promoted: true });
  
          // Check if there are any promoted restaurants
          if (promotedRestaurants.length === 0) {
              return res.status(404).json({ error: "No promoted restaurants found" });
          }
  
          // Shuffle the array to get random restaurants
          const shuffledRestaurants = promotedRestaurants.sort(() => 0.5 - Math.random());
  
          // Select the specified number of random restaurants
          const randomRestaurants = shuffledRestaurants.slice(0, numberOfRestaurants);
  
          // Map to return only the name and first image
          const result = randomRestaurants
          // .map(restaurant => ({
          //     name: restaurant.restaurantName,
          //     image: restaurant.image[0] // Get the first image
          // }));
  
          res.status(200).json({ results: result });
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
    }
    // async filterAndRandomRestaurants(req, res) {
    //     try {
    //         const { minRating, isVeg, count, sort } = req.query;

    //         // Fetch all restaurants
    //         let restaurants = await RestaurantModel.find({});

    //         // Filter by minimum rating
    //         if (minRating) {
    //             const numericRating = parseFloat(minRating);
    //             if (!isNaN(numericRating)) {
    //                 restaurants = restaurants.filter(r => parseFloat(r.rating) >= numericRating);
    //             }
    //         }

    //         // Filter for vegetarian restaurants based on pureVeg field
    //         if (isVeg === 'true') {
    //             restaurants = restaurants.filter(r => r.pureVeg); // Check the pureVeg field
    //         }

    //         // Log ratings before sorting
    //         console.log("Before sorting:", restaurants.map(r => ({ name: r.restaurantName, rating: r.rating })));

    //         // Sort by ratings if the sort parameter is provided
    //         if (sort === 'asc') {
    //             restaurants.sort((a, b) => parseFloat(a.rating) - parseFloat(b.rating));
    //         } else if (sort === 'desc') {
    //             restaurants.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    //         }

    //         // Log sorted ratings
    //         console.log("After sorting:", restaurants.map(r => ({ name: r.restaurantName, rating: r.rating })));

    //         // Select a random number of restaurants from the sorted list
    //         if (restaurants.length === 0) {
    //             return res.status(404).json({ error: "No restaurants found matching the criteria" });
    //         }

    //         // Determine the number of random restaurants to return
    //         const numberOfRestaurants = count ? Math.min(parseInt(count), restaurants.length) : 1;
    //         const randomRestaurants = [];
    //         const usedIndices = new Set();

    //         while (randomRestaurants.length < numberOfRestaurants) {
    //             const randomIndex = Math.floor(Math.random() * restaurants.length);
    //             if (!usedIndices.has(randomIndex)) {
    //                 randomRestaurants.push(restaurants[randomIndex]);
    //                 usedIndices.add(randomIndex);
    //             }
    //         }

    //         // Return the random restaurants, which are selected from the sorted list
    //         res.status(200).json({ results: randomRestaurants });
    //     } catch (error) {
    //         res.status(500).json({ error: error.message });
    //     }
    // }

    async filterAndRandomRestaurants(req, res) {
      try {
          const { minRating, isVeg, count, sort } = req.query;

          // Fetch all restaurants
          let restaurants = await RestaurantModel.find({});

          // Filter by minimum rating
          if (minRating) {
              const numericRating = parseFloat(minRating);
              if (!isNaN(numericRating)) {
                  restaurants = restaurants.filter(r => parseFloat(r.rating) >= numericRating);
              }
          }

          // Filter for vegetarian restaurants based on pureVeg field
          if (String(isVeg).toLowerCase() === 'true') {
              restaurants = restaurants.filter(r => r.pureVeg);
          }

          // Ensure we have enough restaurants to choose from
          if (restaurants.length === 0) {
              return res.status(404).json({ error: "No restaurants found matching the criteria" });
          }

          // Determine the number of random restaurants to pick
          const numberOfRestaurants = count ? Math.min(parseInt(count), restaurants.length) : 1;
          const randomRestaurants = [];
          const usedIndices = new Set();

          while (randomRestaurants.length < numberOfRestaurants) {
              const randomIndex = Math.floor(Math.random() * restaurants.length);
              if (!usedIndices.has(randomIndex)) {
                  randomRestaurants.push(restaurants[randomIndex]);
                  usedIndices.add(randomIndex);
              }
          }

          // Sort the randomly selected restaurants
          randomRestaurants.sort((a, b) => {
              const ratingA = parseFloat(a.rating) || 0; // Default to 0 if rating is missing
              const ratingB = parseFloat(b.rating) || 0;
              return sort === 'asc' ? ratingA - ratingB : ratingB - ratingA;
          });

          // Return the sorted random restaurants
          res.status(200).json({ results: randomRestaurants });
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
  }
}

module.exports = new RestaurantController();


    