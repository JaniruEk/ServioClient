const express = require('express');
const jobController = require('../controllers/job.controller');
const router = express.Router();

// GET /api/jobs - Get all jobs
router.get('/', jobController.getAllJobs);

// GET /api/jobs/:id - Get a job by ID
router.get('/:id', jobController.getJobById);

// POST /api/jobs - Create a new job
router.post('/', jobController.createJob);

// PUT /api/jobs/:id - Update a job
router.put('/:id', jobController.updateJob);

// PUT /api/jobs/:id/status - Update job status
router.put('/:id/status', jobController.updateJobStatus);

// DELETE /api/jobs/:id - Delete a job
router.delete('/:id', jobController.deleteJob);

// GET /api/jobs/technician/:technicianId - Get jobs by technician
router.get('/technician/:technicianId', jobController.getJobsByTechnician);

// GET /api/jobs/status/:status - Get jobs by status
router.get('/status/:status', jobController.getJobsByStatus);

// GET /api/jobs/technician/:technicianId/status/:status - Get jobs by technician and status
router.get('/technician/:technicianId/status/:status', jobController.getJobsByTechnicianAndStatus);

// GET /api/jobs/technician/:technicianId/stats - Get job statistics for a technician
router.get('/technician/:technicianId/stats', jobController.getJobStatsForTechnician);

// PUT /api/jobs/:id/notes - Add notes to a job
router.put('/:id/notes', jobController.addJobNotes);

module.exports = router;