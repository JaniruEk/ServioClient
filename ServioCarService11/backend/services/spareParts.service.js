// backend/services/spareParts.service.js
const { db } = require('../firebase.config');
const SparePartsModel = require('../models/spareParts.model');

class SparePartsService {
  constructor() {
    this.collection = db.collection('spareParts');
  }

  // Create a new spare part
  async createSparePart(partData) {
    try {
      const partModel = new SparePartsModel(partData);
      const { isValid, errors } = partModel.validate();
      
      if (!isValid) {
        throw new Error(`Invalid spare part data: ${errors.join(', ')}`);
      }

      const docRef = await this.collection.add(partModel.toFirestore());
      const newPartData = { ...partModel.toFirestore(), id: docRef.id };
      
      // Update the document with its ID
      await docRef.update({ id: docRef.id });
      
      return newPartData;
    } catch (error) {
      console.error('Error creating spare part:', error);
      throw error;
    }
  }

  // Get all spare parts for a service center
  async getSparePartsByServiceCenter(serviceCenterId) {
    try {
      const snapshot = await this.collection
        .where('serviceCenterId', '==', serviceCenterId)
        .orderBy('partName', 'asc')
        .get();
      
      return snapshot.docs.map(doc => SparePartsModel.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting spare parts:', error);
      throw error;
    }
  }

  // Get a spare part by ID
  async getSparePartById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return SparePartsModel.fromFirestore(doc);
    } catch (error) {
      console.error(`Error getting spare part with ID ${id}:`, error);
      throw error;
    }
  }

  // Update a spare part
  async updateSparePart(id, partData) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        throw new Error(`Spare part with ID ${id} not found`);
      }

      // Create updated part model with existing and new data
      const existingData = SparePartsModel.fromFirestore(doc);
      const updatedPartData = new SparePartsModel({
        ...existingData,
        ...partData,
        updatedAt: new Date().toISOString()
      });

      const { isValid, errors } = updatedPartData.validate();
      if (!isValid) {
        throw new Error(`Invalid spare part data: ${errors.join(', ')}`);
      }

      await this.collection.doc(id).update(updatedPartData.toFirestore());
      return updatedPartData;
    } catch (error) {
      console.error(`Error updating spare part with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a spare part (or mark as inactive)
  async deleteSparePart(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        throw new Error(`Spare part with ID ${id} not found`);
      }

      // Option 1: Delete the document
      // await this.collection.doc(id).delete();

      // Option 2: Mark as inactive (soft delete)
      await this.collection.doc(id).update({
        isActive: false,
        updatedAt: new Date().toISOString()
      });

      return { id, success: true };
    } catch (error) {
      console.error(`Error deleting spare part with ID ${id}:`, error);
      throw error;
    }
  }

  // Update quantity (for restocking or using parts)
  async updatePartQuantity(id, quantityChange) {
    try {
      // Use a transaction to safely update quantity
      return await db.runTransaction(async (transaction) => {
        const docRef = this.collection.doc(id);
        const doc = await transaction.get(docRef);
        
        if (!doc.exists) {
          throw new Error(`Spare part with ID ${id} not found`);
        }
        
        const currentData = doc.data();
        const newQuantity = currentData.quantity + quantityChange;
        
        if (newQuantity < 0) {
          throw new Error('Insufficient quantity in inventory');
        }
        
        transaction.update(docRef, {
          quantity: newQuantity,
          updatedAt: new Date().toISOString(),
          ...(quantityChange > 0 ? { lastRestockDate: new Date().toISOString() } : {})
        });
        
        return {
          id,
          newQuantity,
          success: true
        };
      });
    } catch (error) {
      console.error(`Error updating quantity for spare part with ID ${id}:`, error);
      throw error;
    }
  }

  // Get low stock parts (for reordering)
  async getLowStockParts(serviceCenterId) {
    try {
      const snapshot = await this.collection
        .where('serviceCenterId', '==', serviceCenterId)
        .where('isActive', '==', true)
        .get();
        
      const parts = snapshot.docs.map(doc => SparePartsModel.fromFirestore(doc));
      
      // Filter for parts where quantity is below minStockLevel
      return parts.filter(part => part.quantity <= part.minStockLevel);
    } catch (error) {
      console.error('Error getting low stock parts:', error);
      throw error;
    }
  }

  // Add bulk spare parts
  async addBulkSpareParts(partsArray) {
    try {
      const batch = db.batch();
      const results = [];

      for (const partData of partsArray) {
        const partModel = new SparePartsModel(partData);
        const { isValid, errors } = partModel.validate();
        
        if (!isValid) {
          results.push({
            success: false,
            data: partData,
            error: `Invalid spare part data: ${errors.join(', ')}`
          });
          continue;
        }
        
        const docRef = this.collection.doc();
        const newPartData = { ...partModel.toFirestore(), id: docRef.id };
        batch.set(docRef, newPartData);
        
        results.push({
          success: true,
          data: newPartData
        });
      }
      
      await batch.commit();
      return results;
    } catch (error) {
      console.error('Error adding bulk spare parts:', error);
      throw error;
    }
  }
}

module.exports = new SparePartsService();
