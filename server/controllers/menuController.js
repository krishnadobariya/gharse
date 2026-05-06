const Menu = require('../models/Menu');
const User = require('../models/User');

const createMenu = async (req, res) => {
    try {
        const menuData = { ...req.body, chefId: req.user.id };
        if (req.file) {
            menuData.image = req.file.path || (req.file.buffer ? 'data:image/jpeg;base64,' + req.file.buffer.toString('base64') : null);
        }
        // In case items is sent as string (from FormData)
        if (typeof menuData.items === 'string') {
            menuData.items = JSON.parse(menuData.items);
        }
        const menu = await Menu.create(menuData);
        res.status(201).json(menu);
    } catch (error) {
        console.error('Menu Creation Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getNearbyMenus = async (req, res) => {
    try {
        const { lat, lng, radius = 5, all = false } = req.query;
        
        // Reset Logic for Weekly Menus
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Corrected Reset Logic: Using a loop to ensure compatibility and schema validation
        const weeklyMenusToReset = await Menu.find({ type: 'weekly', lastReset: { $lt: today } });
        for (let menu of weeklyMenusToReset) {
            menu.availableQty = menu.totalQty;
            menu.isSoldOut = false;
            menu.lastReset = today;
            await menu.save();
        }

        // Safety check for coordinates
        const latitude = parseFloat(lat) || 23.0225; // Default to Ahmedabad if missing
        const longitude = parseFloat(lng) || 72.5714;

        const usersNearby = await User.find({
            role: 'chef',
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [longitude, latitude] },
                    $maxDistance: radius * 1000
                }
            }
        });

        const chefIds = usersNearby.map(u => u._id);
        
        let query = { chefId: { $in: chefIds }, availableQty: { $gt: 0 } };
        
        if (all !== 'true') {
            const currentDay = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
            const currentDate = new Date();
            currentDate.setHours(0,0,0,0);

            query.$or = [
                { type: 'daily', date: { $gte: currentDate, $lt: new Date(currentDate.getTime() + 24*60*60*1000) } },
                { type: 'weekly', day: currentDay }
            ];
        }

        // Use aggregation to include chef rating
        const menus = await Menu.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'users',
                    localField: 'chefId',
                    foreignField: '_id',
                    as: 'chef'
                }
            },
            { $unwind: '$chef' },
            {
                $lookup: {
                    from: 'chefprofiles',
                    localField: 'chefId',
                    foreignField: 'userId',
                    as: 'profile'
                }
            },
            { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    title: 1, type: 1, mealType: 1, cutoffTime: 1, price: 1, image: 1, items: 1, availableQty: 1, isSoldOut: 1, date: 1, day: 1, cuisine: 1, isVeg: 1,
                    chefId: {
                        _id: '$chef._id',
                        name: '$chef.name',
                        rating: { $ifNull: ['$profile.rating', 0] }
                    }
                }
            }
        ]);

        res.json(menus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getChefMenus = async (req, res) => {
    try {
        const menus = await Menu.find({ chefId: req.params.chefId });
        res.json(menus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMenu = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.path || (req.file.buffer ? 'data:image/jpeg;base64,' + req.file.buffer.toString('base64') : null);
        }
        if (typeof updateData.items === 'string') {
            updateData.items = JSON.parse(updateData.items);
        }

        const menu = await Menu.findOneAndUpdate(
            { _id: req.params.id, chefId: req.user.id },
            updateData,
            { new: true }
        );
        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMenuById = async (req, res) => {
    try {
        const menu = await Menu.findById(req.params.id).populate('chefId', 'name email mobile');
        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMenu = async (req, res) => {
    try {
        const menu = await Menu.findOneAndDelete({ _id: req.params.id, chefId: req.user.id });
        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        res.json({ message: 'Menu deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyMenus = async (req, res) => {
    try {
        const menus = await Menu.find({ chefId: req.user.id }).populate('chefId', 'name');
        res.json(menus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createMenu, getNearbyMenus, getChefMenus, updateMenu, deleteMenu, getMyMenus, getMenuById };
