const { db } = require('../firebase.config');
const VehiclePartsRequestModel = require('../models/vehicleParts.model');

class VehiclePartsService {
  constructor() {
    this.collection = db.collection('vehiclePartsRequests');
  }

  // Create a new parts request
  async createRequest(requestData) {
    try {
      const requestModel = new VehiclePartsRequestModel(requestData);
      const { isValid, errors } = requestModel.validate();
      
      if (!isValid) {
        throw new Error(`Invalid request data: ${errors.join(', ')}`);
      }

      const docRef = await this.collection.add(requestModel.toFirestore());
      const newRequestData = { ...requestModel.toFirestore(), id: docRef.id };
      
      // Update the document with its ID
      await docRef.update({ id: docRef.id });
      
      return newRequestData;
    } catch (error) {
      console.error('Error creating parts request:', error);
      throw error;
    }
  }

  // Get all parts requests
  async getAllRequests() {
    try {
      const snapshot = await this.collection.orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => VehiclePartsRequestModel.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting all parts requests:', error);
      throw error;
    }
  }

  // Get a parts request by ID
  async getRequestById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return VehiclePartsRequestModel.fromFirestore(doc);
    } catch (error) {
      console.error(`Error getting parts request with ID ${id}:`, error);
      throw error;
    }
  }

  // Update a parts request
  async updateRequest(id, requestData) {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Parts request with ID ${id} not found`);
      }
      
      const currentData = VehiclePartsRequestModel.fromFirestore(doc);
      const updatedData = new VehiclePartsRequestModel({
        ...currentData,
        ...requestData,
        id
      });
      
      const { isValid, errors } = updatedData.validate();
      if (!isValid) {
        throw new Error(`Invalid request data: ${errors.join(', ')}`);
      }
      
      await docRef.update(updatedData.toFirestore());
      return updatedData;
    } catch (error) {
      console.error(`Error updating parts request with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a parts request
  async deleteRequest(id) {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Parts request with ID ${id} not found`);
      }
      
      await docRef.delete();
      return { id, deleted: true };
    } catch (error) {
      console.error(`Error deleting parts request with ID ${id}:`, error);
      throw error;
    }
  }

  // Get parts requests by technician ID
  async getRequestsByTechnician(technicianId) {
    try {
      const snapshot = await this.collection
        .where('technicianId', '==', technicianId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => VehiclePartsRequestModel.fromFirestore(doc));
    } catch (error) {
      console.error(`Error getting parts requests for technician with ID ${technicianId}:`, error);
      throw error;
    }
  }

  // Get parts requests by status
  async getRequestsByStatus(status) {
    try {
      const snapshot = await this.collection
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => VehiclePartsRequestModel.fromFirestore(doc));
    } catch (error) {
      console.error(`Error getting parts requests with status ${status}:`, error);
      throw error;
    }
  }

  // Get parts requests by urgency
  async getRequestsByUrgency(urgency) {
    try {
      const snapshot = await this.collection
        .where('urgency', '==', urgency)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => VehiclePartsRequestModel.fromFirestore(doc));
    } catch (error) {
      console.error(`Error getting parts requests with urgency ${urgency}:`, error);
      throw error;
    }
  }

  // Get parts requests by job ID
  async getRequestsByJob(jobId) {
    try {
      const snapshot = await this.collection
        .where('jobId', '==', jobId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => VehiclePartsRequestModel.fromFirestore(doc));
    } catch (error) {
      console.error(`Error getting parts requests for job with ID ${jobId}:`, error);
      throw error;
    }
  }

  // Update request status
  async updateRequestStatus(id, status) {
    try {
      const validStatuses = ['Pending', 'Approved', 'Received', 'Rejected'];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Parts request with ID ${id} not found`);
      }
      
      await docRef.update({
        status,
        updatedAt: new Date().toISOString()
      });
      
      // Get the updated request
      const updatedDoc = await docRef.get();
      return VehiclePartsRequestModel.fromFirestore(updatedDoc);
    } catch (error) {
      console.error(`Error updating status for parts request with ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new VehiclePartsService();