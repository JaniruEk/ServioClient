/**
 * API service for interacting with backend endpoints
 * Provides methods for CRUD operations on all Firestore collections
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Collection names matching Firestore structure
 */
export const Collections = {
  JOBS: 'jobs',
  SERVICE_CENTERS: 'servicecenters',
  SERVICE_RESERVATIONS: 'servicereservations',
  SERVICES: 'services',
  TECHNICIAN_RESERVATIONS: 'technicianreservations',
  TECHNICIANS: 'technicians',
  USERS: 'users'
};

/**
 * Get all documents from a collection
 * @param {string} collection - Collection name
 * @returns {Promise<Array>} - Array of documents
 */
export const getAll = async (collection) => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${collection}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch data');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error getting all ${collection}:`, error);
    throw error;
  }
};

/**
 * Get a document by ID
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<Object>} - Document data
 */
export const getById = async (collection, id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${collection}/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch data');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error getting ${collection} document by ID:`, error);
    throw error;
  }
};

/**
 * Add a new document
 * @param {string} collection - Collection name
 * @param {Object} data - Document data
 * @returns {Promise<Object>} - Added document with ID
 */
export const add = async (collection, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add document');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error adding document to ${collection}:`, error);
    throw error;
  }
};

/**
 * Set a document with specific ID
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @param {Object} data - Document data
 * @returns {Promise<Object>} - Updated document
 */
export const set = async (collection, id, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${collection}/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to set document');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error setting document in ${collection}:`, error);
    throw error;
  }
};

/**
 * Update an existing document
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @param {Object} data - Document data to update
 * @returns {Promise<Object>} - Updated document
 */
export const update = async (collection, id, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${collection}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update document');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating document in ${collection}:`, error);
    throw error;
  }
};

/**
 * Delete a document
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<Object>} - Deletion confirmation
 */
export const remove = async (collection, id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${collection}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete document');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting document from ${collection}:`, error);
    throw error;
  }
};

/**
 * Query documents with filters
 * @param {string} collection - Collection name
 * @param {Array<Object>} filters - Array of filter objects {field, operator, value}
 * @returns {Promise<Array>} - Array of filtered documents
 */
export const query = async (collection, filters) => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${collection}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filters }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to query documents');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error querying documents in ${collection}:`, error);
    throw error;
  }
};

// Default export for convenience
export default {
  getAll,
  getById,
  add,
  set,
  update,
  remove,
  query,
  Collections
};