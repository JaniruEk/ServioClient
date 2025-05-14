const serviceCenterService = require('../services/serviceCenter.service');
const jobService = require('../services/job.service');
const admin = require('firebase-admin');

class ServiceCenterController {
  // Get all service centers
  async getAllServiceCenters(req, res) {
    try {
      const serviceCenters = await serviceCenterService.getAllServiceCenters();
      res.status(200).json({
        success: true,
        count: serviceCenters.length,
        data: serviceCenters
      });
    } catch (error) {
      console.error('Error getting all service centers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service centers',
        error: error.message
      });
    }
  }

  // Get a service center by ID
  async getServiceCenterById(req, res) {
    try {
      const { id } = req.params;
      const serviceCenter = await serviceCenterService.getServiceCenterById(id);
      
      if (!serviceCenter) {
        return res.status(404).json({
          success: false,
          message: `Service center with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        data: serviceCenter
      });
    } catch (error) {
      console.error(`Error getting service center with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service center',
        error: error.message
      });
    }
  }

  // Get service center by user ID (from Firebase Auth)
  async getServiceCenterByUserId(req, res) {
    try {
      const { userId } = req.params;
      const serviceCenter = await serviceCenterService.getServiceCenterByUserId(userId);
      
      if (!serviceCenter) {
        return res.status(404).json({
          success: false, 
          message: `Service center with user ID ${userId} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        data: serviceCenter
      });
    } catch (error) {
      console.error(`Error getting service center with user ID ${req.params.userId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service center',
        error: error.message
      });
    }
  }

  // Create a new service center
  async createServiceCenter(req, res) {
    try {
      const serviceCenterData = req.body;
      
      // Validate required fields
      if (!serviceCenterData.userId || !serviceCenterData.name || !serviceCenterData.email) {
        return res.status(400).json({
          success: false,
          message: 'User ID, name, and email are required fields'
        });
      }
      
      const newServiceCenter = await serviceCenterService.createServiceCenter(serviceCenterData);
      res.status(201).json({
        success: true,
        data: newServiceCenter
      });
    } catch (error) {
      console.error('Error creating service center:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create service center',
        error: error.message
      });
    }
  }

  // Update a service center
  async updateServiceCenter(req, res) {
    try {
      const { id } = req.params;
      const serviceCenterData = req.body;
      
      // Validate service center exists
      const existingServiceCenter = await serviceCenterService.getServiceCenterById(id);
      if (!existingServiceCenter) {
        return res.status(404).json({
          success: false,
          message: `Service center with ID ${id} not found`
        });
      }
      
      const updatedServiceCenter = await serviceCenterService.updateServiceCenter(id, serviceCenterData);
      res.status(200).json({
        success: true,
        data: updatedServiceCenter
      });
    } catch (error) {
      console.error(`Error updating service center with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to update service center',
        error: error.message
      });
    }
  }

  // Delete a service center
  async deleteServiceCenter(req, res) {
    try {
      const { id } = req.params;
      
      // Validate service center exists
      const existingServiceCenter = await serviceCenterService.getServiceCenterById(id);
      if (!existingServiceCenter) {
        return res.status(404).json({
          success: false,
          message: `Service center with ID ${id} not found`
        });
      }
      
      const result = await serviceCenterService.deleteServiceCenter(id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error(`Error deleting service center with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete service center',
        error: error.message
      });
    }
  }

  // Add service to a service center
  async addService(req, res) {
    try {
      const { id } = req.params;
      const serviceData = req.body;
      
      if (!serviceData.name || !serviceData.price) {
        return res.status(400).json({
          success: false,
          message: 'Service name and price are required'
        });
      }
      
      // Validate service center exists
      const existingServiceCenter = await serviceCenterService.getServiceCenterById(id);
      if (!existingServiceCenter) {
        return res.status(404).json({
          success: false,
          message: `Service center with ID ${id} not found`
        });
      }
      
      const updatedServiceCenter = await serviceCenterService.addService(id, serviceData);
      res.status(200).json({
        success: true,
        data: updatedServiceCenter
      });
    } catch (error) {
      console.error(`Error adding service to service center with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to add service',
        error: error.message
      });
    }
  }

  // Remove service from a service center
  async removeService(req, res) {
    try {
      const { id, serviceId } = req.params;
      
      // Validate service center exists
      const existingServiceCenter = await serviceCenterService.getServiceCenterById(id);
      if (!existingServiceCenter) {
        return res.status(404).json({
          success: false,
          message: `Service center with ID ${id} not found`
        });
      }
      
      const updatedServiceCenter = await serviceCenterService.removeService(id, serviceId);
      res.status(200).json({
        success: true,
        data: updatedServiceCenter
      });
    } catch (error) {
      console.error(`Error removing service from service center with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove service',
        error: error.message
      });
    }
  }

  // Add rating to a service center
  async addRating(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment, customerId } = req.body;
      
      // Validate service center exists
      const existingServiceCenter = await serviceCenterService.getServiceCenterById(id);
      if (!existingServiceCenter) {
        return res.status(404).json({
          success: false,
          message: `Service center with ID ${id} not found`
        });
      }
      
      // Validate rating
      if (!rating || rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5'
        });
      }
      
      const updatedServiceCenter = await serviceCenterService.addRating(id, Number(rating), comment, customerId);
      res.status(200).json({
        success: true,
        data: updatedServiceCenter
      });
    } catch (error) {
      console.error(`Error adding rating to service center with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to add service center rating',
        error: error.message
      });
    }
  }

  // Get service centers by city
  async getServiceCentersByCity(req, res) {
    try {
      const { city } = req.params;
      const serviceCenters = await serviceCenterService.getServiceCentersByCity(city);
      
      res.status(200).json({
        success: true,
        count: serviceCenters.length,
        data: serviceCenters
      });
    } catch (error) {
      console.error(`Error getting service centers in city ${req.params.city}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service centers by city',
        error: error.message
      });
    }
  }

  // Toggle active status of service center
  async toggleActiveStatus(req, res) {
    try {
      const { id } = req.params;
      
      // Validate service center exists
      const existingServiceCenter = await serviceCenterService.getServiceCenterById(id);
      if (!existingServiceCenter) {
        return res.status(404).json({
          success: false,
          message: `Service center with ID ${id} not found`
        });
      }
      
      const updatedServiceCenter = await serviceCenterService.toggleActiveStatus(id);
      res.status(200).json({
        success: true,
        data: updatedServiceCenter
      });
    } catch (error) {
      console.error(`Error toggling active status for service center with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle service center active status',
        error: error.message
      });
    }
  }

  // Get service center dashboard data
  async getDashboardData(req, res) {
    try {
      const { id } = req.params;
      
      // Validate service center exists
      const serviceCenter = await serviceCenterService.getServiceCenterById(id);
      if (!serviceCenter) {
        return res.status(404).json({
          success: false,
          message: `Service center with ID ${id} not found`
        });
      }
      
      // Get jobs for this service center
      const jobs = await jobService.getJobsByServiceCenterId(id);
      
      // Calculate statistics
      const completedJobs = jobs.filter(job => job.status === 'Completed').length;
      const pendingJobs = jobs.filter(job => job.status === 'Pending').length;
      const inProgressJobs = jobs.filter(job => job.status === 'In Progress').length;
      
      const jobsData = {
        total: jobs.length,
        completed: completedJobs,
        pending: pendingJobs,
        inProgress: inProgressJobs
      };
      
      res.status(200).json({
        success: true,
        data: {
          serviceCenter,
          jobs: jobs.slice(0, 5), // Return only the 5 most recent jobs
          jobsData
        }
      });
    } catch (error) {
      console.error(`Error getting dashboard data for service center with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service center dashboard data',
        error: error.message
      });
    }
  }
  
  // Get authenticated service center profile
  async getServiceCenterProfile(req, res) {
    try {
      // Get the Firebase user ID from the authenticated request
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      // Get service center by user ID
      const serviceCenter = await serviceCenterService.getServiceCenterByUserId(userId);
      if (!serviceCenter) {
        return res.status(404).json({
          success: false,
          message: 'Service center profile not found'
        });
      }

      res.status(200).json({
        success: true,
        data: serviceCenter
      });
    } catch (error) {
      console.error('Error getting service center profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service center profile',
        error: error.message
      });
    }
  }

  // Update authenticated service center profile
  async updateServiceCenterProfile(req, res) {
    try {
      const serviceCenterData = req.body;
      
      // Get the Firebase user ID from the authenticated request
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      // Get service center by user ID
      const serviceCenter = await serviceCenterService.getServiceCenterByUserId(userId);
      if (!serviceCenter) {
        return res.status(404).json({
          success: false,
          message: 'Service center profile not found'
        });
      }

      // Update the service center
      const updatedServiceCenter = await serviceCenterService.updateServiceCenter(
        serviceCenter.id,
        serviceCenterData
      );

      res.status(200).json({
        success: true,
        data: updatedServiceCenter
      });
    } catch (error) {
      console.error('Error updating service center profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update service center profile',
        error: error.message
      });
    }
  }
  // Get reports for authenticated service center
  async getServiceCenterReports(req, res) {
    try {
      // Get the Firebase user ID from the authenticated request
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      // Get service center by user ID
      const serviceCenter = await serviceCenterService.getServiceCenterByUserId(userId);
      if (!serviceCenter) {
        return res.status(404).json({
          success: false,
          message: 'Service center profile not found'
        });
      }

      // Get job statistics for this service center
      const jobs = await jobService.getJobsByServiceCenterId(serviceCenter.id);
      
      // Calculate statistics
      const completedJobs = jobs.filter(job => job.status === 'Completed').length;
      const pendingJobs = jobs.filter(job => job.status === 'Pending').length;
      const inProgressJobs = jobs.filter(job => job.status === 'In Progress').length;
      
      // Group jobs by month for revenue chart
      const monthlyJobs = {};
      const currentYear = new Date().getFullYear();
      
      jobs.forEach(job => {
        const jobDate = new Date(job.createdAt);
        if (jobDate.getFullYear() === currentYear) {
          const month = jobDate.getMonth();
          if (!monthlyJobs[month]) {
            monthlyJobs[month] = {
              count: 0,
              revenue: 0
            };
          }
          monthlyJobs[month].count += 1;
          monthlyJobs[month].revenue += parseFloat(job.totalAmount || 0);
        }
      });

      // Format monthly data for charts
      const monthlyRevenue = Array(12).fill(0).map((_, month) => ({
        month: new Date(currentYear, month).toLocaleString('default', { month: 'short' }),
        revenue: (monthlyJobs[month]?.revenue || 0).toFixed(2)
      }));

      res.status(200).json({
        success: true,
        data: {
          jobStats: {
            total: jobs.length,
            completed: completedJobs,
            pending: pendingJobs,
            inProgress: inProgressJobs
          },
          monthlyRevenue,
          recentJobs: jobs.slice(0, 5) // Return only the 5 most recent jobs
        }
      });
    } catch (error) {
      console.error('Error getting service center reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service center reports',
        error: error.message
      });
    }
  }
  
  // Get service reservations for authenticated service center
  async getServiceReservations(req, res) {
    try {
      // Get the Firebase user ID from the authenticated request
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      // Get service center by user ID
      const serviceCenter = await serviceCenterService.getServiceCenterByUserId(userId);
      if (!serviceCenter) {
        return res.status(404).json({
          success: false,
          message: 'Service center profile not found'
        });
      }

      // Get reservations for this service center from the servicereservations collection
      const db = req.app.locals.db;
      const reservationsSnapshot = await db.collection('servicereservations')
        .where('serviceCenterId', '==', serviceCenter.id)
        .orderBy('createdAt', 'desc')
        .get();
        
      const reservations = reservationsSnapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        };
      });

      res.status(200).json(reservations);
    } catch (error) {
      console.error('Error getting service reservations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service reservations',
        error: error.message
      });
    }
  }

  // Update service reservation status
  async updateReservationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['pending', 'in-progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status is required (pending, in-progress, completed, or cancelled)'
        });
      }
      
      // Get the Firebase user ID from the authenticated request
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      // Get service center by user ID
      const serviceCenter = await serviceCenterService.getServiceCenterByUserId(userId);
      if (!serviceCenter) {
        return res.status(404).json({
          success: false,
          message: 'Service center profile not found'
        });
      }

      // Update the reservation
      const db = req.app.locals.db;
      const reservationRef = db.collection('servicereservations').doc(id);
      const reservationDoc = await reservationRef.get();
      
      if (!reservationDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
      }
      
      // Verify this reservation belongs to this service center
      const reservationData = reservationDoc.data();
      if (reservationData.serviceCenterId !== serviceCenter.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this reservation'
        });
      }
      
      // Update the status
      await reservationRef.update({ 
        status,
        updatedAt: new Date().toISOString() 
      });
      
      res.status(200).json({
        success: true,
        message: 'Reservation status updated successfully'
      });
    } catch (error) {
      console.error('Error updating reservation status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update reservation status',
        error: error.message
      });
    }
  }
}

module.exports = new ServiceCenterController();