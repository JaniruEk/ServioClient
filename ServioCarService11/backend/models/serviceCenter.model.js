/**
 * Service Center Model - Defines the structure and validation of service center data
 */
class ServiceCenterModel {  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || null; // Firebase Auth user ID
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.address = data.address || '';
    this.city = data.city || '';
    this.state = data.state || '';
    this.zipCode = data.zipCode || '';
    this.description = data.description || '';
    this.certification = data.certification || '';
    this.website = data.website || '';
    this.serviceTypes = data.serviceTypes || [];
    this.services = data.services || [];
    this.operatingHours = data.operatingHours || {
      monday: { open: '09:00', close: '18:00', isClosed: false },
      tuesday: { open: '09:00', close: '18:00', isClosed: false },
      wednesday: { open: '09:00', close: '18:00', isClosed: false },
      thursday: { open: '09:00', close: '18:00', isClosed: false },
      friday: { open: '09:00', close: '18:00', isClosed: false },
      saturday: { open: '10:00', close: '16:00', isClosed: false },
      sunday: { open: '10:00', close: '16:00', isClosed: true }
    };
    this.technicians = data.technicians || [];
    this.ratings = data.ratings || [];
    this.averageRating = data.averageRating || 0;
    this.imageUrl = data.imageUrl || '';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
  // Convert to Firestore document data
  toFirestore() {
    return {
      userId: this.userId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
      description: this.description,
      certification: this.certification,
      website: this.website,
      serviceTypes: this.serviceTypes,
      services: this.services,
      operatingHours: this.operatingHours,
      technicians: this.technicians,
      ratings: this.ratings,
      averageRating: this.averageRating,
      imageUrl: this.imageUrl,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString()
    };
  }

  // Create a ServiceCenterModel from Firestore document
  static fromFirestore(doc) {
    const data = doc.data();
    return new ServiceCenterModel({
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

  // Add a new service
  addService(service) {
    if (!this.services) {
      this.services = [];
    }
    
    this.services.push(service);
  }

  // Validate the service center data
  validate() {
    const errors = [];
    
    if (!this.userId) {
      errors.push('User ID is required');
    }
    
    if (!this.name) {
      errors.push('Service center name is required');
    }
    
    if (!this.email) {
      errors.push('Email is required');
    }
    
    if (!this.phone) {
      errors.push('Phone number is required');
    }
    
    if (!this.address) {
      errors.push('Address is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };  }
  
  // Static method to create a model instance from Firestore document
  static fromFirestore(doc) {
    if (!doc) return null;
    
    const data = doc.data() || {};
    return new ServiceCenterModel({
      id: doc.id,
      ...data
    });
  }
}

module.exports = ServiceCenterModel;