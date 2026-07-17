const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, createNotification } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/', adminOnly, createNotification);

module.exports = router;
