// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid';
import Footer from '../components/Footer';
import AdminSidebar from '../components/AdminSidebar';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);
  const [userError, setUserError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All'); // 'All', 'Service', 'Technician'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [newService, setNewService] = useState({ 
    customer: '', 
    date: '', 
    type: '', 
    status: 'Pending', 
    cost: '',
    reservationType: 'Service'  // Default to Service
  });
  const [editService, setEditService] = useState(null);  // Fetch reservations from Firebase
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        console.log("Fetching all reservations from Firebase...");
        
        // Fetch service reservations
        const serviceQuery = query(collection(db, "servicereservations"));
        console.log("Querying servicereservations collection...");
        const serviceSnapshot = await getDocs(serviceQuery);
        console.log(`Found ${serviceSnapshot.docs.length} service reservations`);
        
        const serviceData = serviceSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            customer: data.customerName || data.name || 'Unknown',
            userId: data.userId || '',
            date: data.serviceDate instanceof Date ? data.serviceDate.toLocaleDateString() : 
                 typeof data.serviceDate === 'string' ? new Date(data.serviceDate).toLocaleDateString() : 
                 data.date instanceof Date ? data.date.toLocaleDateString() :
                 typeof data.date === 'string' ? new Date(data.date).toLocaleDateString() :
                 'Unknown Date',
            type: data.serviceType || 'General Service',
            status: data.status || 'Pending',
            cost: data.cost || 0,
            email: data.email || '',
            phone: data.phone || '',
            vehicleMake: data.vehicleMake || '',
            vehicleModel: data.vehicleModel || '',
            vehicleYear: data.vehicleYear || '',
            vehicleDetails: data.vehicleDetails || `${data.vehicleMake || ''} ${data.vehicleModel || ''} ${data.vehicleYear || ''}`.trim() || '',
            notes: data.notes || data.message || '',
            serviceCenterId: data.serviceCenterId || '',
            serviceCenterName: data.serviceCenterName || '',
            reservationType: 'Service',
            createdAt: data.createdAt ? 
                     (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : new Date(data.createdAt)) 
                     : new Date(),
            rawData: data
          };
        });
        
        // Fetch technician reservations
        const techQuery = query(collection(db, "technicianreservations"));
        console.log("Querying technicianreservations collection...");
        const techSnapshot = await getDocs(techQuery);
        console.log(`Found ${techSnapshot.docs.length} technician reservations`);
        
        const techData = techSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            customer: data.customerName || data.name || 'Unknown',
            userId: data.userId || '',
            date: data.serviceDate instanceof Date ? data.serviceDate.toLocaleDateString() : 
                 typeof data.serviceDate === 'string' ? new Date(data.serviceDate).toLocaleDateString() : 
                 data.date instanceof Date ? data.date.toLocaleDateString() :
                 typeof data.date === 'string' ? new Date(data.date).toLocaleDateString() :
                 'Unknown Date',
            type: data.serviceType || data.service || 'Technician Visit',
            status: data.status || 'Pending',
            cost: data.cost || data.price || 0,
            email: data.email || '',
            phone: data.phone || data.contactNumber || '',
            address: data.address || '',
            notes: data.notes || data.message || '',            technicianId: data.technicianId || '',
            technicianName: data.technicianName || '',
            reservationType: 'Technician',
            createdAt: data.createdAt ? 
                     (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : new Date(data.createdAt)) 
                     : new Date(),
            rawData: data
          };
        });
        
        // Combine both types of reservations and sort by date (most recent first)
        const allReservations = [...serviceData, ...techData];
        console.log("Total combined reservations:", allReservations.length);
        
        allReservations.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date();
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date();
          return dateB - dateA; // Most recent first
        });
        
        setServices(allReservations);
        
        console.log(`Successfully loaded ${serviceData.length} service reservations and ${techData.length} technician reservations`);
        console.log("Sample reservation data:", allReservations.length > 0 ? allReservations[0] : "No reservations found");
        
      } catch (err) {
        console.error("Error fetching reservations:", err);
        console.error("Error details:", err.message, err.stack);
        setError("Failed to load reservations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservations();
  }, []);
  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        
        // Fetch all users from the users collection
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.data().fullName || doc.data().displayName || 'Unknown',
          email: doc.data().email || '',
          phone: doc.data().phone || doc.data().contactNumber || '',
          category: doc.data().category || 'customer',
          profileImage: doc.data().profileImage || doc.data().photoURL || '',
          reservations: [],
        }));
        
        // Create a map of users by ID and email for easier association with reservations
        const userMap = {};
        usersData.forEach(user => {
          userMap[user.id] = user;
          if (user.email) {
            userMap[user.email.toLowerCase()] = user;
          }
        });
        
        // Associate each reservation with a user
        services.forEach(service => {
          // Try to find the user by ID
          let associatedUser = null;
          
          if (service.userId && userMap[service.userId]) {
            associatedUser = userMap[service.userId];
          } 
          // If no match by ID, try by email (case insensitive)
          else if (service.email && userMap[service.email.toLowerCase()]) {
            associatedUser = userMap[service.email.toLowerCase()];
          } 
          // If still no match, assign to a special "Unknown User" entry
          else {
            if (!userMap['unknown']) {
              // Create an "Unknown User" entry if it doesn't exist
              userMap['unknown'] = {
                id: 'unknown',
                name: 'Unknown User',
                email: '',
                phone: '',
                category: 'customer',
                profileImage: '',
                reservations: []
              };
              usersData.push(userMap['unknown']);
            }
            associatedUser = userMap['unknown'];
          }
          
          if (associatedUser) {
            if (!associatedUser.reservations) {
              associatedUser.reservations = [];
            }
            associatedUser.reservations.push(service);
          }
        });
        
        // Sort users by those with reservations first
        usersData.sort((a, b) => {
          // First sort by having reservations
          const aHasReservations = a.reservations && a.reservations.length > 0;
          const bHasReservations = b.reservations && b.reservations.length > 0;
          
          if (aHasReservations && !bHasReservations) return -1;
          if (!aHasReservations && bHasReservations) return 1;
          
          // Then sort by number of reservations (descending)
          return (b.reservations ? b.reservations.length : 0) - 
                 (a.reservations ? a.reservations.length : 0);
        });
        
        setUsers(usersData);
        
      } catch (err) {
        console.error("Error fetching users:", err);
        setUserError("Failed to load users. Please try again later.");
      } finally {
        setLoadingUsers(false);
      }
    };
    
    if (!loading && services.length > 0) {
      fetchUsers();
    }
  }, [loading, services]);

  // Function to toggle user expansion
  const toggleUserExpand = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };
  // Filter services based on current filter settings
  const filteredServices = services.filter(service => {
    // Log the service for debugging
    if (!service) {
      console.warn("Found undefined service in services array");
      return false;
    }
    
    // First check status filter
    const statusMatch = filterStatus === 'All' || service.status === filterStatus;
    
    // Then check reservation type filter
    const typeMatch = filterType === 'All' || service.reservationType === filterType;
    
    return statusMatch && typeMatch;
  });

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    // Implementation would depend on specific requirements
    // For now, we'll just update the UI
    setServices([...services, { 
      ...newService, 
      id: `temp-${Date.now()}`, 
      cost: Number(newService.cost),
      date: new Date(newService.date).toLocaleDateString()
    }]);
    setNewService({ 
      customer: '', 
      date: '', 
      type: '', 
      status: 'Pending', 
      cost: '',
      reservationType: 'Service'
    });
    setShowAddModal(false);
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update in Firestore
      const collectionName = editService.reservationType === 'Service' ? 'servicereservations' : 'technicianreservations';
      const docRef = doc(db, collectionName, editService.id);
      
      // Create an update object with the fields we want to update
      const updateData = {
        status: editService.status,
        cost: Number(editService.cost)
      };
      
      // Add any additional fields that were modified
      if (editService.type) updateData.serviceType = editService.type;
      if (editService.customer) updateData.customerName = editService.customer;
      if (editService.date) updateData.serviceDate = editService.date;
      if (editService.notes) updateData.notes = editService.notes;
      
      console.log(`Updating reservation ${editService.id} in ${collectionName} collection:`, updateData);
      await updateDoc(docRef, updateData);
      
      // Update local state
      setServices(services.map(service => 
        service.id === editService.id ? { 
          ...service, 
          ...editService,
          cost: Number(editService.cost)
        } : service
      ));
      
      setEditService(null);
      setShowEditModal(false);
      alert("Reservation updated successfully!");
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("Failed to update the reservation. Please try again.");
    }
  };

  const handleDelete = async (id, reservationType) => {
    try {
      if (window.confirm("Are you sure you want to delete this reservation? This action cannot be undone.")) {
        const collectionName = reservationType === 'Service' ? 'servicereservations' : 'technicianreservations';
        await deleteDoc(doc(db, collectionName, id));
        setServices(services.filter(service => service.id !== id));
        alert("Reservation deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      alert("Failed to delete the reservation. Please try again.");
    }
  };

  const handleEditClick = (service) => {
    setEditService({ ...service });
    setShowEditModal(true);
  };

  const totalRevenue = services.reduce((sum, service) => 
    sum + (service.status === 'Completed' ? (parseFloat(service.cost) || 0) : 0), 0);
    
  const totalUsers = new Set(services.map(s => s.customer)).size;

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
        backgroundAttachment: "fixed", // Makes the image static
  backgroundSize: "cover", // Ensures the image covers the container (optional, already implied by bg-cover)
  backgroundPosition: "center", // Centers the image (optional, already implied by bg-center)
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>

      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <AdminSidebar activePath="/admin-dashboard" />

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">Servio Admin Dashboard</h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">Oversee operations and manage customer services</p>
            </div>
          </header>          {/* Overview Section */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <UsersIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">Total Customers</h3>
              <p className="text-gray-300 font-[Open Sans] text-2xl font-bold">{loading ? '...' : totalUsers}</p>
            </div>
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <WrenchScrewdriverIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">Service Reservations</h3>
              <p className="text-gray-300 font-[Open Sans] text-2xl font-bold">
                {loading ? '...' : services.filter(s => s.reservationType === 'Service').length}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {loading ? '' : `${services.filter(s => s.reservationType === 'Service' && s.status === 'Pending').length} pending`}
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <CalendarIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">Technician Visits</h3>
              <p className="text-gray-300 font-[Open Sans] text-2xl font-bold">
                {loading ? '...' : services.filter(s => s.reservationType === 'Technician').length}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {loading ? '' : `${services.filter(s => s.reservationType === 'Technician' && s.status === 'Pending').length} pending`}
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <ChartBarIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">Total Revenue</h3>
              <p className="text-gray-300 font-[Open Sans] text-2xl font-bold">
                {loading ? '...' : `$${totalRevenue.toFixed(2)}`}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                From {loading ? '...' : services.filter(s => s.status === 'Completed').length} completed bookings
              </p>
            </div>
          </section>        {/* User Reservations Section */}
          <section className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
              <h2 className="text-2xl font-bold text-white font-[Poppins]">All User Reservations</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    // Set all users to expanded
                    const allExpanded = {};
                    users.forEach(user => {
                      if (user.reservations && user.reservations.length > 0) {
                        allExpanded[user.id] = true;
                      }
                    });
                    setExpandedUsers(allExpanded);
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                  </svg>
                  Expand All
                </button>
                <button
                  onClick={() => setExpandedUsers({})}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 8a1 1 0 102 0V2.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 2.414V8zM15 12a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 17.586V12z" />
                  </svg>
                  Collapse All
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Refresh Data
                </button>
              </div>
            </div>
            
            {/* Metrics Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center">
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center">
                <p className="text-sm text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(user => user.reservations && user.reservations.length > 0).length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center">
                <p className="text-sm text-gray-400">Total Reservations</p>
                <p className="text-2xl font-bold text-white">
                  {services.length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center">
                <p className="text-sm text-gray-400">Pending Reservations</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {services.filter(service => service.status === 'Pending').length}
                </p>
              </div>
            </div>
            
            {/* Loading State */}
            {loadingUsers && (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Loading users and reservations...</p>
              </div>
            )}
            
            {/* Error State */}
            {userError && (
              <div className="bg-red-900/50 border border-red-500 text-red-100 p-4 rounded-md mb-4">
                <p>{userError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {/* No Results State */}
            {!loadingUsers && !userError && users.length === 0 && (
              <div className="text-center py-10 bg-white/5 rounded-md border border-gray-700/50">
                <p className="text-gray-300">No users found in the system.</p>
              </div>
            )}
            
            {/* Users List with Collapsible Reservations */}
            {!loadingUsers && !userError && users.length > 0 && (
              <div className="space-y-4">
                {users.map((user) => (
                  <div 
                    key={user.id} 
                    className={`bg-white/10 backdrop-blur-md rounded-lg overflow-hidden border ${
                      user.reservations && user.reservations.length > 0 
                        ? 'border-gray-700/50 hover:border-red-500' 
                        : 'border-gray-800/30'
                    } transition-all duration-300`}
                  >
                    {/* User Info Header */}
                    <div 
                      className={`p-4 flex flex-wrap md:flex-nowrap items-center justify-between ${
                        user.reservations && user.reservations.length > 0 ? 'cursor-pointer' : 'cursor-default opacity-70'
                      }`}
                      onClick={() => {
                        if (user.reservations && user.reservations.length > 0) {
                          toggleUserExpand(user.id);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-700" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                          <div className="flex items-center text-sm text-gray-300 space-x-4">
                            <p>{user.email || 'No email'}</p>
                            {user.phone && <p>• {user.phone}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.category === 'admin' ? 'bg-red-900/20 text-red-500' :
                          user.category === 'service-center' ? 'bg-blue-900/20 text-blue-500' :
                          user.category === 'technician' ? 'bg-green-900/20 text-green-500' :
                          'bg-gray-700/50 text-gray-300'
                        }`}>
                          {user.category === 'service-center' ? 'Service Center' :
                           user.category === 'technician' ? 'Technician' :
                           user.category.charAt(0).toUpperCase() + user.category.slice(1)}
                        </span>
                        
                        {user.reservations && user.reservations.length > 0 && (
                          <>
                            <span className="flex items-center gap-1 text-gray-300 text-sm px-2 py-1 bg-gray-700/30 rounded-full">
                              <CalendarIcon className="h-4 w-4 text-red-500" />
                              {user.reservations.length} reservation{user.reservations.length !== 1 ? 's' : ''}
                            </span>
                            
                            {expandedUsers[user.id] ? 
                              <ChevronUpIcon className="h-5 w-5 text-gray-400" /> : 
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            }
                          </>
                        )}
                      </div>
                    </div>
                      {/* Reservations Table (Collapsible) */}
                    {expandedUsers[user.id] && (
                      <div className="px-4 pb-4">
                        {user.reservations && user.reservations.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-800/50 text-gray-300">
                                  <th className="border-b border-gray-700 p-2 text-left">Type</th>
                                  <th className="border-b border-gray-700 p-2 text-left">Date</th>
                                  <th className="border-b border-gray-700 p-2 text-left">Service</th>
                                  <th className="border-b border-gray-700 p-2 text-left">Provider</th>
                                  <th className="border-b border-gray-700 p-2 text-left">Status</th>
                                  <th className="border-b border-gray-700 p-2 text-left">Cost</th>
                                  <th className="border-b border-gray-700 p-2 text-left">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {user.reservations.map((reservation) => (
                                  <tr key={reservation.id} className="hover:bg-gray-700/30">
                                    <td className="border-b border-gray-700 p-2">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        reservation.reservationType === 'Service' 
                                          ? 'bg-blue-100/10 text-blue-400' 
                                          : 'bg-purple-100/10 text-purple-400'
                                      }`}>
                                        {reservation.reservationType === 'Service' ? 'Service Center' : 'Technician Visit'}
                                      </span>
                                    </td>
                                    <td className="border-b border-gray-700 p-2 text-gray-300">{reservation.date}</td>
                                    <td className="border-b border-gray-700 p-2 text-gray-300">
                                      {reservation.type}
                                      {reservation.vehicleDetails && (
                                        <p className="text-xs text-gray-500">{reservation.vehicleDetails}</p>
                                      )}
                                    </td>
                                    <td className="border-b border-gray-700 p-2 text-gray-300">
                                      {reservation.reservationType === 'Service' ? (
                                        reservation.serviceCenterName || 'Unknown Service Center'
                                      ) : (
                                        reservation.technicianName || 'Unknown Technician'
                                      )}
                                    </td>
                                    <td className="border-b border-gray-700 p-2">
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                          reservation.status === 'Completed' ? 'bg-green-100/10 text-green-400' : 
                                          reservation.status === 'Cancelled' ? 'bg-red-100/10 text-red-400' :
                                          reservation.status === 'In Progress' ? 'bg-blue-100/10 text-blue-400' :
                                          'bg-yellow-100/10 text-yellow-400'
                                        }`}
                                      >
                                        {reservation.status}
                                      </span>
                                    </td>
                                    <td className="border-b border-gray-700 p-2 text-gray-300">
                                      ${typeof reservation.cost === 'number' ? reservation.cost.toFixed(2) : (parseFloat(reservation.cost) || 0).toFixed(2)}
                                    </td>
                                    <td className="border-b border-gray-700 p-2 flex gap-2">
                                      <button
                                        onClick={() => handleEditClick(reservation)}
                                        className="text-red-500 hover:text-red-400 hover:scale-125 transition-all duration-200 ease-in-out"
                                        title="Edit"
                                      >
                                        <PencilIcon className="h-5 w-5" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(reservation.id, reservation.reservationType)}
                                        className="text-red-500 hover:text-red-400 hover:scale-125 transition-all duration-200 ease-in-out"
                                        title="Delete"
                                      >
                                        <TrashIcon className="h-5 w-5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-400">
                            No reservations found for this user.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Service Management */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
              <h2 className="text-2xl font-bold text-white font-[Poppins]">Reservations Management</h2>
              <div className="flex flex-wrap gap-2">
                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 rounded-md border bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-[Open Sans]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                
                {/* Reservation Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="p-2 rounded-md border bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-[Open Sans]"
                >
                  <option value="All">All Types</option>
                  <option value="Service">Service Center</option>
                  <option value="Technician">Technician Visits</option>
                </select>
                
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 hover:scale-110 transition-all duration-200 ease-in-out flex items-center gap-1"
                >
                  <PlusIcon className="h-5 w-5" /> Add Reservation
                </button>
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Loading reservations...</p>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-100 p-4 rounded-md mb-4">
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {/* No Results State */}
            {!loading && !error && filteredServices.length === 0 && (
              <div className="text-center py-10 bg-white/5 rounded-md border border-gray-700/50">
                <p className="text-gray-300">No reservations found matching your filters.</p>
              </div>
            )}
            
            {/* Results Table */}
            {!loading && !error && filteredServices.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-md">
                  <thead>
                    <tr className="bg-red-600 text-white">
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Type</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Customer</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Date</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Service</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Status</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Cost</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-700/50">
                        <td className="border border-gray-700/50 p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-[Open Sans] ${
                            service.reservationType === 'Service' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {service.reservationType === 'Service' ? 'Service Center' : 'Technician Visit'}
                          </span>
                        </td>
                        <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">{service.customer}</td>
                        <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">{service.date}</td>
                        <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">{service.type}</td>
                        <td className="border border-gray-700/50 p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-[Open Sans] ${
                              service.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              service.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {service.status}
                          </span>
                        </td>
                        <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">
                          ${typeof service.cost === 'number' ? service.cost.toFixed(2) : (parseFloat(service.cost) || 0).toFixed(2)}
                        </td>
                        <td className="border border-gray-700/50 p-3 flex gap-2">
                          <button
                            onClick={() => handleEditClick(service)}
                            className="text-red-500 hover:text-red-400 hover:scale-125 transition-all duration-200 ease-in-out"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id, service.reservationType)}
                            className="text-red-500 hover:text-red-400 hover:scale-125 transition-all duration-200 ease-in-out"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Add Service Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="p-6 rounded-lg shadow-xl w-full max-w-md bg-gray-800 text-white">
                <h3 className="text-xl font-semibold mb-4 font-[Raleway] text-white">Add New Reservation</h3>
                <form onSubmit={handleServiceSubmit} className="space-y-4 font-[Open Sans]">
                  <div>
                    <label className="block mb-1 text-gray-300">Reservation Type</label>
                    <select
                      value={newService.reservationType}
                      onChange={(e) => setNewService({ ...newService, reservationType: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Service">Service Center</option>
                      <option value="Technician">Technician Visit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Customer Name</label>
                    <input
                      type="text"
                      value={newService.customer}
                      onChange={(e) => setNewService({ ...newService, customer: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-gray-300">Email</label>
                      <input
                        type="email"
                        value={newService.email || ''}
                        onChange={(e) => setNewService({ ...newService, email: e.target.value })}
                        className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="customer@example.com"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-300">Phone</label>
                      <input
                        type="tel"
                        value={newService.phone || ''}
                        onChange={(e) => setNewService({ ...newService, phone: e.target.value })}
                        className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Date</label>
                    <input
                      type="date"
                      value={newService.date}
                      onChange={(e) => setNewService({ ...newService, date: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Service Type</label>
                    <input
                      type="text"
                      value={newService.type}
                      onChange={(e) => setNewService({ ...newService, type: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Oil Change"
                      required
                    />
                  </div>
                  {newService.reservationType === 'Technician' && (
                    <div>
                      <label className="block mb-1 text-gray-300">Address</label>
                      <input
                        type="text"
                        value={newService.address || ''}
                        onChange={(e) => setNewService({ ...newService, address: e.target.value })}
                        className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Customer address"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block mb-1 text-gray-300">Status</label>
                    <select
                      value={newService.status}
                      onChange={(e) => setNewService({ ...newService, status: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Cost ($)</label>
                    <input
                      type="number"
                      value={newService.cost}
                      onChange={(e) => setNewService({ ...newService, cost: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., 50"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Notes</label>
                    <textarea
                      value={newService.notes || ''}
                      onChange={(e) => setNewService({ ...newService, notes: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="2"
                      placeholder="Any additional information"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Service Modal */}
          {showEditModal && editService && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="p-6 rounded-lg shadow-xl w-full max-w-md bg-gray-800 text-white">
                <h3 className="text-xl font-semibold mb-4 font-[Raleway] text-white">
                  Edit {editService.reservationType === 'Service' ? 'Service Center' : 'Technician'} Reservation
                </h3>
                <p className="text-sm text-gray-400 mb-4">ID: {editService.id}</p>
                <p className="text-xs text-gray-400 mb-4">Collection: {editService.reservationType === 'Service' ? 'servicereservations' : 'technicianreservations'}</p>
                <form onSubmit={handleEditSubmit} className="space-y-4 font-[Open Sans]">
                  <div>
                    <label className="block mb-1 text-gray-300">Customer Name</label>
                    <input
                      type="text"
                      value={editService.customer || ''}
                      onChange={(e) => setEditService({ ...editService, customer: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      readOnly // Make it readonly in edit mode
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-gray-300">Email</label>
                      <input
                        type="email"
                        value={editService.email || ''}
                        className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-300">Phone</label>
                      <input
                        type="tel"
                        value={editService.phone || ''}
                        className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Date</label>
                    <input
                      type="text" 
                      value={editService.date || ''}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Service Type</label>
                    <input
                      type="text"
                      value={editService.type || ''}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      readOnly
                    />
                  </div>
                  {editService.reservationType === 'Technician' && (
                    <div>
                      <label className="block mb-1 text-gray-300">Address</label>
                      <input
                        type="text"
                        value={editService.address || 'Not provided'}
                        className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        readOnly
                      />
                    </div>
                  )}
                  <div>
                    <label className="block mb-1 text-gray-300">Status</label>
                    <select
                      value={editService.status || 'Pending'}
                      onChange={(e) => setEditService({ ...editService, status: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Cost ($)</label>
                    <input
                      type="number"
                      value={editService.cost || 0}
                      onChange={(e) => setEditService({ ...editService, cost: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Notes</label>
                    <textarea
                      value={editService.notes || ''}
                      onChange={(e) => setEditService({ ...editService, notes: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="2"
                      placeholder="No notes"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default AdminDashboard;