// backend/routes/spareParts.routes.js
const express = require('express');
const router = express.Router();
const sparePartsController = require('../controllers/spareParts.controller');

// Create a new spare part
router.post('/', sparePartsController.createSparePart);

// Get spare parts for a service center
router.get('/service-center/:serviceCenterId', sparePartsController.getSparePartsByServiceCenter);

// Get low stock parts for a service center
router.get('/low-stock/:serviceCenterId', sparePartsController.getLowStockParts);

// Get a specific spare part
router.get('/:id', sparePartsController.getSparePartById);

// Update a spare part
router.put('/:id', sparePartsController.updateSparePart);

// Delete a spare part
router.delete('/:id', sparePartsController.deleteSparePart);

// Update quantity of a spare part
router.patch('/:id/quantity', sparePartsController.updatePartQuantity);

// Add multiple spare parts at once
router.post('/bulk', sparePartsController.addBulkSpareParts);

module.exports = router;
