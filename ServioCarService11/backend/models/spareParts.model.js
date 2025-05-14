/**
 * SparePartsInventory Model - Defines the structure of spare parts inventory data
 */
class SparePartsModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.serviceCenterId = data.serviceCenterId || null; // ID of the service center that owns this part
    this.partName = data.partName || '';
    this.partNumber = data.partNumber || '';
    this.category = data.category || ''; // e.g., Engine, Brakes, Electrical, etc.
    this.description = data.description || '';
    this.price = data.price || 0;
    this.costPrice = data.costPrice || 0;
    this.quantity = data.quantity || 0;
    this.minStockLevel = data.minStockLevel || 5; // Minimum stock level before reorder
    this.location = data.location || ''; // Storage location in the service center
    this.manufacturer = data.manufacturer || '';
    this.compatibleVehicles = data.compatibleVehicles || []; // Array of compatible vehicle models
    this.imageUrl = data.imageUrl || null;
    this.lastRestockDate = data.lastRestockDate || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Convert to Firestore document data
  toFirestore() {
    return {
      serviceCenterId: this.serviceCenterId,
      partName: this.partName,
      partNumber: this.partNumber,
      category: this.category,
      description: this.description,
      price: this.price,
      costPrice: this.costPrice,
      quantity: this.quantity,
      minStockLevel: this.minStockLevel,
      location: this.location,
      manufacturer: this.manufacturer,
      compatibleVehicles: this.compatibleVehicles,
      imageUrl: this.imageUrl,
      lastRestockDate: this.lastRestockDate,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Create from Firestore data
  static fromFirestore(doc) {
    const data = doc.data();
    return new SparePartsModel({
      id: doc.id,
      ...data
    });
  }

  // Validate the model data
  validate() {
    const errors = [];

    if (!this.partName) {
      errors.push('Part name is required');
    }

    if (!this.serviceCenterId) {
      errors.push('Service center ID is required');
    }

    if (this.price < 0) {
      errors.push('Price cannot be negative');
    }

    if (this.quantity < 0) {
      errors.push('Quantity cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = SparePartsModel;
