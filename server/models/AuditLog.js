const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userName: {
    type: String,
    required: false
  },
  action: {
    type: String,
    required: [true, 'Action name is required']
  },
  details: {
    type: String,
    required: [true, 'Action details description is required']
  },
  ipAddress: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Compound index for quick sorting and auditing
auditLogSchema.index({ timestamp: -1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
