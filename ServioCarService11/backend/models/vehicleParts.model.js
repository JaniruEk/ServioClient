/**
 * VehiclePartsRequest Model - Defines the structure of vehicle parts request data
 */
class VehiclePartsRequestModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.technicianId = data.technicianId || null;
    this.partName = data.partName || '';
    this.quantity = data.quantity || 1;
    this.urgency = data.urgency || 'Medium'; // High, Medium, Low
    this.notes = data.notes || '';
    this.status = data.status || 'Pending'; // Pending, Approved, Received, Rejected
    this.jobId = data.jobId || null; // Optional reference to a job
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.imageUrl = data.imageUrl || null; // URL to part image if any
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Convert to Firestore document data
  toFirestore() {
    return {
      technicianId: this.technicianId,
      partName: this.partName,
      quantity: this.quantity,
      urgency: this.urgency,
      notes: this.notes,
      status: this.status,
      jobId: this.jobId,
      date: this.date,
      imageUrl: this.imageUrl,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString()
    };
  }

  // Create a VehiclePartsRequestModel from Firestore document
  static fromFirestore(doc) {
    const data = doc.data();
    return new VehiclePartsRequestModel({
      id: doc.id,
      ...data
    });
  }

  // Validate the parts request data
  validate() {
    const errors = [];
    
    if (!this.technicianId) {
      errors.push('Technician ID is required');
    }
    
    if (!this.partName) {
      errors.push('Part name is required');
    }
    
    if (isNaN(this.quantity) || this.quantity < 1) {
      errors.push('Quantity must be a positive number');
    }
    
    if (!['High', 'Medium', 'Low'].includes(this.urgency)) {
      errors.push('Urgency must be High, Medium, or Low');
    }
    
    if (!['Pending', 'Approved', 'Received', 'Rejected'].includes(this.status)) {
      errors.push('Status must be Pending, Approved, Received, or Rejected');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = VehiclePartsRequestModel;