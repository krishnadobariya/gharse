const express = require('express');
const { createOrder, getUserOrders, getChefOrders, updateOrderStatus, getTrendingDishes } = require('../controllers/orderController');
const { protect, chefOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createOrder);
router.get('/user', protect, getUserOrders);
router.get('/chef', protect, chefOnly, getChefOrders);
router.get('/trending', getTrendingDishes);
router.put('/:id/status', protect, chefOnly, updateOrderStatus);

module.exports = router;
