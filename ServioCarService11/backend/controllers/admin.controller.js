const adminService = require('../services/admin.service');

class AdminController {
  // Get all admins
  async getAllAdmins(req, res) {
    try {
      const admins = await adminService.getAllAdmins();
      return res.status(200).json(admins);
    } catch (error) {
      console.error('Error in getAllAdmins controller:', error);
      return res.status(500).json({ message: 'Failed to get admins', error: error.message });
    }
  }

  // Get admin by ID
  async getAdminById(req, res) {
    try {
      const { adminId } = req.params;
      const admin = await adminService.getAdminById(adminId);
      
      if (!admin) {
        return res.status(404).json({ message: `Admin with ID ${adminId} not found` });
      }
      
      return res.status(200).json(admin);
    } catch (error) {
      console.error('Error in getAdminById controller:', error);
      return res.status(500).json({ message: 'Failed to get admin', error: error.message });
    }
  }

  // Get admin by user ID
  async getAdminByUserId(req, res) {
    try {
      const { userId } = req.params;
      const admin = await adminService.getAdminByUserId(userId);
      
      if (!admin) {
        return res.status(404).json({ message: `Admin with user ID ${userId} not found` });
      }
      
      return res.status(200).json(admin);
    } catch (error) {
      console.error('Error in getAdminByUserId controller:', error);
      return res.status(500).json({ message: 'Failed to get admin', error: error.message });
    }
  }

  // Create a new admin
  async createAdmin(req, res) {
    try {
      const adminData = req.body;
      const newAdmin = await adminService.createAdmin(adminData);
      return res.status(201).json(newAdmin);
    } catch (error) {
      console.error('Error in createAdmin controller:', error);
      return res.status(500).json({ message: 'Failed to create admin', error: error.message });
    }
  }

  // Update an admin
  async updateAdmin(req, res) {
    try {
      const { adminId } = req.params;
      const adminData = req.body;
      
      const updatedAdmin = await adminService.updateAdmin(adminId, adminData);
      return res.status(200).json(updatedAdmin);
    } catch (error) {
      console.error('Error in updateAdmin controller:', error);
      return res.status(500).json({ message: 'Failed to update admin', error: error.message });
    }
  }

  // Delete an admin
  async deleteAdmin(req, res) {
    try {
      const { adminId } = req.params;
      const result = await adminService.deleteAdmin(adminId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteAdmin controller:', error);
      return res.status(500).json({ message: 'Failed to delete admin', error: error.message });
    }
  }

  // Update admin permissions
  async updatePermissions(req, res) {
    try {
      const { adminId } = req.params;
      const { permissions } = req.body;
      
      if (!permissions) {
        return res.status(400).json({ message: 'Permissions object is required' });
      }
      
      const updatedAdmin = await adminService.updatePermissions(adminId, permissions);
      return res.status(200).json(updatedAdmin);
    } catch (error) {
      console.error('Error in updatePermissions controller:', error);
      return res.status(500).json({ message: 'Failed to update admin permissions', error: error.message });
    }
  }

  // Update admin last login
  async updateLastLogin(req, res) {
    try {
      const { adminId } = req.params;
      const updatedAdmin = await adminService.updateLastLogin(adminId);
      return res.status(200).json(updatedAdmin);
    } catch (error) {
      console.error('Error in updateLastLogin controller:', error);
      return res.status(500).json({ message: 'Failed to update admin last login', error: error.message });
    }
  }

  // Get system statistics
  async getSystemStats(req, res) {
    try {
      const stats = await adminService.getSystemStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error('Error in getSystemStats controller:', error);
      return res.status(500).json({ message: 'Failed to get system statistics', error: error.message });
    }
  }

  // Approve service center
  async approveServiceCenter(req, res) {
    try {
      const { serviceCenterId } = req.params;
      const result = await adminService.approveServiceCenter(serviceCenterId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in approveServiceCenter controller:', error);
      return res.status(500).json({ message: 'Failed to approve service center', error: error.message });
    }
  }

  // Reject service center
  async rejectServiceCenter(req, res) {
    try {
      const { serviceCenterId } = req.params;
      const { reason } = req.body;
      
      const result = await adminService.rejectServiceCenter(serviceCenterId, reason);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in rejectServiceCenter controller:', error);
      return res.status(500).json({ message: 'Failed to reject service center', error: error.message });
    }
  }

  // Generate system report
  async generateSystemReport(req, res) {
    try {
      const { reportType } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      const report = await adminService.generateSystemReport(reportType, startDate, endDate);
      return res.status(200).json(report);
    } catch (error) {
      console.error('Error in generateSystemReport controller:', error);
      return res.status(500).json({ message: 'Failed to generate system report', error: error.message });
    }
  }
}

module.exports = new AdminController();