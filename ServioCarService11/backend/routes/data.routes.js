const express = require('express');
const router = express.Router();
const { dbOperations } = require('../firebase.config');

// Collection array containing all available collections
const collections = [
  'jobs', 
  'servicecenters', 
  'servicereservations', 
  'services', 
  'technicianreservations', 
  'technicians', 
  'users'
];

// GET /:collection - Get all documents from a collection
router.get('/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    
    if (!collections.includes(collection)) {
      return res.status(400).json({ error: `Invalid collection: ${collection}` });
    }
    
    const data = await dbOperations.getAll(collection);
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error in GET /${req.params.collection}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// GET /:collection/:id - Get a document by ID
router.get('/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    
    if (!collections.includes(collection)) {
      return res.status(400).json({ error: `Invalid collection: ${collection}` });
    }
    
    const data = await dbOperations.getById(collection, id);
    
    if (!data) {
      return res.status(404).json({ error: `Document not found in ${collection} with ID: ${id}` });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error in GET /${req.params.collection}/${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// POST /:collection - Add a new document
router.post('/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    
    if (!collections.includes(collection)) {
      return res.status(400).json({ error: `Invalid collection: ${collection}` });
    }
    
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body cannot be empty' });
    }
    
    const result = await dbOperations.add(collection, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(`Error in POST /${req.params.collection}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// POST /:collection/:id - Add/update document with specific ID
router.post('/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    
    if (!collections.includes(collection)) {
      return res.status(400).json({ error: `Invalid collection: ${collection}` });
    }
    
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body cannot be empty' });
    }
    
    const result = await dbOperations.set(collection, id, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error in POST /${req.params.collection}/${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /:collection/:id - Update a document
router.put('/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    
    if (!collections.includes(collection)) {
      return res.status(400).json({ error: `Invalid collection: ${collection}` });
    }
    
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body cannot be empty' });
    }
    
    // Check if document exists
    const docExists = await dbOperations.getById(collection, id);
    if (!docExists) {
      return res.status(404).json({ error: `Document not found in ${collection} with ID: ${id}` });
    }
    
    const result = await dbOperations.update(collection, id, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error in PUT /${req.params.collection}/${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /:collection/:id - Delete a document
router.delete('/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    
    if (!collections.includes(collection)) {
      return res.status(400).json({ error: `Invalid collection: ${collection}` });
    }
    
    // Check if document exists
    const docExists = await dbOperations.getById(collection, id);
    if (!docExists) {
      return res.status(404).json({ error: `Document not found in ${collection} with ID: ${id}` });
    }
    
    await dbOperations.delete(collection, id);
    res.status(200).json({ message: `Document with ID: ${id} deleted from ${collection}` });
  } catch (error) {
    console.error(`Error in DELETE /${req.params.collection}/${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// POST /:collection/query - Query documents with filters
router.post('/:collection/query', async (req, res) => {
  try {
    const { collection } = req.params;
    
    if (!collections.includes(collection)) {
      return res.status(400).json({ error: `Invalid collection: ${collection}` });
    }
    
    const { filters } = req.body;
    
    if (!Array.isArray(filters)) {
      return res.status(400).json({ 
        error: 'Filters must be an array of {field, operator, value} objects',
        example: { 
          filters: [
            { field: 'status', operator: '==', value: 'Pending' },
            { field: 'priority', operator: '>=', value: 2 }
          ] 
        }
      });
    }
    
    const data = await dbOperations.query(collection, filters);
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error in POST /${req.params.collection}/query:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;