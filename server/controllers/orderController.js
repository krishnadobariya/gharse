const Order = require('../models/Order');
const Menu = require('../models/Menu');

const createOrder = async (req, res) => {
    try {
        const { menuId, quantity, deliveryAddress } = req.body;
        const menu = await Menu.findById(menuId);

        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        if (menu.availableQty < quantity) return res.status(400).json({ message: 'Insufficient quantity' });

        const now = new Date();
        const [time, modifier] = menu.cutoffTime.split(' ');
        let [hours, minutes] = time.split(':');
        if (modifier === 'PM' && hours !== '12') hours = parseInt(hours, 10) + 12;
        if (modifier === 'AM' && hours === '12') hours = '00';
        
        const cutoffDate = new Date();
        cutoffDate.setHours(hours, minutes, 0, 0);

        if (now > cutoffDate) {
            return res.status(400).json({ message: 'Order cutoff time has passed' });
        }

        const totalAmount = menu.price * quantity;
        const order = await Order.create({
            userId: req.user.id,
            chefId: menu.chefId,
            menuId,
            quantity,
            totalAmount,
            deliveryAddress
        });

        // Reduce available quantity
        menu.availableQty -= quantity;
        if (menu.availableQty === 0) menu.isSoldOut = true;
        await menu.save();

        // Socket Notification to Chef
        const io = req.app.get('io');
        io.to(menu.chefId.toString()).emit('new_order', order);

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('chefId', 'name')
            .populate('menuId')
            .sort({ createdAt: -1 })
            .lean();

        const Review = require('../models/Review');
        const ordersWithReview = await Promise.all(orders.map(async (order) => {
            const review = await Review.findOne({ orderId: order._id });
            return { ...order, isReviewed: !!review };
        }));

        res.json(ordersWithReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getChefOrders = async (req, res) => {
    try {
        const orders = await Order.find({ chefId: req.user.id }).populate('userId', 'name mobile').populate('menuId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, chefId: req.user.id },
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Socket Notification to User
        const io = req.app.get('io');
        io.to(order.userId.toString()).emit('order_status_update', order);

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTrendingDishes = async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        // First find nearby chefs
        const User = require('../models/User');
        const usersNearby = await User.find({
            role: 'chef',
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: radius * 1000
                }
            }
        });
        const chefIds = usersNearby.map(u => u._id);

        const trending = await Order.aggregate([
            { $match: { chefId: { $in: chefIds }, createdAt: { $gte: last7Days } } },
            { $group: { _id: '$menuId', totalOrdered: { $sum: '$quantity' } } },
            { $sort: { totalOrdered: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'menus',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'menu'
                }
            },
            { $unwind: '$menu' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'menu.chefId',
                    foreignField: '_id',
                    as: 'chef'
                }
            },
            { $unwind: '$chef' },
            {
                $lookup: {
                    from: 'chefprofiles',
                    localField: 'menu.chefId',
                    foreignField: 'userId',
                    as: 'profile'
                }
            },
            { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } }
        ]);

        res.json(trending.map(t => ({
            ...t.menu,
            chefId: { 
                _id: t.chef._id, 
                name: t.chef.name,
                rating: t.profile?.rating || 0 
            },
            totalOrdered: t.totalOrdered
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getUserOrders, getChefOrders, updateOrderStatus, getTrendingDishes };
