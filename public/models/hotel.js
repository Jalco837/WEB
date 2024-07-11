const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  location: String,
  name: String,
  description: String,
  stars: Number,
  images: [String]
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
