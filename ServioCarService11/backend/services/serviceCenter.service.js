const admin = require('firebase-admin');
const ServiceCenterModel = require('../models/serviceCenter.model');

class ServiceCenterService {
  constructor() {
    this.db = admin.firestore();
    this.serviceCentersCollection = this.db.collection('serviceCenters');
    this.usersCollection = this.db.collection('users');
  }

  // Get all service centers
  async getAllServiceCenters() {
    try {
      const snapshot = await this.serviceCentersCollection.get();
      return snapshot.docs.map(doc => ServiceCenterModel.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting service centers:', error);
      throw error;
    }
  }

  // Get a service center by ID
  async getServiceCenterById(serviceCenterId) {
    try {
      const doc = await this.serviceCentersCollection.doc(serviceCenterId).get();
      if (!doc.exists) {
        return null;
      }
      return ServiceCenterModel.fromFirestore(doc);
    } catch (error) {
      console.error(`Error getting service center with ID ${serviceCenterId}:`, error);
      throw error;
    }
  }

  // Get service center by user ID (from Firebase Auth)
  async getServiceCenterByUserId(userId) {
    try {
      const snapshot = await this.serviceCentersCollection
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }
      
      return ServiceCenterModel.fromFirestore(snapshot.docs[0]);
    } catch (error) {
      console.error(`Error getting service center with user ID ${userId}:`, error);
      throw error;
    }
  }

  // Create a new service center
  async createServiceCenter(serviceCenterData) {
    try {
      // Check if a user document exists for this user ID
      if (serviceCenterData.userId) {
        const userDoc = await this.usersCollection.doc(serviceCenterData.userId).get();
        if (!userDoc.exists) {
          throw new Error(`User with ID ${serviceCenterData.userId} does not exist`);
        }
      }

      const serviceCenterModel = new ServiceCenterModel(serviceCenterData);
      const docRef = await this.serviceCentersCollection.add(serviceCenterModel.toFirestore());
      
      // Update the service center with the generated ID
      const generatedId = docRef.id;
      serviceCenterModel.id = generatedId;
      await docRef.update({ id: generatedId });
      
      return serviceCenterModel;
    } catch (error) {
      console.error('Error creating service center:', error);
      throw error;
    }
  }

  // Update a service center
  async updateServiceCenter(serviceCenterId, serviceCenterData) {
    try {
      const docRef = this.serviceCentersCollection.doc(serviceCenterId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Service center with ID ${serviceCenterId} not found`);
      }
      
      // Create a service center model with existing data and new updates
      const existingData = doc.data();
      const updatedModel = new ServiceCenterModel({
        ...existingData,
        ...serviceCenterData,
        updatedAt: new Date().toISOString()
      });
      
      await docRef.update(updatedModel.toFirestore());
      return updatedModel;
    } catch (error) {
      console.error(`Error updating service center with ID ${serviceCenterId}:`, error);
      throw error;
    }
  }

  // Delete a service center
  async deleteServiceCenter(serviceCenterId) {
    try {
      const docRef = this.serviceCentersCollection.doc(serviceCenterId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Service center with ID ${serviceCenterId} not found`);
      }
      
      await docRef.delete();
      return { id: serviceCenterId, deleted: true };
    } catch (error) {
      console.error(`Error deleting service center with ID ${serviceCenterId}:`, error);
      throw error;
    }
  }

  // Add a service to a service center
  async addService(serviceCenterId, serviceData) {
    try {
      const docRef = this.serviceCentersCollection.doc(serviceCenterId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Service center with ID ${serviceCenterId} not found`);
      }
      
      // Add a unique ID to the service
      const serviceId = Date.now().toString();
      const newService = {
        id: serviceId,
        ...serviceData,
        createdAt: new Date().toISOString()
      };
      
      await docRef.update({
        services: admin.firestore.FieldValue.arrayUnion(newService),
        updatedAt: new Date().toISOString()
      });
      
      // Get the updated document
      const updatedDoc = await docRef.get();
      return ServiceCenterModel.fromFirestore(updatedDoc);
    } catch (error) {
      console.error(`Error adding service to service center with ID ${serviceCenterId}:`, error);
      throw error;
    }
  }

  // Remove a service from a service center
  async removeService(serviceCenterId, serviceId) {
    try {
      const docRef = this.serviceCentersCollection.doc(serviceCenterId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Service center with ID ${serviceCenterId} not found`);
      }
      
      const serviceCenterData = doc.data();
      const services = serviceCenterData.services || [];
      
      // Find and remove the service with the given ID
      const updatedServices = services.filter(service => service.id !== serviceId);
      
      if (updatedServices.length === services.length) {
        throw new Error(`Service with ID ${serviceId} not found in service center`);
      }
      
      await docRef.update({
        services: updatedServices,
        updatedAt: new Date().toISOString()
      });
      
      // Get the updated document
      const updatedDoc = await docRef.get();
      return ServiceCenterModel.fromFirestore(updatedDoc);
    } catch (error) {
      console.error(`Error removing service from service center with ID ${serviceCenterId}:`, error);
      throw error;
    }
  }

  // Add rating to a service center
  async addRating(serviceCenterId, rating, comment = '', customerId = null) {
    try {
      const docRef = this.serviceCentersCollection.doc(serviceCenterId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Service center with ID ${serviceCenterId} not found`);
      }
      
      const serviceCenterModel = ServiceCenterModel.fromFirestore(doc);
      serviceCenterModel.addRating(rating, comment, customerId);
      
      await docRef.update({
        ratings: serviceCenterModel.ratings,
        averageRating: serviceCenterModel.averageRating,
        updatedAt: new Date().toISOString()
      });
      
      return serviceCenterModel;
    } catch (error) {
      console.error(`Error adding rating to service center with ID ${serviceCenterId}:`, error);
      throw error;
    }
  }

  // Get service center by location (city)
  async getServiceCentersByCity(city) {
    try {
      const snapshot = await this.serviceCentersCollection
        .where('city', '==', city)
        .where('isActive', '==', true)
        .get();
      
      return snapshot.docs.map(doc => ServiceCenterModel.fromFirestore(doc));
    } catch (error) {
      console.error(`Error getting service centers in city ${city}:`, error);
      throw error;
    }
  }
  
  // Toggle active status of a service center
  async toggleActiveStatus(serviceCenterId) {
    try {
      const docRef = this.serviceCentersCollection.doc(serviceCenterId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Service center with ID ${serviceCenterId} not found`);
      }
      
      const serviceCenterData = doc.data();
      const newStatus = !serviceCenterData.isActive;
      
      await docRef.update({
        isActive: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Get the updated document
      const updatedDoc = await docRef.get();
      return ServiceCenterModel.fromFirestore(updatedDoc);
    } catch (error) {
      console.error(`Error toggling active status for service center with ID ${serviceCenterId}:`, error);
      throw error;
    }
  }
}

module.exports = new ServiceCenterService();