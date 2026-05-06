const express = require('express');
const { 
    getDashboardStats, 
    getAllUsers, 
    getAllChefs, 
    verifyChef, 
    deleteUser 
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/chefs', getAllChefs);
router.put('/verify-chef/:chefId', verifyChef);
router.delete('/user/:id', deleteUser);

module.exports = router;
