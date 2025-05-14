const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  },
  permissions: {
    manageUsers: { type: Boolean, default: true },
    manageServiceCenters: { type: Boolean, default: true },
    manageTechnicians: { type: Boolean, default: true },
    manageReports: { type: Boolean, default: true },
    systemConfiguration: { type: Boolean, default: false }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;