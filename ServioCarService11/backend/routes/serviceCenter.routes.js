const express = require('express');
const serviceCenterController = require('../controllers/serviceCenter.controller');
const router = express.Router();

// GET /api/service-centers - Get all service centers
router.get('/', serviceCenterController.getAllServiceCenters);

// GET /api/service-centers/profile - Get authenticated service center profile
router.get('/profile', serviceCenterController.getServiceCenterProfile);

// PUT /api/service-centers/profile - Update authenticated service center profile
router.put('/profile', serviceCenterController.updateServiceCenterProfile);

// GET /api/service-centers/reports - Get reports for authenticated service center
router.get('/reports', serviceCenterController.getServiceCenterReports);

// GET /api/service-centers/reservations - Get service reservations for authenticated service center
router.get('/reservations', serviceCenterController.getServiceReservations);

// PUT /api/service-centers/reservations/:id/status - Update service reservation status
router.put('/reservations/:id/status', serviceCenterController.updateReservationStatus);

// GET /api/service-centers/user/:userId - Get service center by user ID
router.get('/user/:userId', serviceCenterController.getServiceCenterByUserId);

// GET /api/service-centers/city/:city - Get service centers by city
router.get('/city/:city', serviceCenterController.getServiceCentersByCity);

// GET /api/service-centers/:id - Get a service center by ID
router.get('/:id', serviceCenterController.getServiceCenterById);

// POST /api/service-centers - Create a new service center
router.post('/', serviceCenterController.createServiceCenter);

// PUT /api/service-centers/:id - Update a service center
router.put('/:id', serviceCenterController.updateServiceCenter);

// DELETE /api/service-centers/:id - Delete a service center
router.delete('/:id', serviceCenterController.deleteServiceCenter);

// POST /api/service-centers/:id/services - Add a service to a service center
router.post('/:id/services', serviceCenterController.addService);

// DELETE /api/service-centers/:id/services/:serviceId - Remove a service from a service center
router.delete('/:id/services/:serviceId', serviceCenterController.removeService);

// POST /api/service-centers/:id/ratings - Add a rating to a service center
router.post('/:id/ratings', serviceCenterController.addRating);

// PUT /api/service-centers/:id/toggle-status - Toggle active status of service center
router.put('/:id/toggle-status', serviceCenterController.toggleActiveStatus);

// GET /api/service-centers/:id/dashboard - Get service center dashboard data
router.get('/:id/dashboard', serviceCenterController.getDashboardData);

module.exports = router;