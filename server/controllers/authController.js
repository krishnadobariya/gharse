const User = require('../models/User');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, mobile, password, role, location } = req.body;
        
        const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({
            name, email, mobile, password, role, location
        });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        res.status(201).json({ 
            user: { 
                id: user._id, 
                name, 
                email, 
                role,
                favorites: []
            }, 
            token 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { identifier, password } = req.body; // email or mobile
        
        const user = await User.findOne({ 
            $or: [{ email: identifier }, { mobile: identifier }] 
        });

        if (user && (await user.comparePassword(password))) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({ 
                user: { 
                    id: user._id, 
                    name: user.name, 
                    email: user.email, 
                    role: user.role,
                    favorites: user.favorites || []
                }, 
                token 
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleFavorite = async (req, res) => {
    try {
        const { chefId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user.favorites) user.favorites = [];
        
        const index = user.favorites.findIndex(id => id.toString() === chefId.toString());
        if (index > -1) {
            user.favorites.splice(index, 1);
        } else {
            user.favorites.push(chefId);
        }
        
        await user.save();
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login, updateProfile, getMe, toggleFavorite };
