const User = require('../models/User');
const ChefProfile = require('../models/ChefProfile');

const updateProfile = async (req, res) => {
    try {
        const { shopName, description, categories, address, images } = req.body;
        let profile = await ChefProfile.findOne({ userId: req.user.id });

        if (profile) {
            profile.shopName = shopName || profile.shopName;
            profile.description = description || profile.description;
            profile.categories = categories || profile.categories;
            profile.address = address || profile.address;
            profile.images = images || profile.images;
            await profile.save();
        } else {
            profile = await ChefProfile.create({
                userId: req.user.id,
                shopName, description, categories, address, images
            });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        let profile = await ChefProfile.findOne({ userId: req.params.id }).populate('userId', 'name email location mobile');
        
        if (!profile) {
            // Check if the user exists and is a chef
            const user = await User.findById(req.params.id).select('-password');
            if (user && user.role === 'chef') {
                return res.json({
                    userId: user,
                    shopName: user.name + "'s Kitchen",
                    description: "Welcome to my home kitchen! I love sharing my family recipes.",
                    address: "Address not provided",
                    categories: [],
                    rating: 0,
                    totalOrders: 0,
                    images: []
                });
            }
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNearbyChefs = async (req, res) => {
    try {
        const { lat, lng, radius = 5 } = req.query;
        const usersNearby = await User.find({
            role: 'chef',
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: radius * 1000 // to meters
                }
            }
        });

        const chefIds = usersNearby.map(u => u._id);
        const profiles = await ChefProfile.find({ userId: { $in: chefIds } }).populate('userId', 'name location');
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { updateProfile, getProfile, getNearbyChefs };
