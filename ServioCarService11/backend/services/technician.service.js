const admin = require('firebase-admin');
const TechnicianModel = require('../models/technician.model');

class TechnicianService {
  constructor() {
    this.db = admin.firestore();
    this.techniciansCollection = this.db.collection('technicians');
    this.usersCollection = this.db.collection('users');
  }

  // Get all technicians
  async getAllTechnicians() {
    try {
      const snapshot = await this.techniciansCollection.get();
      return snapshot.docs.map(doc => TechnicianModel.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting technicians:', error);
      throw error;
    }
  }

  // Get a technician by ID
  async getTechnicianById(technicianId) {
    try {
      const doc = await this.techniciansCollection.doc(technicianId).get();
      if (!doc.exists) {
        return null;
      }
      return TechnicianModel.fromFirestore(doc);
    } catch (error) {
      console.error(`Error getting technician with ID ${technicianId}:`, error);
      throw error;
    }
  }

  // Get technician by user ID (from Firebase Auth)
  async getTechnicianByUserId(userId) {
    try {
      const snapshot = await this.techniciansCollection
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }
      
      return TechnicianModel.fromFirestore(snapshot.docs[0]);
    } catch (error) {
      console.error(`Error getting technician with user ID ${userId}:`, error);
      throw error;
    }
  }

  // Create a new technician
  async createTechnician(technicianData) {
    try {
      // Check if a user document exists for this user ID
      if (technicianData.userId) {
        const userDoc = await this.usersCollection.doc(technicianData.userId).get();
        if (!userDoc.exists) {
          throw new Error(`User with ID ${technicianData.userId} does not exist`);
        }
      }

      const technicianModel = new TechnicianModel(technicianData);
      const docRef = await this.techniciansCollection.add(technicianModel.toFirestore());
      
      // Update the technician with the generated ID
      const generatedId = docRef.id;
      technicianModel.id = generatedId;
      await docRef.update({ id: generatedId });
      
      return technicianModel;
    } catch (error) {
      console.error('Error creating technician:', error);
      throw error;
    }
  }

  // Update a technician
  async updateTechnician(technicianId, technicianData) {
    try {
      const docRef = this.techniciansCollection.doc(technicianId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Technician with ID ${technicianId} not found`);
      }
      
      // Create a technician model with existing data and new updates
      const existingData = doc.data();
      const updatedModel = new TechnicianModel({
        ...existingData,
        ...technicianData,
        updatedAt: new Date().toISOString()
      });
      
      await docRef.update(updatedModel.toFirestore());
      return updatedModel;
    } catch (error) {
      console.error(`Error updating technician with ID ${technicianId}:`, error);
      throw error;
    }
  }

  // Delete a technician
  async deleteTechnician(technicianId) {
    try {
      const docRef = this.techniciansCollection.doc(technicianId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Technician with ID ${technicianId} not found`);
      }
      
      await docRef.delete();
      return { id: technicianId, deleted: true };
    } catch (error) {
      console.error(`Error deleting technician with ID ${technicianId}:`, error);
      throw error;
    }
  }

  // Update technician availability
  async updateAvailability(technicianId, availabilityStatus) {
    try {
      const docRef = this.techniciansCollection.doc(technicianId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Technician with ID ${technicianId} not found`);
      }
      
      const updateData = {
        'availability.status': availabilityStatus,
        updatedAt: new Date().toISOString()
      };
      
      await docRef.update(updateData);
      
      // Get the updated document
      const updatedDoc = await docRef.get();
      return TechnicianModel.fromFirestore(updatedDoc);
    } catch (error) {
      console.error(`Error updating availability for technician with ID ${technicianId}:`, error);
      throw error;
    }
  }

  // Increment jobs completed count for a technician
  async incrementJobsCompleted(technicianId) {
    try {
      const docRef = this.techniciansCollection.doc(technicianId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Technician with ID ${technicianId} not found`);
      }
      
      // Use Firestore increment operation
      await docRef.update({
        jobsCompleted: admin.firestore.FieldValue.increment(1),
        updatedAt: new Date().toISOString()
      });
      
      // Get the updated document
      const updatedDoc = await docRef.get();
      return TechnicianModel.fromFirestore(updatedDoc);
    } catch (error) {
      console.error(`Error incrementing jobs completed for technician with ID ${technicianId}:`, error);
      throw error;
    }
  }

  // Get technicians by service center ID
  async getTechniciansByServiceCenter(serviceCenterId) {
    try {
      const snapshot = await this.techniciansCollection
        .where('serviceCenterId', '==', serviceCenterId)
        .get();
      
      return snapshot.docs.map(doc => TechnicianModel.fromFirestore(doc));
    } catch (error) {
      console.error(`Error getting technicians for service center ${serviceCenterId}:`, error);
      throw error;
    }
  }

  // Add rating to a technician
  async addRating(technicianId, rating, comment = '', customerId = null) {
    try {
      const docRef = this.techniciansCollection.doc(technicianId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Technician with ID ${technicianId} not found`);
      }
      
      const technicianModel = TechnicianModel.fromFirestore(doc);
      technicianModel.addRating(rating, comment, customerId);
      
      await docRef.update({
        ratings: technicianModel.ratings,
        averageRating: technicianModel.averageRating,
        updatedAt: new Date().toISOString()
      });
      
      return technicianModel;
    } catch (error) {
      console.error(`Error adding rating to technician with ID ${technicianId}:`, error);
      throw error;
    }
  }

  // Get technicians by specialization
  async getTechniciansBySpecialization(specialization) {
    try {
      const snapshot = await this.techniciansCollection
        .where('specialization', '==', specialization)
        .where('availability', '==', 'Available')
        .get();
      
      return snapshot.docs.map(doc => TechnicianModel.fromFirestore(doc));
    } catch (error) {
      console.error(`Error getting technicians with specialization ${specialization}:`, error);
      throw error;
    }
  }

  // Search technicians by name, specialization, or location
  async searchTechnicians(searchTerm) {
    try {
      // Firebase doesn't support direct text search, so we'll fetch all technicians
      // and filter in memory
      const snapshot = await this.techniciansCollection.get();
      const technicians = snapshot.docs.map(doc => TechnicianModel.fromFirestore(doc));
      
      // Convert search term to lowercase for case-insensitive matching
      const term = searchTerm.toLowerCase();
      
      // Filter technicians by name or specialization
      return technicians.filter(technician => 
        technician.fullName.toLowerCase().includes(term) || 
        technician.specialization.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error(`Error searching technicians with term ${searchTerm}:`, error);
      throw error;
    }
  }

  // Get top rated technicians
  async getTopRatedTechnicians(limit = 5) {
    try {
      const snapshot = await this.techniciansCollection
        .orderBy('averageRating', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => TechnicianModel.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting top rated technicians:', error);
      throw error;
    }
  }

  // Get technicians with most completed jobs
  async getMostExperiencedTechnicians(limit = 5) {
    try {
      const snapshot = await this.techniciansCollection
        .orderBy('jobsCompleted', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => TechnicianModel.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting most experienced technicians:', error);
      throw error;
    }
  }
}

module.exports = new TechnicianService();