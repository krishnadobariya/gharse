const mongoose = require('mongoose');

const chefProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopName: { type: String, required: true },
    description: { type: String },
    categories: [{ type: String }], // e.g., ['Veg', 'Gujarati']
    rating: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    images: [{ type: String }], // Cloudinary URLs
    address: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChefProfile', chefProfileSchema);
