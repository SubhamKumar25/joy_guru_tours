const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

router.use(protect);
router.use(adminOnly);

router.get('/analytics', getAnalytics);

module.exports = router;
