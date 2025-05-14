import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Technician API services
export const getTechnicianByUserId = async (userId) => {
  try {
    // Reduced timeout for faster loading
    const response = await axios.get(`${API_URL}/technicians/user/${userId}`, { timeout: 1000 });
    return response.data;
  } catch (error) {
    // Instead of trying multiple endpoints and doing health checks, simply return error
    console.warn('Could not fetch technician data from backend:', error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      isNetworkError: error.message && (
        error.message.includes('Network Error') || 
        error.message.includes('timeout') || 
        error.message.includes('ECONNREFUSED')
      )
    };
  }
};

export const updateTechnician = async (id, technicianData) => {
  try {
    const response = await axios.put(`${API_URL}/technicians/${id}`, technicianData);
    return response.data;
  } catch (error) {
    console.error('Error updating technician data:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const updateTechnicianAvailability = async (id, availability) => {
  try {
    const response = await axios.put(`${API_URL}/technicians/${id}/availability`, { availability });
    return response.data;
  } catch (error) {
    console.error('Error updating technician availability:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const getTechnicianDashboard = async (technicianId) => {
  try {
    // Add shorter timeout to prevent long waiting
    const response = await axios.get(`${API_URL}/technicians/${technicianId}/dashboard`, { timeout: 1000 });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

// Job API services
export const getJobsByTechnician = async (technicianId) => {
  try {
    const response = await axios.get(`${API_URL}/jobs/technician/${technicianId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching technician jobs:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const getJobsByTechnicianAndStatus = async (technicianId, status) => {
  try {
    const response = await axios.get(`${API_URL}/jobs/technician/${technicianId}/status/${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching technician jobs by status:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const updateJobStatus = async (jobId, status, notes) => {
  try {
    const response = await axios.put(`${API_URL}/jobs/${jobId}/status`, { status });
    if (notes && notes.trim() !== '') {
      await axios.put(`${API_URL}/jobs/${jobId}/notes`, { notes });
    }
    return response.data;
  } catch (error) {
    console.error('Error updating job status:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const getJobStatsForTechnician = async (technicianId) => {
  try {
    const response = await axios.get(`${API_URL}/jobs/technician/${technicianId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job statistics:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const getJobById = async (jobId) => {
  try {
    const response = await axios.get(`${API_URL}/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job details:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const deleteJob = async (jobId) => {
  try {
    const response = await axios.delete(`${API_URL}/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting job:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};
