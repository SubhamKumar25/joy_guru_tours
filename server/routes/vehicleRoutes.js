const express = require('express');
const router = express.Router();
const { getVehicles, addVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

router.get('/', getVehicles);
router.post('/', protect, adminOnly, addVehicle);
router.put('/:id', protect, adminOnly, updateVehicle);
router.delete('/:id', protect, adminOnly, deleteVehicle);

module.exports = router;
