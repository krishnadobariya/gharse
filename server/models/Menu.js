const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['daily', 'weekly'], required: true },
    date: { type: Date }, // For daily
    day: { type: String }, // For weekly: monday, tuesday...
    mealType: { type: String, enum: ['lunch', 'dinner'], required: true },
    cuisine: { type: String, default: 'Indian' },
    isVeg: { type: Boolean, default: true },
    cutoffTime: { type: String, required: true }, // e.g., "10:00 AM"
    deliveryStartTime: { type: String, required: true },
    deliveryEndTime: { type: String, required: true },
    totalQty: { type: Number, required: true },
    availableQty: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    items: [{
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        unit: { type: String, required: true } // e.g., "pcs", "gm"
    }],
    isSoldOut: { type: Boolean, default: false },
    lastReset: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Menu', menuSchema);
