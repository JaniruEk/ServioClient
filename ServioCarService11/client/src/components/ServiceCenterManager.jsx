import React, { useState, useEffect } from 'react';
import api, { Collections } from '../services/api';

const ServiceCenterManager = () => {
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCenter, setCurrentCenter] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    services: [],
    operatingHours: '',
    rating: 0
  });

  // Load service centers on component mount
  useEffect(() => {
    fetchServiceCenters();
  }, []);

  // Fetch all service centers
  const fetchServiceCenters = async () => {
    setLoading(true);
    try {
      const data = await api.getAll(Collections.SERVICE_CENTERS);
      setServiceCenters(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch service centers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rating' ? Number(value) : value
    });
  };

  // Handle services input (comma separated list)
  const handleServicesChange = (e) => {
    const services = e.target.value.split(',').map(service => service.trim());
    setFormData({
      ...formData,
      services
    });
  };

  // Add new service center
  const handleAddCenter = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await api.add(Collections.SERVICE_CENTERS, formData);
      setServiceCenters([...serviceCenters, result]);
      resetForm();
    } catch (err) {
      setError('Failed to add service center: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update existing service center
  const handleUpdateCenter = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await api.update(Collections.SERVICE_CENTERS, currentCenter.id, formData);
      setServiceCenters(serviceCenters.map(center => 
        center.id === currentCenter.id ? result : center
      ));
      setIsEditing(false);
      resetForm();
    } catch (err) {
      setError('Failed to update service center: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete service center
  const handleDeleteCenter = async (id) => {
    if (window.confirm('Are you sure you want to delete this service center?')) {
      try {
        setLoading(true);
        await api.remove(Collections.SERVICE_CENTERS, id);
        setServiceCenters(serviceCenters.filter(center => center.id !== id));
      } catch (err) {
        setError('Failed to delete service center: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Set form data for editing
  const handleEditClick = (center) => {
    setIsEditing(true);
    setCurrentCenter(center);
    setFormData({
      name: center.name || '',
      address: center.address || '',
      phone: center.phone || '',
      email: center.email || '',
      services: center.services || [],
      operatingHours: center.operatingHours || '',
      rating: center.rating || 0
    });
  };

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      services: [],
      operatingHours: '',
      rating: 0
    });
    setCurrentCenter(null);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Service Center Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form for adding/editing service centers */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit Service Center' : 'Add New Service Center'}
        </h2>
        
        <form onSubmit={isEditing ? handleUpdateCenter : handleAddCenter} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Services (comma separated)</label>
            <input
              type="text"
              name="services"
              value={formData.services.join(', ')}
              onChange={handleServicesChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
            <input
              type="text"
              name="operatingHours"
              value={formData.operatingHours}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating (0-5)</label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              min="0"
              max="5"
              step="0.1"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-md ${
                isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Processing...' : isEditing ? 'Update Center' : 'Add Center'}
            </button>
          </div>
        </form>
      </div>

      {/* List of service centers */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Service Centers</h2>
        
        {loading && !isEditing ? (
          <div className="text-center py-4">
            <p>Loading service centers...</p>
          </div>
        ) : serviceCenters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceCenters.map((center) => (
                  <tr key={center.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{center.name}</div>
                      <div className="text-sm text-gray-500">{center.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{center.phone}</div>
                      <div className="text-sm text-gray-500">{center.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {center.services && center.services.length > 0
                          ? center.services.join(', ')
                          : 'No services listed'}
                      </div>
                      <div className="text-sm text-gray-500">{center.operatingHours}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {center.rating ? `${center.rating}/5` : 'Not rated'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(center)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCenter(center.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p>No service centers found. Add your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCenterManager;