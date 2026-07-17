const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({});
    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
const addVehicle = async (req, res, next) => {
  try {
    const { name, type, number, capacity, price, status } = req.body;

    if (!name || !type || !number || !capacity || !price) {
      res.status(400);
      return next(new Error('Please fill in all vehicle registration fields'));
    }

    const count = await Vehicle.countDocuments();
    const uniqueId = count + 1;

    const vehicle = await Vehicle.create({
      id: uniqueId,
      name,
      type,
      number,
      capacity: parseInt(capacity),
      price: parseFloat(price),
      status: status || 'Available'
    });

    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle details
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ id: parseInt(req.params.id) });
    if (!vehicle) {
      res.status(404);
      return next(new Error('Vehicle registration record not found'));
    }

    vehicle.name = req.body.name !== undefined ? req.body.name : vehicle.name;
    vehicle.type = req.body.type !== undefined ? req.body.type : vehicle.type;
    vehicle.number = req.body.number !== undefined ? req.body.number : vehicle.number;
    vehicle.capacity = req.body.capacity !== undefined ? parseInt(req.body.capacity) : vehicle.capacity;
    vehicle.price = req.body.price !== undefined ? parseFloat(req.body.price) : vehicle.price;
    vehicle.status = req.body.status !== undefined ? req.body.status : vehicle.status;

    const updatedVehicle = await vehicle.save();
    res.json({
      success: true,
      data: updatedVehicle
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!vehicle) {
      res.status(404);
      return next(new Error('Vehicle registration record not found'));
    }

    res.json({
      success: true,
      message: 'Vehicle registration record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle
};
