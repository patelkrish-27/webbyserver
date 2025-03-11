const mongoose = require('mongoose');


const bookingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant', required: true },
  membersCount: { type: Number, required: true },
  selectedDate: { type: String, required: true },
  selectedTimeSlot: { type: String, required: true },
});

const BookingsModel = mongoose.model("Booking", bookingsSchema);

module.exports = BookingsModel;
