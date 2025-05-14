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
   */
  async updateServiceCenterProfile(serviceCenterData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
        const token = await getIdToken(user);
      const response = await axios.put(`${API_URL}/service-centers/profile`, serviceCenterData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000 // 5 seconds timeout
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating service center profile:', error);
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