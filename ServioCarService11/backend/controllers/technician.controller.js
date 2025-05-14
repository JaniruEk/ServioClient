const technicianService = require('../services/technician.service');
const jobService = require('../services/job.service');

class TechnicianController {
  // Get all technicians
  async getAllTechnicians(req, res) {
    try {
      const technicians = await technicianService.getAllTechnicians();
      res.status(200).json({
        success: true,
        count: technicians.length,
        data: technicians
      });
    } catch (error) {
      console.error('Error getting all technicians:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get technicians',
        error: error.message
      });
    }
  }

  // Get a technician by ID
  async getTechnicianById(req, res) {
    try {
      const { id } = req.params;
      const technician = await technicianService.getTechnicianById(id);
      
      if (!technician) {
        return res.status(404).json({
          success: false,
          message: `Technician with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        data: technician
      });
    } catch (error) {
      console.error(`Error getting technician with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to get technician',
        error: error.message
      });
    }
  }

  // Get technician by user ID (from Firebase Auth)
  async getTechnicianByUserId(req, res) {
    try {
      const { userId } = req.params;
      const technician = await technicianService.getTechnicianByUserId(userId);
      
      if (!technician) {
        return res.status(404).json({
          success: false, 
          message: `Technician with user ID ${userId} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        data: technician
      });
    } catch (error) {
      console.error(`Error getting technician with user ID ${req.params.userId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to get technician',
        error: error.message
      });
    }
  }

  // Create a new technician
  async createTechnician(req, res) {
    try {
      const technicianData = req.body;
      
      // Validate required fields
      if (!technicianData.userId || !technicianData.fullName || !technicianData.email) {
        return res.status(400).json({
          success: false,
          message: 'User ID, full name, and email are required fields'
        });
      }
      
      const newTechnician = await technicianService.createTechnician(technicianData);
      res.status(201).json({
        success: true,
        data: newTechnician
      });
    } catch (error) {
      console.error('Error creating technician:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create technician',
        error: error.message
      });
    }
  }

  // Update a technician
  async updateTechnician(req, res) {
    try {
      const { id } = req.params;
      const technicianData = req.body;
      
      // Validate technician exists
      const existingTechnician = await technicianService.getTechnicianById(id);
      if (!existingTechnician) {
        return res.status(404).json({
          success: false,
          message: `Technician with ID ${id} not found`
        });
      }
      
      const updatedTechnician = await technicianService.updateTechnician(id, technicianData);
      res.status(200).json({
        success: true,
        data: updatedTechnician
      });
    } catch (error) {
      console.error(`Error updating technician with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to update technician',
        error: error.message
      });
    }
  }

  // Delete a technician
  async deleteTechnician(req, res) {
    try {
      const { id } = req.params;
      
      // Validate technician exists
      const existingTechnician = await technicianService.getTechnicianById(id);
      if (!existingTechnician) {
        return res.status(404).json({
          success: false,
          message: `Technician with ID ${id} not found`
        });
      }
      
      const result = await technicianService.deleteTechnician(id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error(`Error deleting technician with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete technician',
        error: error.message
      });
    }
  }

  // Update technician availability
  async updateAvailability(req, res) {
    try {
      const { id } = req.params;
      const { availability } = req.body;
      
      // Validate availability
      const validStatuses = ['Available', 'Busy', 'On Leave'];
      if (!validStatuses.includes(availability)) {
        return res.status(400).json({
          success: false,
          message: `Invalid availability: ${availability}. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      
      // Validate technician exists
      const existingTechnician = await technicianService.getTechnicianById(id);
      if (!existingTechnician) {
        return res.status(404).json({
          success: false,
          message: `Technician with ID ${id} not found`
        });
      }
      
      const updatedTechnician = await technicianService.updateAvailability(id, availability);
      res.status(200).json({
        success: true,
        data: updatedTechnician
      });
    } catch (error) {
      console.error(`Error updating availability for technician with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to update technician availability',
        error: error.message
      });
    }
  }

  // Add rating to a technician
  async addRating(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment, customerId } = req.body;
      
      // Validate technician exists
      const existingTechnician = await technicianService.getTechnicianById(id);
      if (!existingTechnician) {
        return res.status(404).json({
          success: false,
          message: `Technician with ID ${id} not found`
        });
      }
      
      // Validate rating
      if (!rating || rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5'
        });
      }
      
      const updatedTechnician = await technicianService.addRating(id, Number(rating), comment, customerId);
      res.status(200).json({
        success: true,
        data: updatedTechnician
      });
    } catch (error) {
      console.error(`Error adding rating to technician with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to add technician rating',
        error: error.message
      });
    }
  }

  // Get technician dashboard data
  async getDashboardData(req, res) {
    try {
      const { id } = req.params;
      const today = new Date().toISOString().split('T')[0];
      
      // Validate technician exists
      const technician = await technicianService.getTechnicianById(id);
      if (!technician) {
        return res.status(404).json({
          success: false,
          message: `Technician with ID ${id} not found`
        });
      }
      
      // Get today's jobs
      const todayJobs = await jobService.getTodayJobsForTechnician(id);
      
      // Get upcoming jobs
      const upcomingJobs = await jobService.getUpcomingJobsForTechnician(id);
      
      // Get job statistics
      const jobStats = await jobService.getJobStatsForTechnician(id);
      
      res.status(200).json({
        success: true,
        data: {
          technician,
          todayJobs,
          upcomingJobs,
          jobStats
        }
      });
    } catch (error) {
      console.error(`Error getting dashboard data for technician with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to get technician dashboard data',
        error: error.message
      });
    }
  }

  // Get technicians by specialization
  async getTechniciansBySpecialization(req, res) {
    try {
      const { specialization } = req.params;
      
      if (!specialization) {
        return res.status(400).json({
          success: false,
          message: 'Specialization parameter is required'
        });
      }
      
      const technicians = await technicianService.getTechniciansBySpecialization(specialization);
      res.status(200).json({
        success: true,
        count: technicians.length,
        data: technicians
      });
    } catch (error) {
      console.error(`Error getting technicians with specialization ${req.params.specialization}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to get technicians by specialization',
        error: error.message
      });
    }
  }
  
  // Search technicians
  async searchTechnicians(req, res) {
    try {
      const { term } = req.query;
      
      if (!term) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }
      
      const technicians = await technicianService.searchTechnicians(term);
      res.status(200).json({
        success: true,
        count: technicians.length,
        data: technicians
      });
    } catch (error) {
      console.error(`Error searching technicians with term ${req.query.term}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to search technicians',
        error: error.message
      });
    }
  }
  
  // Get top rated technicians
  async getTopRatedTechnicians(req, res) {
    try {
      const { limit = 5 } = req.query;
      const technicians = await technicianService.getTopRatedTechnicians(Number(limit));
      
      res.status(200).json({
        success: true,
        count: technicians.length,
        data: technicians
      });
    } catch (error) {
      console.error('Error getting top rated technicians:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get top rated technicians',
        error: error.message
      });
    }
  }
  
  // Get most experienced technicians
  async getMostExperiencedTechnicians(req, res) {
    try {
      const { limit = 5 } = req.query;
      const technicians = await technicianService.getMostExperiencedTechnicians(Number(limit));
      
      res.status(200).json({
        success: true,
        count: technicians.length,
        data: technicians
      });
    } catch (error) {
      console.error('Error getting most experienced technicians:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get most experienced technicians',
        error: error.message
      });
    }
  }
  
  // Get technicians by service center
  async getTechniciansByServiceCenter(req, res) {
    try {
      const { serviceCenterId } = req.params;
      
      if (!serviceCenterId) {
        return res.status(400).json({
          success: false,
          message: 'Service center ID is required'
        });
      }
      
      const technicians = await technicianService.getTechniciansByServiceCenter(serviceCenterId);
      res.status(200).json({
        success: true,
        count: technicians.length,
        data: technicians
      });
    } catch (error) {
      console.error(`Error getting technicians for service center ${req.params.serviceCenterId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to get technicians by service center',
        error: error.message
      });
    }
  }
}

module.exports = new TechnicianController();