const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');

// @desc    Get dashboard analytics & reports stats
// @route   GET /api/reports/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: { $in: ['Pending', 'Requested', 'Fare Proposed'] } });
    const confirmedBookings = await Booking.countDocuments({ status: { $in: ['Confirmed', 'Advance Paid', 'Driver Assigned', 'Trip Started'] } });
    const completedTrips = await Booking.countDocuments({ status: { $in: ['Completed', 'Fully Paid'] } });
    const cancelledTrips = await Booking.countDocuments({ status: 'Cancelled' });

    // Aggregate revenues
    const revenueStats = await Booking.aggregate([
      {
        $match: {
          status: { $nin: ['Cancelled', 'Pending', 'Requested', 'Fare Proposed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalFare' },
          totalPaid: { $sum: '$advancePaid' }
        }
      }
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
    const totalPaid = revenueStats.length > 0 ? revenueStats[0].totalPaid : 0;
    const pendingPayments = totalRevenue - totalPaid;

    // Monthly bookings grouping for trend charts
    const monthlyStats = await Booking.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $in: ['$status', ['Completed', 'Fully Paid']] }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Active fleet size
    const fleetSize = await Vehicle.countDocuments({});
    const maintenanceFleet = await Vehicle.countDocuments({ status: 'Maintenance' });

    res.json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedTrips,
        cancelledTrips,
        totalRevenue,
        pendingPayments,
        fleetSize,
        maintenanceFleet,
        monthlyStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics
};
