const User = require('../models/User');
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const ChefProfile = require('../models/ChefProfile');

const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalChefs = await User.countDocuments({ role: 'chef' });
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name')
            .populate('menuId', 'title');

        res.json({
            stats: {
                totalUsers,
                totalChefs,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0
            },
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllChefs = async (req, res) => {
    try {
        const chefs = await User.find({ role: 'chef' }).select('-password');
        const profiles = await ChefProfile.find();
        
        const chefData = chefs.map(chef => {
            const profile = profiles.find(p => p.userId.toString() === chef._id.toString());
            return {
                ...chef._doc,
                isVerified: profile?.isVerified || false,
                rating: profile?.rating || 0
            };
        });
        
        res.json(chefData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyChef = async (req, res) => {
    try {
        const { chefId } = req.params;
        const { isVerified } = req.body;
        
        const profile = await ChefProfile.findOneAndUpdate(
            { userId: chefId },
            { isVerified },
            { new: true, upsert: true }
        );
        
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getAllChefs,
    verifyChef,
    deleteUser
};
