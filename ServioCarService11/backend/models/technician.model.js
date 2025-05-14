/**
 * Technician Model - Defines the structure and validation of technician data
 */
class TechnicianModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || null; // Firebase Auth user ID
    this.fullName = data.fullName || '';
    this.email = data.email || '';
    this.specialization = data.specialization || '';
    this.age = data.age || null;
    this.contactNumber = data.contactNumber || '';
    this.availability = data.availability || 'Available'; // Available, Busy, On Leave
    this.serviceCenterId = data.serviceCenterId || null;
    this.jobsCompleted = data.jobsCompleted || 0;
    this.ratings = data.ratings || [];
    this.averageRating = data.averageRating || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Convert to Firestore document data
  toFirestore() {
    return {
      userId: this.userId,
      fullName: this.fullName,
      email: this.email,
      specialization: this.specialization,
      age: this.age,
      contactNumber: this.contactNumber,
      availability: this.availability,
      serviceCenterId: this.serviceCenterId,
      jobsCompleted: this.jobsCompleted,
      ratings: this.ratings,
      averageRating: this.averageRating,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString()
    };
  }

  // Create a TechnicianModel from Firestore document
  static fromFirestore(doc) {
    const data = doc.data();
    return new TechnicianModel({
      id: doc.id,
      ...data
    });
  }

  // Calculate average rating from ratings array
  calculateAverageRating() {
    if (!this.ratings || this.ratings.length === 0) {
      this.averageRating = 0;
      return;
    }
    
    const sum = this.ratings.reduce((total, rating) => total + rating.value, 0);
    this.averageRating = parseFloat((sum / this.ratings.length).toFixed(1));
  }

  // Add a new rating
  addRating(value, comment = '', customerId = null) {
    if (!this.ratings) {
      this.ratings = [];
    }
    
    this.ratings.push({
      value,
      comment,
      customerId,
      date: new Date().toISOString()
    });
    
    this.calculateAverageRating();
  }

  // Increment jobs completed count
  incrementJobsCompleted() {
    this.jobsCompleted = (this.jobsCompleted || 0) + 1;
  }

  // Validate the technician data
  validate() {
    const errors = [];
    
    if (!this.userId) {
      errors.push('User ID is required');
    }
    
    if (!this.fullName) {
      errors.push('Full name is required');
    }
    
    if (!this.email) {
      errors.push('Email is required');
    }
    
    if (!['Available', 'Busy', 'On Leave'].includes(this.availability)) {
      errors.push('Availability must be Available, Busy, or On Leave');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = TechnicianModel;