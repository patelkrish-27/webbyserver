const mongoose = require('mongoose');
require("dotenv").config(); 

async function connectMongoDb() {
    return mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}

module.exports = {
    connectMongoDb,
};
