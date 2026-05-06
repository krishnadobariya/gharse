const express = require('express');
const { createMenu, getNearbyMenus, getChefMenus, updateMenu, deleteMenu, getMyMenus, getMenuById } = require('../controllers/menuController');
const { protect, chefOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.post('/', protect, chefOnly, upload.single('image'), createMenu);
router.get('/nearby', getNearbyMenus);
router.get('/chef/my', protect, chefOnly, getMyMenus);
router.get('/chef/:chefId', getChefMenus);
router.get('/:id', getMenuById);
router.put('/:id', protect, chefOnly, upload.single('image'), updateMenu);
router.delete('/:id', protect, chefOnly, deleteMenu);

module.exports = router;
