/**
 * Job Model - Defines the structure of job data in the application
 */
class JobModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.vehicle = data.vehicle || {}; // { make, model, year }
    this.service = data.service || {}; // { type, date, time }
    this.priority = data.priority || 'Medium'; // High, Medium, Low
    this.status = data.status || 'Pending'; // Pending, In Progress, Completed, Declined
    this.customer = data.customer || {}; // { name, contact, email }
    this.technicianId = data.technicianId || null;
    this.serviceCenterId = data.serviceCenterId || null;
    this.problemDescription = data.problemDescription || '';
    this.notes = data.notes || '';
    this.date = data.date || (data.service?.date ? data.service.date.split('T')[0] : null);
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Convert to Firestore document data
  toFirestore() {
    return {
      id: this.id,
      vehicle: this.vehicle,
      service: this.service,
      priority: this.priority,
      status: this.status,
      customer: this.customer,
      technicianId: this.technicianId,
      serviceCenterId: this.serviceCenterId,
      problemDescription: this.problemDescription,
      notes: this.notes,
      date: this.date,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString()
    };
  }

  // Create a JobModel from Firestore document
  static fromFirestore(doc) {
    const data = doc.data();
    return new JobModel({
      id: doc.id,
      ...data
    });
  }

  // Validate the job data
  validate() {
    const errors = [];
    
    if (!this.vehicle || !this.vehicle.make || !this.vehicle.model) {
      errors.push('Vehicle make and model are required');
    }
    
    if (!this.service || !this.service.type) {
      errors.push('Service type is required');
    }
    
    if (!this.service || !this.service.date) {
      errors.push('Service date is required');
    }
    
    if (!['High', 'Medium', 'Low'].includes(this.priority)) {
      errors.push('Priority must be High, Medium, or Low');
    }
    
    if (!['Pending', 'In Progress', 'Completed', 'Declined'].includes(this.status)) {
      errors.push('Status must be Pending, In Progress, Completed, or Declined');
    }
    
    if (!this.customer || !this.customer.name) {
      errors.push('Customer name is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = JobModel;