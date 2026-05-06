const express = require('express');
const { addReview, getMenuReviews, getChefReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, addReview);
router.get('/menu/:menuId', getMenuReviews);
router.get('/chef/:chefId', getChefReviews);

module.exports = router;
