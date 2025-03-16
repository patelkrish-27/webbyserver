const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const { connectMongoDb } = require('./src/config/database');
const restaurantRouter = require('./src/routes/restaurant.routes');
const homepageRouter = require('./src/routes/homepage.routes');
const userRouter = require('./src/routes/user.routes');
const authRouter = require('./src/routes/auth.routes');
const bookingRoutes = require('./src/routes/bookings.routes');
const menuRoutes = require('./src/routes/menu.routes');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(bodyParser.json());

// Routes
app.use('/api/restaurants', restaurantRouter);
app.use('/api/homepage', homepageRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/',bookingRoutes);
app.use('/api/menu', menuRoutes);
// Database connection
connectMongoDb();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});