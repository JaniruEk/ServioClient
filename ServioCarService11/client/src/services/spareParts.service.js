// spareParts.service.js
import axios from 'axios';
import { auth, db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

// Helper function to generate a part number
const generatePartNumber = (name, category) => {
  const prefix = category ? category.substring(0, 3).toUpperCase() : 'GEN';
  const namePart = name ? name.substring(0, 3).toUpperCase() : 'XXX';
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${namePart}-${randomDigits}`;
};

const API_URL = 'http://localhost:5000/api';

/**
 * Spare Parts Inventory API services
 */
class SparePartsService {
  
  /**
   * Get all spare parts from Firestore
   * This directly accesses Firestore
   */
  async getSparePartsFromFirestore() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // First get service center ID from users collection
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return { success: false, error: 'User profile not found' };
      }
      
      const userData = userDoc.data();
      const serviceCenterId = userData.id || user.uid;
      
      // Query spareparts collection
      const partsQuery = query(
        collection(db, 'spareparts'),
        where('serviceCenterId', '==', serviceCenterId)
      );
      
      const partsSnapshot = await getDocs(partsQuery);
      
      const parts = [];
      partsSnapshot.forEach((doc) => {
        parts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, data: parts };
    } catch (error) {
      console.error('Error fetching spare parts from Firestore:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  }  /**
   * Add a new spare part to Firestore
   */
  async addSparePart(partData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // First get service center ID from users collection
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return { success: false, error: 'User profile not found' };
      }
      
      const userData = userDoc.data();
      const serviceCenterId = userData.serviceCenterId || userData.id || user.uid;
      
      console.log("Adding part with service center ID:", serviceCenterId);
      
      // Format and normalize the data
      const normalizedData = {
        name: partData.name || partData.partName || "",
        category: partData.category || "",
        quantity: Number(partData.quantity) || 0,
        price: Number(partData.price) || 0,
        threshold: Number(partData.threshold || partData.minStockLevel) || 5,
        image: partData.image || partData.imageUrl || "https://via.placeholder.com/150",
        partNumber: partData.partNumber || generatePartNumber(partData.name, partData.category),
        manufacturer: partData.manufacturer || "Generic",
        description: partData.description || `High quality ${partData.name || partData.partName} for optimal performance and durability.`,
        serviceCenterId, // Use consistent service center ID
        userId: user.uid, // Add userId explicitly for security rules
        userEmail: user.email, // Add user email for tracking
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add to Firestore - use try/catch specifically for this operation
      try {
        const docRef = await addDoc(collection(db, 'spareparts'), normalizedData);
        
        return { 
          success: true, 
          data: {
            id: docRef.id,
            ...normalizedData
          } 
        };
      } catch (firestoreError) {
        console.error('Firestore permission error:', firestoreError);
        
        // Provide a more detailed error message about permissions
        if (firestoreError.code === 'permission-denied') {
          return {
            success: false,
            error: `Permission denied: Your account (${user.email}) doesn't have write access to the spare parts collection. Please contact your administrator.`
          };
        }
        
        throw firestoreError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error('Error adding spare part to Firestore:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  }

  /**
   * Update a spare part in Firestore
   */
  async updateSparePart(partId, partData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Format and normalize the data
      const normalizedData = {
        name: partData.name || partData.partName || "",
        category: partData.category || "",
        quantity: Number(partData.quantity) || 0,
        price: Number(partData.price) || 0,
        threshold: Number(partData.threshold || partData.minStockLevel) || 5,
        image: partData.image || partData.imageUrl || "https://via.placeholder.com/150",
        partNumber: partData.partNumber || "",
        manufacturer: partData.manufacturer || "",
        description: partData.description || "",
        updatedAt: new Date()
      };

      // Update in Firestore
      const partRef = doc(db, 'spareparts', partId);
      await updateDoc(partRef, normalizedData);
      
      return { 
        success: true, 
        data: {
          id: partId,
          ...normalizedData
        } 
      };
    } catch (error) {
      console.error('Error updating spare part in Firestore:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  }

  /**
   * Delete a spare part from Firestore
   */
  async deleteSparePart(partId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'spareparts', partId));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting spare part from Firestore:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  }

  /**
   * Load default spare parts if none exist
   */
  async loadDefaultSpareParts() {
    try {
      const result = await this.getSparePartsFromFirestore();
      
      // If there are already parts, don't add defaults
      if (result.success && result.data && result.data.length > 0) {
        return { success: true, message: 'Parts already exist' };
      }
      
      // Default spare parts to add
      const defaultParts = [
        { name: "Oil Filter", category: "Engine", quantity: 45, price: 15.99, threshold: 10, image: "https://m.media-amazon.com/images/I/71cJ6UWFdTL._AC_UF894,1000_QL80_.jpg" },
        { name: "Brake Pad Set", category: "Brakes", quantity: 12, price: 45.50, threshold: 5, image: "https://m.media-amazon.com/images/I/71eTWRPbiGL._AC_UF894,1000_QL80_.jpg" },
        { name: "Air Filter", category: "Engine", quantity: 30, price: 12.99, threshold: 8, image: "https://m.media-amazon.com/images/I/81kou0ZS7sL._AC_UF894,1000_QL80_.jpg" },
        { name: "Spark Plugs", category: "Ignition", quantity: 8, price: 7.99, threshold: 10, image: "https://m.media-amazon.com/images/I/41drotzZZTL._AC_.jpg" },
      ];
      
      // Add each default part
      for (const part of defaultParts) {
        await this.addSparePart(part);
      }
      
      return { success: true, message: 'Default parts added' };
    } catch (error) {
      console.error('Error loading default spare parts:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  }
}

export default new SparePartsService();
