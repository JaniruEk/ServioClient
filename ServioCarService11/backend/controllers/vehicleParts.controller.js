const vehiclePartsService = require('../services/vehicleParts.service');

class VehiclePartsController {
  // Create a new vehicle parts request
  async createRequest(req, res) {
    try {
      const requestData = req.body;
      
      // Add technician ID from authenticated user if available
      if (req.user && req.user.id) {
        requestData.technicianId = requestData.technicianId || req.user.id;
      }
      
      const newRequest = await vehiclePartsService.createRequest(requestData);
      
      return res.status(201).json({
        success: true,
        message: 'Vehicle parts request created successfully',
        data: newRequest
      });
    } catch (error) {
      console.error('Error creating vehicle parts request:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating vehicle parts request',
        error: error.message
      });
    }
  }

  // Get all vehicle parts requests
  async getAllRequests(req, res) {
    try {
      const requests = await vehiclePartsService.getAllRequests();
      
      return res.status(200).json({
        success: true,
        message: 'Vehicle parts requests retrieved successfully',
        count: requests.length,
        data: requests
      });
    } catch (error) {
      console.error('Error getting all vehicle parts requests:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting all vehicle parts requests',
        error: error.message
      });
    }
  }

  // Get a vehicle parts request by ID
  async getRequestById(req, res) {
    try {
      const id = req.params.id;
      const request = await vehiclePartsService.getRequestById(id);
      
      if (!request) {
        return res.status(404).json({
          success: false,
          message: `Vehicle parts request with ID ${id} not found`
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Vehicle parts request retrieved successfully',
        data: request
      });
    } catch (error) {
      console.error(`Error getting vehicle parts request with ID ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error getting vehicle parts request',
        error: error.message
      });
    }
  }

  // Update a vehicle parts request
  async updateRequest(req, res) {
    try {
      const id = req.params.id;
      const updateData = req.body;
      
      const updatedRequest = await vehiclePartsService.updateRequest(id, updateData);
      
      return res.status(200).json({
        success: true,
        message: 'Vehicle parts request updated successfully',
        data: updatedRequest
      });
    } catch (error) {
      console.error(`Error updating vehicle parts request with ID ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error updating vehicle parts request',
        error: error.message
      });
    }
  }

  // Delete a vehicle parts request
  async deleteRequest(req, res) {
    try {
      const id = req.params.id;
      const result = await vehiclePartsService.deleteRequest(id);
      
      return res.status(200).json({
        success: true,
        message: 'Vehicle parts request deleted successfully',
        data: result
      });
    } catch (error) {
      console.error(`Error deleting vehicle parts request with ID ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting vehicle parts request',
        error: error.message
      });
    }
  }

  // Get vehicle parts requests by technician ID
  async getRequestsByTechnician(req, res) {
    try {
      const technicianId = req.params.technicianId || (req.user && req.user.id);
      
      if (!technicianId) {
        return res.status(400).json({
          success: false,
          message: 'Technician ID is required'
        });
      }
      
      const requests = await vehiclePartsService.getRequestsByTechnician(technicianId);
      
      return res.status(200).json({
        success: true,
        message: 'Vehicle parts requests retrieved successfully',
        count: requests.length,
        data: requests
      });
    } catch (error) {
      console.error(`Error getting vehicle parts requests for technician:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error getting vehicle parts requests for technician',
        error: error.message
      });
    }
  }

  // Update vehicle parts request status
  async updateRequestStatus(req, res) {
    try {
      const id = req.params.id;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }
      
      const updatedRequest = await vehiclePartsService.updateRequestStatus(id, status);
      
      return res.status(200).json({
        success: true,
        message: 'Vehicle parts request status updated successfully',
        data: updatedRequest
      });
    } catch (error) {
      console.error(`Error updating status for vehicle parts request with ID ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error updating vehicle parts request status',
        error: error.message
      });
    }
  }

  // Get vehicle parts requests by status
  async getRequestsByStatus(req, res) {
    try {
      const { status } = req.params;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status parameter is required'
        });
      }
      
      const requests = await vehiclePartsService.getRequestsByStatus(status);
      
      return res.status(200).json({
        success: true,
        message: `Vehicle parts requests with status '${status}' retrieved successfully`,
        count: requests.length,
        data: requests
      });
    } catch (error) {
      console.error(`Error getting vehicle parts requests by status:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error getting vehicle parts requests by status',
        error: error.message
      });
    }
  }

  // Get vehicle parts requests by job ID
  async getRequestsByJob(req, res) {
    try {
      const { jobId } = req.params;
      
      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID parameter is required'
        });
      }
      
      const requests = await vehiclePartsService.getRequestsByJob(jobId);
      
      return res.status(200).json({
        success: true,
        message: `Vehicle parts requests for job ${jobId} retrieved successfully`,
        count: requests.length,
        data: requests
      });
    } catch (error) {
      console.error(`Error getting vehicle parts requests for job:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error getting vehicle parts requests for job',
        error: error.message
      });
    }
  }
}

module.exports = new VehiclePartsController();