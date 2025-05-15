// serviceCenter.service.js
import axios from 'axios';
import { auth } from '../firebase';
import { getIdToken } from 'firebase/auth';

const API_URL = 'http://localhost:5000/api';

/**
 * Service Center API services
 */
class ServiceCenterService {
  
  /**
   * Get authenticated service center profile
   */
  async getServiceCenterProfile() {
    try {
      // First check if backend is available with a short timeout
      try {
        await axios.get(`${API_URL}/health-check`, { timeout: 2000 }).catch(() => {
          // If health check endpoint doesn't exist, try another endpoint
          return axios.get(`${API_URL}/service-centers`, { timeout: 2000 });
        });
      } catch (err) {
        console.warn('Backend server appears to be offline:', err.message);
        return { 
          success: false, 
          error: 'Backend server unavailable. Please check if the server is running.',
          isNetworkError: true
        };
      }
      
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
        const token = await getIdToken(user);
      const response = await axios.get(`${API_URL}/service-centers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching service center profile:', error);
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
  }
    /**
   * Update service center profile
   * @param {Object} serviceCenterData - The service center profile data to update
   * @return {Object} Response object with success status and data
   */
  async updateServiceCenterProfile(serviceCenterData) {
    try {
      // First check if backend is available with a short timeout
      try {
        await axios.get(`${API_URL}/health-check`, { timeout: 2000 }).catch(() => {
          // If health check endpoint doesn't exist, try another endpoint
          return axios.get(`${API_URL}/service-centers`, { timeout: 2000 });
        });
      } catch (err) {
        console.warn('Backend server appears to be offline:', err.message);
        return { 
          success: false, 
          error: 'Backend server unavailable. Profile updated in Firebase only.',
          isNetworkError: true
        };
      }
      
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Validate essential data before sending to server
      if (!serviceCenterData.name || !serviceCenterData.email) {
        return { 
          success: false, 
          error: 'Name and email are required fields' 
        };
      }
      
      const token = await getIdToken(user);
      const response = await axios.put(`${API_URL}/service-centers/profile`, serviceCenterData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000 // 8 seconds timeout to allow more time for update
      });
      
      if (response.data && response.data.success === false) {
        return {
          success: false,
          error: response.data.message || 'Server returned failure status'
        };
      }
      
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error updating service center profile:', error);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          error: error.response.data?.message || `Server error: ${error.response.status}`,
          statusCode: error.response.status
        };
      } else if (error.request) {
        // The request was made but no response was received
        return { 
          success: false, 
          error: 'No response received from server. Please try again later.',
          isNetworkError: true
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return { 
          success: false, 
          error: error.message || 'An unknown error occurred',
          isNetworkError: error.message && (
            error.message.includes('Network Error') || 
            error.message.includes('timeout') || 
            error.message.includes('ECONNREFUSED')
          )
        };
      }
    }
  }
  /**
   * Get service center reports data
   */
  async getServiceCenterReports() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
        const token = await getIdToken(user);
      const response = await axios.get(`${API_URL}/service-centers/reports`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching service center reports:', error);
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
  }
  
  /**
   * Get service reservations for the authenticated service center
   */
  async getServiceReservations() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      const token = await getIdToken(user);
      const response = await axios.get(`${API_URL}/service-centers/reservations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching service reservations:', error);
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
  }
  
  /**
   * Get service reservations directly from Firestore
   * This bypasses the backend to directly access Firestore
   */
  async getServiceReservationsFromFirestore() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Import necessary Firestore functions
      const { collection, query, where, getDocs, getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      // First get service center ID from users collection
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return { success: false, error: 'User profile not found' };
      }
      
      const userData = userDoc.data();
      
      // Query service reservations collection
      const reservationsQuery = query(
        collection(db, 'servicereservations'),
        where('serviceCenterId', '==', userData.id || user.uid)
      );
      
      const reservationsSnapshot = await getDocs(reservationsQuery);
      
      const reservations = [];
      reservationsSnapshot.forEach((doc) => {
        reservations.push({
          id: doc.id,
          ...doc.data(),
          // Format date if needed
          formattedDate: doc.data().serviceDate ? new Date(doc.data().serviceDate).toLocaleDateString() : 'No date'
        });
      });
      
      return { success: true, data: reservations };
    } catch (error) {
      console.error('Error fetching service reservations from Firestore:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  }
  
  /**
   * Update service reservation status
   */
  async updateReservationStatus(reservationId, status) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      const token = await getIdToken(user);
      const response = await axios.put(`${API_URL}/service-centers/reservations/${reservationId}/status`, 
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating reservation status:', error);
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
  }
}

// Create a singleton instance
const serviceCenterService = new ServiceCenterService();

// Export the instance as default
export default serviceCenterService;