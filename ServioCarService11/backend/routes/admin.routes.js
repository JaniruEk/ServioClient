const express = require('express');
const adminController = require('../controllers/admin.controller');
const router = express.Router();

// Get all admins
router.get('/', adminController.getAllAdmins);

// Get admin by ID
router.get('/:adminId', adminController.getAdminById);

// Get admin by user ID
router.get('/user/:userId', adminController.getAdminByUserId);

// Create a new admin
router.post('/', adminController.createAdmin);

// Update an admin
router.put('/:adminId', adminController.updateAdmin);

// Delete an admin
router.delete('/:adminId', adminController.deleteAdmin);

// Update admin permissions
router.patch('/:adminId/permissions', adminController.updatePermissions);

// Update admin last login
router.patch('/:adminId/login', adminController.updateLastLogin);

// Get system statistics
router.get('/stats/system', adminController.getSystemStats);

// Approve service center
router.patch('/service-center/:serviceCenterId/approve', adminController.approveServiceCenter);

// Reject service center
router.patch('/service-center/:serviceCenterId/reject', adminController.rejectServiceCenter);

// Generate system report
router.get('/reports/:reportType', adminController.generateSystemReport);

module.exports = router;