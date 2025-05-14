const admin = require('firebase-admin');
const AdminModel = require('../models/admin.model');

class AdminService {
  constructor() {
    this.db = admin.firestore();
    this.adminsCollection = this.db.collection('admins');
    this.usersCollection = this.db.collection('users');
    this.serviceCentersCollection = this.db.collection('serviceCenters');
    this.techniciansCollection = this.db.collection('technicians');
  }

  // Get all admins
  async getAllAdmins() {
    try {
      const snapshot = await this.adminsCollection.get();
      return snapshot.docs.map(doc => AdminModel.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting admins:', error);
      throw error;
    }
  }

  // Get admin by ID
  async getAdminById(adminId) {
    try {
      const doc = await this.adminsCollection.doc(adminId).get();
      if (!doc.exists) {
        return null;
      }
      return AdminModel.fromFirestore(doc);
    } catch (error) {
      console.error(`Error getting admin with ID ${adminId}:`, error);
      throw error;
    }
  }

  // Get admin by user ID (from Firebase Auth)
  async getAdminByUserId(userId) {
    try {
      const snapshot = await this.adminsCollection
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }
      
      return AdminModel.fromFirestore(snapshot.docs[0]);
    } catch (error) {
      console.error(`Error getting admin with user ID ${userId}:`, error);
      throw error;
    }
  }

  // Create a new admin
  async createAdmin(adminData) {
    try {
      // Check if a user document exists for this user ID
      if (adminData.userId) {
        const userDoc = await this.usersCollection.doc(adminData.userId).get();
        if (!userDoc.exists) {
          throw new Error(`User with ID ${adminData.userId} does not exist`);
        }
      }

      const adminModel = new AdminModel(adminData);
      const docRef = await this.adminsCollection.add(adminModel.toFirestore());
      
      // Update the admin with the generated ID
      const generatedId = docRef.id;
      adminModel.id = generatedId;
      await docRef.update({ id: generatedId });
      
      return adminModel;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  // Update an admin
  async updateAdmin(adminId, adminData) {
    try {
      const docRef = this.adminsCollection.doc(adminId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Admin with ID ${adminId} not found`);
      }
      
      // Create an admin model with existing data and new updates
      const existingData = doc.data();
      const updatedModel = new AdminModel({
        ...existingData,
        ...adminData,
        updatedAt: new Date().toISOString()
      });
      
      await docRef.update(updatedModel.toFirestore());
      return updatedModel;
    } catch (error) {
      console.error(`Error updating admin with ID ${adminId}:`, error);
      throw error;
    }
  }

  // Delete an admin
  async deleteAdmin(adminId) {
    try {
      const docRef = this.adminsCollection.doc(adminId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Admin with ID ${adminId} not found`);
      }
      
      await docRef.delete();
      return { id: adminId, deleted: true };
    } catch (error) {
      console.error(`Error deleting admin with ID ${adminId}:`, error);
      throw error;
    }
  }

  // Update admin permissions
  async updatePermissions(adminId, permissions) {
    try {
      const docRef = this.adminsCollection.doc(adminId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Admin with ID ${adminId} not found`);
      }
      
      const adminModel = AdminModel.fromFirestore(doc);
      adminModel.updatePermissions(permissions);
      
      await docRef.update({
        permissions: adminModel.permissions,
        updatedAt: new Date().toISOString()
      });
      
      return adminModel;
    } catch (error) {
      console.error(`Error updating permissions for admin with ID ${adminId}:`, error);
      throw error;
    }
  }

  // Update admin last login
  async updateLastLogin(adminId) {
    try {
      const docRef = this.adminsCollection.doc(adminId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Admin with ID ${adminId} not found`);
      }
      
      const adminModel = AdminModel.fromFirestore(doc);
      adminModel.updateLastLogin();
      
      await docRef.update({
        lastLogin: adminModel.lastLogin,
        updatedAt: adminModel.updatedAt
      });
      
      return adminModel;
    } catch (error) {
      console.error(`Error updating last login for admin with ID ${adminId}:`, error);
      throw error;
    }
  }

  // Get system statistics for admin dashboard
  async getSystemStats() {
    try {
      // Get counts of various entities
      const [
        serviceCentersSnapshot,
        techniciansSnapshot,
        usersSnapshot,
        pendingServiceCentersSnapshot
      ] = await Promise.all([
        this.serviceCentersCollection.get(),
        this.techniciansCollection.get(),
        this.usersCollection.get(),
        this.serviceCentersCollection.where('status', '==', 'pending').get()
      ]);

      return {
        serviceCentersCount: serviceCentersSnapshot.size,
        techniciansCount: techniciansSnapshot.size,
        usersCount: usersSnapshot.size,
        pendingApprovalCount: pendingServiceCentersSnapshot.size
      };
    } catch (error) {
      console.error('Error getting system statistics:', error);
      throw error;
    }
  }

  // Approve service center
  async approveServiceCenter(serviceCenterId) {
    try {
      const docRef = this.serviceCentersCollection.doc(serviceCenterId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Service center with ID ${serviceCenterId} not found`);
      }
      
      await docRef.update({
        status: 'approved',
        updatedAt: new Date().toISOString()
      });
      
      return { id: serviceCenterId, approved: true };
    } catch (error) {
      console.error(`Error approving service center with ID ${serviceCenterId}:`, error);
      throw error;
    }
  }

  // Reject service center
  async rejectServiceCenter(serviceCenterId, reason = '') {
    try {
      const docRef = this.serviceCentersCollection.doc(serviceCenterId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Service center with ID ${serviceCenterId} not found`);
      }
      
      await docRef.update({
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date().toISOString()
      });
      
      return { id: serviceCenterId, rejected: true, reason };
    } catch (error) {
      console.error(`Error rejecting service center with ID ${serviceCenterId}:`, error);
      throw error;
    }
  }

  // Generate system report
  async generateSystemReport(reportType, startDate, endDate) {
    try {
      // Implementation will depend on specific report types needed
      // This is a placeholder for the report generation logic
      let reportData = {};
      
      switch (reportType) {
        case 'users':
          // Get user registration statistics
          reportData = await this.getUsersReport(startDate, endDate);
          break;
        case 'serviceCenters':
          // Get service center statistics
          reportData = await this.getServiceCentersReport(startDate, endDate);
          break;
        case 'technicians':
          // Get technician statistics
          reportData = await this.getTechniciansReport(startDate, endDate);
          break;
        case 'jobs':
          // Get job completion statistics
          reportData = await this.getJobsReport(startDate, endDate);
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
      
      return {
        type: reportType,
        startDate,
        endDate,
        generatedAt: new Date().toISOString(),
        data: reportData
      };
    } catch (error) {
      console.error('Error generating system report:', error);
      throw error;
    }
  }
  
  // Helper method for user report generation
  async getUsersReport(startDate, endDate) {
    // Implementation details would go here
    // This is a simplified placeholder
    return { 
      totalUsers: 0,
      newUsers: 0,
      activeUsers: 0,
      usersByType: {}
    };
  }
  
  // Helper method for service center report generation
  async getServiceCentersReport(startDate, endDate) {
    // Implementation details would go here
    // This is a simplified placeholder
    return { 
      totalCenters: 0,
      newCenters: 0,
      activeCenters: 0,
      jobsCompleted: 0,
      averageRating: 0
    };
  }
  
  // Helper method for technicians report generation
  async getTechniciansReport(startDate, endDate) {
    // Implementation details would go here
    // This is a simplified placeholder
    return { 
      totalTechnicians: 0,
      newTechnicians: 0,
      activeTechnicians: 0,
      jobsCompleted: 0,
      averageRating: 0
    };
  }
  
  // Helper method for jobs report generation
  async getJobsReport(startDate, endDate) {
    // Implementation details would go here
    // This is a simplified placeholder
    return { 
      totalJobs: 0,
      completedJobs: 0,
      pendingJobs: 0,
      averageCompletionTime: 0,
      jobsByType: {}
    };
  }
}

module.exports = new AdminService();