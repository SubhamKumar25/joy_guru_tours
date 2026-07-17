const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

router.use(protect);
router.use(adminOnly);

router.get('/', getAuditLogs);

module.exports = router;
