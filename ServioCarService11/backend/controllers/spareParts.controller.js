// backend/controllers/spareParts.controller.js
const sparePartsService = require('../services/spareParts.service');

/**
 * Controller for handling spare parts inventory operations
 */
class SparePartsController {
  /**
   * Create a new spare part in inventory
   */
  async createSparePart(req, res) {
    try {
      const partData = req.body;
      const newPart = await sparePartsService.createSparePart(partData);
      
      return res.status(201).json({
        success: true,
        message: 'Spare part added successfully',
        data: newPart
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to add spare part',
        error: error.toString()
      });
    }
  }

  /**
   * Get spare parts for a specific service center
   */
  async getSparePartsByServiceCenter(req, res) {
    try {
      const { serviceCenterId } = req.params;
      
      if (!serviceCenterId) {
        return res.status(400).json({
          success: false,
          message: 'Service center ID is required'
        });
      }
      
      const parts = await sparePartsService.getSparePartsByServiceCenter(serviceCenterId);
      
      return res.status(200).json({
        success: true,
        message: 'Spare parts retrieved successfully',
        data: parts
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get spare parts',
        error: error.toString()
      });
    }
  }

  /**
   * Get a spare part by ID
   */
  async getSparePartById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Spare part ID is required'
        });
      }
      
      const part = await sparePartsService.getSparePartById(id);
      
      if (!part) {
        return res.status(404).json({
          success: false,
          message: `Spare part with ID ${id} not found`
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Spare part retrieved successfully',
        data: part
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get spare part',
        error: error.toString()
      });
    }
  }

  /**
   * Update a spare part
   */
  async updateSparePart(req, res) {
    try {
      const { id } = req.params;
      const partData = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Spare part ID is required'
        });
      }
      
      const updatedPart = await sparePartsService.updateSparePart(id, partData);
      
      return res.status(200).json({
        success: true,
        message: 'Spare part updated successfully',
        data: updatedPart
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update spare part',
        error: error.toString()
      });
    }
  }

  /**
   * Delete a spare part (or mark as inactive)
   */
  async deleteSparePart(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Spare part ID is required'
        });
      }
      
      await sparePartsService.deleteSparePart(id);
      
      return res.status(200).json({
        success: true,
        message: 'Spare part deleted successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete spare part',
        error: error.toString()
      });
    }
  }

  /**
   * Update quantity of a spare part
   */
  async updatePartQuantity(req, res) {
    try {
      const { id } = req.params;
      const { quantityChange } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Spare part ID is required'
        });
      }
      
      if (quantityChange === undefined || isNaN(quantityChange)) {
        return res.status(400).json({
          success: false,
          message: 'Valid quantity change value is required'
        });
      }
      
      const result = await sparePartsService.updatePartQuantity(id, parseInt(quantityChange));
      
      return res.status(200).json({
        success: true,
        message: 'Quantity updated successfully',
        data: result
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update quantity',
        error: error.toString()
      });
    }
  }

  /**
   * Get low stock parts for a service center
   */
  async getLowStockParts(req, res) {
    try {
      const { serviceCenterId } = req.params;
      
      if (!serviceCenterId) {
        return res.status(400).json({
          success: false,
          message: 'Service center ID is required'
        });
      }
      
      const lowStockParts = await sparePartsService.getLowStockParts(serviceCenterId);
      
      return res.status(200).json({
        success: true,
        message: 'Low stock parts retrieved successfully',
        data: lowStockParts
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get low stock parts',
        error: error.toString()
      });
    }
  }

  /**
   * Add multiple spare parts at once
   */
  async addBulkSpareParts(req, res) {
    try {
      const { parts } = req.body;
      
      if (!Array.isArray(parts) || parts.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid array of parts is required'
        });
      }
      
      const results = await sparePartsService.addBulkSpareParts(parts);
      
      return res.status(201).json({
        success: true,
        message: 'Bulk spare parts added successfully',
        data: results
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to add bulk spare parts',
        error: error.toString()
      });
    }
  }
}

module.exports = new SparePartsController();
