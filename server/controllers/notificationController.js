const Notification = require('../models/Notification');

// @desc    Get user's notifications list
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const query = {
      $or: [
        { userId: req.user._id },
        { userId: null } // System-wide broadcast alerts
      ]
    };
    const list = await Notification.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404);
      return next(new Error('Notification not found'));
    }

    // Verify ownership
    if (notification.userId && notification.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Access denied, unauthorized action'));
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create manual notification (Admin Broadcast)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!title || !message) {
      res.status(400);
      return next(new Error('Please fill in title and message fields'));
    }

    const alert = await Notification.create({
      userId: userId || null,
      title,
      message,
      type: type || 'INFO'
    });

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification
};
