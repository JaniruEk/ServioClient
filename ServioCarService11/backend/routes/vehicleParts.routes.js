const express = require('express');
const vehiclePartsController = require('../controllers/vehicleParts.controller');
const router = express.Router();

// GET /api/parts - Get all vehicle parts requests
router.get('/', vehiclePartsController.getAllRequests);

// GET /api/parts/:id - Get a vehicle parts request by ID
router.get('/:id', vehiclePartsController.getRequestById);

// POST /api/parts - Create a new vehicle parts request
router.post('/', vehiclePartsController.createRequest);

// PUT /api/parts/:id - Update a vehicle parts request
router.put('/:id', vehiclePartsController.updateRequest);

// DELETE /api/parts/:id - Delete a vehicle parts request
router.delete('/:id', vehiclePartsController.deleteRequest);

// GET /api/parts/technician/:technicianId - Get vehicle parts requests by technician
router.get('/technician/:technicianId', vehiclePartsController.getRequestsByTechnician);

// PUT /api/parts/:id/status - Update vehicle parts request status
router.put('/:id/status', vehiclePartsController.updateRequestStatus);

// GET /api/parts/status/:status - Get vehicle parts requests by status
router.get('/status/:status', vehiclePartsController.getRequestsByStatus);

// GET /api/parts/job/:jobId - Get vehicle parts requests by job
router.get('/job/:jobId', vehiclePartsController.getRequestsByJob);

module.exports = router;