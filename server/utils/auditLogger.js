const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, userName, action, details, ipAddress = '') => {
  try {
    await AuditLog.create({
      userId: userId || null,
      userName: userName || 'System/Guest',
      action,
      details,
      ipAddress
    });
  } catch (err) {
    console.error('Failed to write Audit Log to DB:', err.message);
  }
};

module.exports = { logAudit };
