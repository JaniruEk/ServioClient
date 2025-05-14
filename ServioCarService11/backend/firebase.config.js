const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

let db;
let auth;

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id}.firebaseio.com`
  });
  console.log('Firebase Admin initialized in firebase.config.js');
} else {
  console.log('Using existing Firebase Admin app');
}

db = admin.firestore();
auth = admin.auth();

// Create collection references for easier access
const collections = {
  jobs: db.collection('jobs'),
  servicecenters: db.collection('servicecenters'),
  servicereservations: db.collection('servicereservations'),
  services: db.collection('services'),
  technicianreservations: db.collection('technicianreservations'),
  technicians: db.collection('technicians'),
  users: db.collection('users')
};

// Generic CRUD operations for any collection
const dbOperations = {
  // Get all documents from a collection
  getAll: async (collectionName) => {
    try {
      const snapshot = await collections[collectionName].get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting all ${collectionName}:`, error);
      throw error;
    }
  },

  // Get a single document by ID
  getById: async (collectionName, id) => {
    try {
      const doc = await collections[collectionName].doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error(`Error getting ${collectionName} by ID:`, error);
      throw error;
    }
  },

  // Add a new document
  add: async (collectionName, data) => {
    try {
      const docRef = await collections[collectionName].add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error adding to ${collectionName}:`, error);
      throw error;
    }
  },

  // Add a new document with a specific ID
  set: async (collectionName, id, data) => {
    try {
      await collections[collectionName].doc(id).set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return { id, ...data };
    } catch (error) {
      console.error(`Error setting ${collectionName} with ID:`, error);
      throw error;
    }
  },

  // Update an existing document
  update: async (collectionName, id, data) => {
    try {
      await collections[collectionName].doc(id).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      throw error;
    }
  },

  // Delete a document
  delete: async (collectionName, id) => {
    try {
      await collections[collectionName].doc(id).delete();
      return { id };
    } catch (error) {
      console.error(`Error deleting from ${collectionName}:`, error);
      throw error;
    }
  },
  
  // Query documents with filters
  query: async (collectionName, filters = []) => {
    try {
      let query = collections[collectionName];
      
      filters.forEach(filter => {
        const { field, operator, value } = filter;
        query = query.where(field, operator, value);
      });
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  }
};

module.exports = { 
  admin, 
  db, 
  auth, 
  collections,
  dbOperations
};