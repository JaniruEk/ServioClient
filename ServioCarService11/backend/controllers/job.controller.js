const jobService = require('../services/job.service');
const technicianService = require('../services/technician.service');

class JobController {
  // Get all jobs
  async getAllJobs(req, res) {
    try {
      const jobs = await jobService.getAllJobs();
      res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
      console.error('Error getting all jobs:', error);
      res.status(500).json({ success: false, message: 'Failed to get jobs', error: error.message });
    }
  }

  // Get a job by ID
  async getJobById(req, res) {
    try {
      const { id } = req.params;
      const job = await jobService.getJobById(id);
      
      if (!job) {
        return res.status(404).json({ success: false, message: `Job with ID ${id} not found` });
      }
      
      res.status(200).json({ success: true, data: job });
    } catch (error) {
      console.error(`Error getting job with ID ${req.params.id}:`, error);
      res.status(500).json({ success: false, message: 'Failed to get job', error: error.message });
    }
  }

  // Create a new job
  async createJob(req, res) {
    try {
      const jobData = req.body;
      
      // Validate required fields
      if (!jobData.vehicle || !jobData.service) {
        return res.status(400).json({ success: false, message: 'Vehicle and service are required fields' });
      }
      
      // If technician ID is provided, verify it exists
      if (jobData.technicianId) {
        const technician = await technicianService.getTechnicianById(jobData.technicianId);
        if (!technician) {
          return res.status(400).json({ success: false, message: `Technician with ID ${jobData.technicianId} not found` });
        }
      }
      
      const newJob = await jobService.createJob(jobData);
      res.status(201).json({ success: true, data: newJob });
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ success: false, message: 'Failed to create job', error: error.message });
    }
  }

  // Update a job
  async updateJob(req, res) {
    try {
      const { id } = req.params;
      const jobData = req.body;
      
      // Validate job exists
      const existingJob = await jobService.getJobById(id);
      if (!existingJob) {
        return res.status(404).json({ success: false, message: `Job with ID ${id} not found` });
      }
      
      // If technician ID is being updated, verify it exists
      if (jobData.technicianId && jobData.technicianId !== existingJob.technicianId) {
        const technician = await technicianService.getTechnicianById(jobData.technicianId);
        if (!technician) {
          return res.status(400).json({ success: false, message: `Technician with ID ${jobData.technicianId} not found` });
        }
      }
      
      const updatedJob = await jobService.updateJob(id, jobData);
      res.status(200).json({ success: true, data: updatedJob });
    } catch (error) {
      console.error(`Error updating job with ID ${req.params.id}:`, error);
      res.status(500).json({ success: false, message: 'Failed to update job', error: error.message });
    }
  }

  // Update job status
  async updateJobStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, technicianId } = req.body;
      
      // Validate status
      const validStatuses = ['Pending', 'In Progress', 'Completed', 'Declined'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}` });
      }
      
      // Validate job exists
      const existingJob = await jobService.getJobById(id);
      if (!existingJob) {
        return res.status(404).json({ success: false, message: `Job with ID ${id} not found` });
      }
      
      // If technician ID is provided and job is being set to "In Progress", verify technician exists
      if (status === 'In Progress' && technicianId) {
        const technician = await technicianService.getTechnicianById(technicianId);
        if (!technician) {
          return res.status(400).json({ success: false, message: `Technician with ID ${technicianId} not found` });
        }
      }
      
      const updatedJob = await jobService.updateJobStatus(id, status, technicianId);
      
      // If job is completed, update technician's completed jobs count
      if (status === 'Completed' && updatedJob.technicianId) {
        await technicianService.incrementJobsCompleted(updatedJob.technicianId);
      }
      
      res.status(200).json({ success: true, data: updatedJob });
    } catch (error) {
      console.error(`Error updating status for job with ID ${req.params.id}:`, error);
      res.status(500).json({ success: false, message: 'Failed to update job status', error: error.message });
    }
  }

  // Delete a job
  async deleteJob(req, res) {
    try {
      const { id } = req.params;
      
      // Validate job exists
      const existingJob = await jobService.getJobById(id);
      if (!existingJob) {
        return res.status(404).json({ success: false, message: `Job with ID ${id} not found` });
      }
      
      const result = await jobService.deleteJob(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error(`Error deleting job with ID ${req.params.id}:`, error);
      res.status(500).json({ success: false, message: 'Failed to delete job', error: error.message });
    }
  }

  // Get jobs by technician ID
  async getJobsByTechnician(req, res) {
    try {
      const { technicianId } = req.params;
      
      // Validate technician exists
      const technician = await technicianService.getTechnicianById(technicianId);
      if (!technician) {
        return res.status(404).json({ success: false, message: `Technician with ID ${technicianId} not found` });
      }
      
      const jobs = await jobService.getJobsByTechnician(technicianId);
      res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
      console.error(`Error getting jobs for technician with ID ${req.params.technicianId}:`, error);
      res.status(500).json({ success: false, message: 'Failed to get technician jobs', error: error.message });
    }
  }

  // Get jobs by status
  async getJobsByStatus(req, res) {
    try {
      const { status } = req.params;
      
      // Validate status
      const validStatuses = ['Pending', 'In Progress', 'Completed', 'Declined'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}` });
      }
      
      const jobs = await jobService.getJobsByStatus(status);
      res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
      console.error(`Error getting jobs with status ${req.params.status}:`, error);
      res.status(500).json({ success: false, message: 'Failed to get jobs by status', error: error.message });
    }
  }

  // Get jobs by technician and status
  async getJobsByTechnicianAndStatus(req, res) {
    try {
      const { technicianId, status } = req.params;
      
      // Validate technician exists
      const technician = await technicianService.getTechnicianById(technicianId);
      if (!technician) {
        return res.status(404).json({ success: false, message: `Technician with ID ${technicianId} not found` });
      }
      
      // Validate status
      const validStatuses = ['Pending', 'In Progress', 'Completed', 'Declined'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}` });
      }
      
      const jobs = await jobService.getJobsByTechnicianAndStatus(technicianId, status);
      res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
      console.error(`Error getting ${req.params.status} jobs for technician with ID ${req.params.technicianId}:`, error);
      res.status(500).json({ success: false, message: 'Failed to get technician jobs by status', error: error.message });
    }
  }

  // Get job statistics for a technician
  async getJobStatsForTechnician(req, res) {
    try {
      const { technicianId } = req.params;
      
      // Validate technician exists
      const technician = await technicianService.getTechnicianById(technicianId);
      if (!technician) {
        return res.status(404).json({ success: false, message: `Technician with ID ${technicianId} not found` });
      }
      
      const stats = await jobService.getJobStatsForTechnician(technicianId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error(`Error getting job stats for technician with ID ${req.params.technicianId}:`, error);
      res.status(500).json({ success: false, message: 'Failed to get job statistics', error: error.message });
    }
  }

  // Add notes to a job
  async addJobNotes(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      
      // Validate job exists
      const existingJob = await jobService.getJobById(id);
      if (!existingJob) {
        return res.status(404).json({ success: false, message: `Job with ID ${id} not found` });
      }
      
      // Validate notes
      if (!notes || typeof notes !== 'string') {
        return res.status(400).json({ success: false, message: 'Notes must be a non-empty string' });
      }
      
      const updatedJob = await jobService.addJobNotes(id, notes);
      res.status(200).json({ success: true, data: updatedJob });
    } catch (error) {
      console.error(`Error adding notes to job with ID ${req.params.id}:`, error);
      res.status(500).json({ success: false, message: 'Failed to add job notes', error: error.message });
    }
  }
}

module.exports = new JobController();