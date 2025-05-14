import axios from 'axios';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const API_URL = 'http://localhost:5000/api';

/**
 * Service to synchronize Firebase Auth users with backend database
 */
export const syncTechnicianData = async (userId) => {
  try {
    if (!userId) {
      console.error('User ID is required for syncing data');
      return { success: false, error: 'User ID is required' };
    }
    
    // First check if we can reach the backend with a much shorter timeout
    let backendAvailable = true;
    try {
      await axios.get(`${API_URL}/health-check`, { timeout: 1000 }).catch(() => {
        // If health check endpoint doesn't exist, try another endpoint
        return axios.get(`${API_URL}/technicians`, { timeout: 1000 });
      });
    } catch (err) {
      console.warn('Backend server not available, running in offline mode:', err.message);
      backendAvailable = false;
      return { success: false, error: 'Backend server not available', isNetworkError: true };
    }
    
    // Get the user data from Firebase
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      console.error('User not found in Firebase');
      return { success: false, error: 'User not found in Firebase' };
    }
    
    const userData = userDocSnap.data();
    
    try {
      // First, check if the technician exists in the backend
      const techResponse = await axios.get(`${API_URL}/technicians/user/${userId}`);
      
      // If the technician exists in the backend
      if (techResponse.data && techResponse.data.success && techResponse.data.data) {
        const technicianData = techResponse.data.data;
        
        // Update backend with any new Firebase data
        const updateData = {
          fullName: userData.name || userData.displayName || technicianData.fullName,
          email: userData.email || technicianData.email,
          specialization: userData.specialization || technicianData.specialization || "General Automotive",
          age: userData.age || technicianData.age,
          contactNumber: userData.contactNumber || userData.phone || technicianData.contactNumber,
        };
        
        try {
          const updateResponse = await axios.put(`${API_URL}/technicians/${technicianData._id}`, updateData);
          
          // Update Firebase with the technician ID if it's missing
          if (!userData.technicianId) {
            await updateDoc(userDocRef, {
              technicianId: technicianData._id,
              lastSynced: new Date().toISOString()
            });
          }
          
          return { success: true, data: updateResponse.data.data || technicianData };
        } catch (updateError) {
          console.error('Error updating technician data:', updateError);
          // Return the original data if update fails
          return { success: true, data: technicianData };
        }
      } else {
        // Technician doesn't exist in the backend, create a new one
        const technicianData = {
          userId: userId,
          fullName: userData.name || userData.displayName || "New Technician",
          email: userData.email || "",
          specialization: userData.specialization || "General Automotive",
          age: userData.age || null,
          contactNumber: userData.contactNumber || userData.phone || "",
          availability: "Available",
        };
        
        try {
          // Create the technician in the backend
          const createResponse = await axios.post(`${API_URL}/technicians`, technicianData);
          
          if (createResponse.data && createResponse.data.success) {
            // Update the Firebase user with the technician ID
            await updateDoc(userDocRef, {
              technicianId: createResponse.data.data._id,
              lastSynced: new Date().toISOString()
            });
            
            return { success: true, data: createResponse.data.data };
          } else {
            console.error('Failed to create technician record in backend');
            return { success: false, error: 'Failed to create technician record in backend' };
          }
        } catch (createError) {
          console.error('Error creating technician:', createError);
          return { success: false, error: createError.message };
        }
      }
    } catch (apiError) {
      // If we can't connect to the backend API, return a more helpful error
      console.error('Error connecting to backend API:', apiError);
      
      // Try to create a default technician profile based on Firebase data
      const defaultTechnician = {
        _id: 'local-' + Date.now(),
        userId: userId,
        fullName: userData.name || userData.displayName || "New Technician",
        email: userData.email || "",
        specialization: userData.specialization || "General Automotive",
        contactNumber: userData.contactNumber || userData.phone || "",
        availability: "Available",
        isLocalProfile: true // Flag to indicate this is a local profile
      };
      
      return { 
        success: false, 
        error: 'Unable to connect to the backend server. Using local profile.', 
        data: defaultTechnician 
      };
    }
    
  } catch (error) {
    console.error('Error syncing technician data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sync job data between Firebase bookings and backend jobs
 */
export const syncJobData = async (technicianId) => {
  try {
    if (!technicianId) {
      console.error('Technician ID is required for syncing job data');
      return { success: false, error: 'Technician ID is required' };
    }
    
    // First check if we can reach the backend
    let backendAvailable = true;
    try {
      await axios.get(`${API_URL}/health-check`, { timeout: 3000 }).catch(() => {
        // If health check endpoint doesn't exist, try another endpoint
        return axios.get(`${API_URL}/jobs`, { timeout: 3000 });
      });
    } catch (err) {
      console.warn('Backend server not available for job sync, running in offline mode:', err.message);
      backendAvailable = false;
      return { success: false, error: 'Backend server not available', isNetworkError: true };
    }
    
    // Get jobs from Firebase
    const jobsQuery = query(
      collection(db, "technicianreservations"),
      where("technicianId", "==", technicianId)
    );
    
    const jobsSnapshot = await getDocs(jobsQuery);
    
    if (jobsSnapshot.empty) {
      console.log('No jobs found in Firebase for technician:', technicianId);
      return { success: true, data: [] };
    }
    
    // Extract job data from Firebase
    const jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    try {
      // Push the jobs to the backend
      const response = await axios.post(`${API_URL}/jobs/sync`, {
        technicianId,
        jobs
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error syncing jobs with backend:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        data: jobs // Return the Firebase jobs anyway so they can be used
      };
    }
  } catch (error) {
    console.error('Error in syncJobData:', error);
    return { success: false, error: error.message };
  }
};
