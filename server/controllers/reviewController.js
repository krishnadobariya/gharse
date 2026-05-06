const Review = require('../models/Review');
const Menu = require('../models/Menu');
const Order = require('../models/Order');

const addReview = async (req, res) => {
    try {
        const { chefId, menuId, rating, comment, orderId } = req.body;
        
        // If orderId is provided, check if it's already reviewed
        if (orderId) {
            const existingReview = await Review.findOne({ orderId });
            if (existingReview) {
                return res.status(400).json({ message: 'You have already reviewed this order.' });
            }
        }

        // Check if user has a delivered order for this menu (security check)
        const deliveredOrder = await Order.findOne({
            _id: orderId || { $exists: true }, // If orderId provided, check that specific one
            userId: req.user.id,
            menuId,
            status: 'delivered'
        });

        if (!deliveredOrder) {
            return res.status(403).json({ message: 'You can only review items you have ordered and received.' });
        }

        const review = await Review.create({
            userId: req.user.id,
            chefId,
            menuId,
            orderId: orderId || deliveredOrder._id, // Save the orderId
            rating,
            comment
        });

        // Update Chef Rating
        const reviews = await Review.find({ chefId });
        const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        const ChefProfile = require('../models/ChefProfile');
        await ChefProfile.findOneAndUpdate({ userId: chefId }, { rating: avgRating });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMenuReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ menuId: req.params.menuId }).populate('userId', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getChefReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ chefId: req.params.chefId }).populate('userId', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addReview, getMenuReviews, getChefReviews };
