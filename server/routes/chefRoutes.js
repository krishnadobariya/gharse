const express = require('express');
const { updateProfile, getProfile, getNearbyChefs } = require('../controllers/chefController');
const { protect, chefOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/profile', protect, chefOnly, updateProfile);
router.get('/profile/:id', getProfile);
router.get('/nearby', getNearbyChefs);

module.exports = router;
