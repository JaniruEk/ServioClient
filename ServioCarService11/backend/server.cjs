require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Firebase Admin from firebase.config.js instead of initializing it again
const { admin, db, auth } = require('./firebase.config.js');

// Import routes
const jobRoutes = require('./routes/job.routes');
const technicianRoutes = require('./routes/technician.routes');
const vehiclePartsRoutes = require('./routes/vehicleParts.routes');
const serviceCenterRoutes = require('./routes/serviceCenter.routes');
const dataRoutes = require('./routes/data.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Share Firebase services with the application
app.locals.db = db;
app.locals.auth = auth;

// Register API routes
app.use('/api/jobs', jobRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/parts', vehiclePartsRoutes);
app.use('/api/service-centers', serviceCenterRoutes);
app.use('/api/data', dataRoutes); // New unified data API
app.use('/api/payment', paymentRoutes); // Payment API

const getRedirectPath = (category) => {
  return category === 'owner' ? '/owner-home' :
  category === 'technician' ? '/technician-home' :
  category === 'service-center' ? '/service-center-home'
  : '/signup'
};

app.post('/api/register', async (req, res) => {
  const { email, password, category, ...userData } = req.body;
  try {
    const userRecord = await auth.createUser({ email, password });
    const userId = userRecord.uid;
    const fullUserData = { userId, category, email, createdAt: new Date().toISOString(), ...userData };
    await db.collection('users').doc(userId).set(fullUserData);
    res.status(201).json({ message: 'User registered', redirect: getRedirectPath(category) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await auth.getUserByEmail(email);
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    if (!userDoc.exists) throw new Error('User data not found');
    const userData = userDoc.data();
    res.status(200).json({ user: userData, redirect: getRedirectPath(userData.category) });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.get('/api/user/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) throw new Error('User not found');
    res.status(200).json(userDoc.data());
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Basic health check endpoint
app.get('/api/health-check', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));