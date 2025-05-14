const { db } = require('../firebase.config');
const JobModel = require('../models/job.model');

class JobService {
  constructor() {
    this.collection = db.collection('jobs');
  }

  // Create a new job
  async createJob(jobData) {
    try {
      const jobModel = new JobModel(jobData);
      const { isValid, errors } = jobModel.validate();
      
      if (!isValid) {
        throw new Error(`Invalid job data: ${errors.join(', ')}`);
      }

      const docRef = await this.collection.add(jobModel.toFirestore());
      const newJobData = { ...jobModel.toFirestore(), id: docRef.id };
      
      // Update the document with its ID
      await docRef.update({ id: docRef.id });
      
      return newJobData;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  // Get all jobs
  async getAllJobs() {
    try {
      const snapshot = await this.collection.orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => JobModel.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting all jobs:', error);
      throw error;
    }
  }

  // Get a job by ID
  async getJobById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return JobModel.fromFirestore(doc);
    } catch (error) {
      console.error(`Error getting job with ID ${id}:`, error);
      throw error;
    }
  }

  // Update a job
  async updateJob(id, jobData) {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Job with ID ${id} not found`);
      }
      
      const currentData = JobModel.fromFirestore(doc);
      const updatedData = new JobModel({
        ...currentData,
        ...jobData,
        id
      });
      
      const { isValid, errors } = updatedData.validate();
      if (!isValid) {
        throw new Error(`Invalid job data: ${errors.join(', ')}`);
      }
      
      await docRef.update(updatedData.toFirestore());
      return updatedData;
    } catch (error) {
      console.error(`Error updating job with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a job
  async deleteJob(id) {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Job with ID ${id} not found`);
      }
      
      await docRef.delete();
      return { id, deleted: true };
    } catch (error) {
      console.error(`Error deleting job with ID ${id}:`, error);
      throw error;
    }
  }

  // Get jobs by technician
  async getJobsByTechnician(technicianId) {
    try {
      const snapshot = await this.collection
        .where('technicianId', '==', technicianId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => JobModel.fromFirestore(doc));
    } catch (error) {
      console.error(`Error getting jobs for technician with ID ${technicianId}:`, error);
      throw error;
    }
  }

  // Get jobs by service center
  async getJobsByServiceCenter(serviceCenterId) {
    try {
      const snapshot = await this.collection
        .where('serviceCenterId', '==', serviceCenterId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => JobModel.fromFirestore(doc));
    } catch (error) {
      console.error(`Error getting jobs for service center with ID ${serviceCenterId}:`, error);
      throw error;
    }
  }

  // Get jobs by status
  async getJobsByStatus(status) {
    try {
      const snapshot = await this.collection
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => JobModel.fromFirestore(doc));
    } catch (error) {
      console.error(`Error getting jobs with status ${status}:`, error);
      throw error;
    }
  }

  // Get jobs by date range
  async getJobsByDateRange(startDate, endDate) {
    try {
      // Format dates if they're not already YYYY-MM-DD format
      if (startDate instanceof Date) {
        startDate = startDate.toISOString().split('T')[0];
      }
      
      if (endDate instanceof Date) {
        endDate = endDate.toISOString().split('T')[0];
      }
      
      const snapshot = await this.collection
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .orderBy('date')
        .get();
      
      return snapshot.docs.map(doc => JobModel.fromFirestore(doc));
    } catch (error) {
      console.error(`Error getting jobs between ${startDate} and ${endDate}:`, error);
      throw error;
    }
  }

  // Update job status
  async updateJobStatus(id, status, notes = null) {
    try {
      const validStatuses = ['Pending', 'In Progress', 'Completed', 'Declined'];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      const updateData = { 
        status,
        updatedAt: new Date().toISOString()
      };
      
      // Add notes if provided
      if (notes) {
        updateData.notes = notes;
      }
      
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Job with ID ${id} not found`);
      }
      
      await docRef.update(updateData);
      
      // Get the updated job
      const updatedDoc = await docRef.get();
      return JobModel.fromFirestore(updatedDoc);
    } catch (error) {
      console.error(`Error updating status for job with ID ${id}:`, error);
      throw error;
    }
  }

  // Get job statistics for a technician
  async getJobStatsForTechnician(technicianId) {
    try {
      const jobs = await this.getJobsByTechnician(technicianId);
      
      // Calculate stats
      const stats = {
        total: jobs.length,
        completed: 0,
        pending: 0,
        inProgress: 0,
        declined: 0,
        urgent: 0,
        statusDistribution: []
      };
      
      // Group jobs by status
      const statusCounts = {};
      
      jobs.forEach(job => {
        // Count by status
        if (!statusCounts[job.status]) {
          statusCounts[job.status] = 0;
        }
        statusCounts[job.status]++;
        
        // Count by specific status
        if (job.status === 'Completed') stats.completed++;
        if (job.status === 'Pending') stats.pending++;
        if (job.status === 'In Progress') stats.inProgress++;
        if (job.status === 'Declined') stats.declined++;
        
        // Count urgent jobs (high priority)
        if (job.priority === 'High') stats.urgent++;
      });
      
      // Format status distribution for frontend charts
      stats.statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }));
      
      return stats;
    } catch (error) {
      console.error(`Error getting job stats for technician with ID ${technicianId}:`, error);
      throw error;
    }
  }

  // Get today's jobs for a technician
  async getTodayJobsForTechnician(technicianId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const snapshot = await this.collection
        .where('technicianId', '==', technicianId)
        .where('date', '==', today)
        .orderBy('createdAt', 'desc')
        .get();
      
      const jobs = snapshot.docs.map(doc => JobModel.fromFirestore(doc));
      
      return {
        count: jobs.length,
        data: jobs
      };
    } catch (error) {
      console.error(`Error getting today's jobs for technician with ID ${technicianId}:`, error);
      throw error;
    }
  }

  // Get upcoming jobs for a technician (future dates)
  async getUpcomingJobsForTechnician(technicianId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const snapshot = await this.collection
        .where('technicianId', '==', technicianId)
        .where('date', '>', today)
        .orderBy('date')
        .get();
      
      const jobs = snapshot.docs.map(doc => JobModel.fromFirestore(doc));
      
      return {
        count: jobs.length,
        data: jobs
      };
    } catch (error) {
      console.error(`Error getting upcoming jobs for technician with ID ${technicianId}:`, error);
      throw error;
    }
  }

  // Request vehicle parts for a job
  async requestVehicleParts(jobId, partsData) {
    try {
      const docRef = this.collection.doc(jobId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Job with ID ${jobId} not found`);
      }
      
      const job = JobModel.fromFirestore(doc);
      
      // If job doesn't have parts requests array, create it
      if (!job.partsRequests) {
        job.partsRequests = [];
      }
      
      // Add new parts request
      const newRequest = {
        id: `REQ-${Date.now()}`,
        ...partsData,
        status: 'Pending',
        requestDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      job.partsRequests.push(newRequest);
      
      // Update job with new parts request
      await docRef.update({
        partsRequests: job.partsRequests,
        updatedAt: new Date().toISOString()
      });
      
      return newRequest;
    } catch (error) {
      console.error(`Error requesting parts for job with ID ${jobId}:`, error);
      throw error;
    }
  }

  // Update parts request status
  async updatePartsRequestStatus(jobId, requestId, status) {
    try {
      const validStatuses = ['Pending', 'Approved', 'Declined', 'Received'];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      const docRef = this.collection.doc(jobId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Job with ID ${jobId} not found`);
      }
      
      const job = JobModel.fromFirestore(doc);
      
      if (!job.partsRequests || !Array.isArray(job.partsRequests)) {
        throw new Error(`No parts requests found for job with ID ${jobId}`);
      }
      
      // Find the request by ID
      const requestIndex = job.partsRequests.findIndex(req => req.id === requestId);
      
      if (requestIndex === -1) {
        throw new Error(`Parts request with ID ${requestId} not found for job with ID ${jobId}`);
      }
      
      // Update the request status
      job.partsRequests[requestIndex].status = status;
      job.partsRequests[requestIndex].updatedAt = new Date().toISOString();
      
      // Update job with modified parts requests
      await docRef.update({
        partsRequests: job.partsRequests,
        updatedAt: new Date().toISOString()
      });
      
      return job.partsRequests[requestIndex];
    } catch (error) {
      console.error(`Error updating parts request status for job ${jobId}, request ${requestId}:`, error);
      throw error;
    }
  }
  
  // Get jobs by service center ID
  async getJobsByServiceCenterId(serviceCenterId) {
    try {
      const snapshot = await this.collection
        .where('serviceCenterId', '==', serviceCenterId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.empty 
        ? [] 
        : snapshot.docs.map(doc => {
            const data = doc.data();
            return new JobModel({ id: doc.id, ...data });
          });
    } catch (error) {
      console.error(`Error getting jobs for service center ${serviceCenterId}:`, error);
      throw error;
    }
  }
  
  // Get job statistics by service center ID
  async getJobStatsByServiceCenterId(serviceCenterId) {
    try {
      const jobs = await this.getJobsByServiceCenterId(serviceCenterId);
      
      // Calculate statistics
      const completed = jobs.filter(job => job.status === 'Completed').length;
      const pending = jobs.filter(job => job.status === 'Pending').length;
      const inProgress = jobs.filter(job => job.status === 'In Progress').length;
      
      // Calculate total revenue
      const totalRevenue = jobs
        .filter(job => job.status === 'Completed')
        .reduce((sum, job) => sum + parseFloat(job.totalAmount || 0), 0);
      
      return {
        total: jobs.length,
        completed,
        pending,
        inProgress,
        totalRevenue: totalRevenue.toFixed(2)
      };
    } catch (error) {
      console.error(`Error getting job stats for service center ${serviceCenterId}:`, error);
      throw error;
    }
  }
  
  // Get recent jobs by service center ID with limit
  async getRecentJobsByServiceCenterId(serviceCenterId, limit = 5) {
    try {
      const snapshot = await this.collection
        .where('serviceCenterId', '==', serviceCenterId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.empty 
        ? [] 
        : snapshot.docs.map(doc => {
            const data = doc.data();
            return new JobModel({ id: doc.id, ...data });
          });
    } catch (error) {
      console.error(`Error getting recent jobs for service center ${serviceCenterId}:`, error);
      throw error;
    }
  }
  
  // Get monthly revenue by service center ID
  async getMonthlyRevenueByServiceCenterId(serviceCenterId) {
    try {
      const jobs = await this.getJobsByServiceCenterId(serviceCenterId);
      const currentYear = new Date().getFullYear();
      
      // Group jobs by month
      const monthlyJobs = {};
      
      jobs.forEach(job => {
        if (job.status === 'Completed' && job.totalAmount) {
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
        }
      });
      
      // Format monthly data
      return Array(12).fill(0).map((_, month) => ({
        month: new Date(currentYear, month).toLocaleString('default', { month: 'short' }),
        revenue: (monthlyJobs[month]?.revenue || 0).toFixed(2),
        count: monthlyJobs[month]?.count || 0
      }));
    } catch (error) {
      console.error(`Error getting monthly revenue for service center ${serviceCenterId}:`, error);
      throw error;
    }
  }
  
  // Get service popularity by service center ID
  async getServicePopularityByServiceCenterId(serviceCenterId) {
    try {
      const jobs = await this.getJobsByServiceCenterId(serviceCenterId);
      
      // Count occurrences of each service type
      const serviceTypes = {};
      
      jobs.forEach(job => {
        if (job.serviceType) {
          if (!serviceTypes[job.serviceType]) {
            serviceTypes[job.serviceType] = 0;
          }
          serviceTypes[job.serviceType] += 1;
        }
      });
      
      // Convert to array for easier use in frontend
      return Object.entries(serviceTypes).map(([name, count]) => ({
        name,
        count,
        percentage: jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0
      })).sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error(`Error getting service popularity for service center ${serviceCenterId}:`, error);
      throw error;
    }
  }
}

module.exports = new JobService();