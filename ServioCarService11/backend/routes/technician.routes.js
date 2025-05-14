const express = require('express');
const technicianController = require('../controllers/technician.controller');
const router = express.Router();

// GET /api/technicians - Get all technicians
router.get('/', technicianController.getAllTechnicians);

// GET /api/technicians/:id - Get a technician by ID
router.get('/:id', technicianController.getTechnicianById);

// GET /api/technicians/user/:userId - Get technician by user ID
router.get('/user/:userId', technicianController.getTechnicianByUserId);

// POST /api/technicians - Create a new technician
router.post('/', technicianController.createTechnician);

// PUT /api/technicians/:id - Update a technician
router.put('/:id', technicianController.updateTechnician);

// DELETE /api/technicians/:id - Delete a technician
router.delete('/:id', technicianController.deleteTechnician);

// PUT /api/technicians/:id/availability - Update technician availability
router.put('/:id/availability', technicianController.updateAvailability);

// POST /api/technicians/:id/rating - Add a rating to a technician
router.post('/:id/rating', technicianController.addRating);

// GET /api/technicians/:id/dashboard - Get technician dashboard data
router.get('/:id/dashboard', technicianController.getDashboardData);

// GET /api/technicians/specialization/:specialization - Get technicians by specialization
router.get('/specialization/:specialization', technicianController.getTechniciansBySpecialization);

// GET /api/technicians/search - Search technicians by name or specialization
router.get('/search', technicianController.searchTechnicians);

// GET /api/technicians/top-rated - Get top rated technicians
router.get('/top-rated', technicianController.getTopRatedTechnicians);

// GET /api/technicians/most-experienced - Get most experienced technicians
router.get('/most-experienced', technicianController.getMostExperiencedTechnicians);

// GET /api/technicians/service-center/:serviceCenterId - Get technicians by service center
router.get('/service-center/:serviceCenterId', technicianController.getTechniciansByServiceCenter);

module.exports = router;