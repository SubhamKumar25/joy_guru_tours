const AuditLog = require('../models/AuditLog');

// @desc    Get all audit log entries (Admin View)
// @route   GET /api/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res, next) => {
  try {
    const list = await AuditLog.find({})
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs
};
