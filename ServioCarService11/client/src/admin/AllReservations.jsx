// src/admin/AllReservations.jsx
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaFilter } from 'react-icons/fa';
import Footer from '../components/Footer';
import AdminSidebar from '../components/AdminSidebar';
import { db } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function AllReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch reservations from Firebase
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        console.log("Fetching reservations from Firebase...");
        
        // Fetch service reservations
        const serviceQuery = query(collection(db, "servicereservations"));
        const serviceSnapshot = await getDocs(serviceQuery);
        console.log(`Found ${serviceSnapshot.docs.length} service reservations`);
          const serviceData = serviceSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Service reservation data:", data);
          return {
            id: doc.id,
            customer: data.customerName || data.name || 'Unknown',
            userId: data.userId || '',
            date: data.serviceDate ? 
                  (data.serviceDate instanceof Date ? 
                  data.serviceDate.toLocaleDateString() : 
                  typeof data.serviceDate === 'string' ? 
                  new Date(data.serviceDate).toLocaleDateString() : 
                  data.serviceDate.toDate ? data.serviceDate.toDate().toLocaleDateString() : 'Unknown Date') : 
                  'Unknown Date',
            createdAt: data.createdAt ? 
                      (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : 
                      new Date(),
            type: data.serviceType || 'General Service',
            status: data.status || 'Pending',
            cost: data.cost || 0,
            email: data.email || '',
            phone: data.phone || '',
            vehicleDetails: data.vehicleDetails || '',
            vehicleMake: data.vehicleMake || '',
            vehicleModel: data.vehicleModel || '',
            vehicleYear: data.vehicleYear || '',
            notes: data.notes || '',
            reservationType: 'Service',
            serviceCenterId: data.serviceCenterId || '',
            serviceCenterName: data.serviceCenterName || '',
            rawData: data
          };
        });
        
        // Fetch technician reservations
        const techQuery = query(collection(db, "technicianreservations"));
        const techSnapshot = await getDocs(techQuery);
        console.log(`Found ${techSnapshot.docs.length} technician reservations`);
          const techData = techSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Technician reservation data:", data);
          return {
            id: doc.id,
            customer: data.customerName || data.name || 'Unknown',
            userId: data.userId || '',
            date: data.date ? 
                  (data.date instanceof Date ? 
                  data.date.toLocaleDateString() : 
                  typeof data.date === 'string' ? 
                  new Date(data.date).toLocaleDateString() : 
                  data.date.toDate ? data.date.toDate().toLocaleDateString() : 'Unknown Date') : 
                  'Unknown Date',
            createdAt: data.createdAt ? 
                      (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : 
                      new Date(),
            type: data.serviceType || data.service || 'Technician Visit',
            status: data.status || 'Pending',
            cost: data.cost || 0,
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            notes: data.notes || data.message || '',
            technicianId: data.technicianId || '',
            technicianName: data.technicianName || '',
            reservationType: 'Technician',
            rawData: data
          };
        });
        
        // Combine both types of reservations
        const allReservations = [...serviceData, ...techData];
        console.log(`Combined ${allReservations.length} total reservations`);
        setReservations(allReservations);
        
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError(`Failed to load reservations: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservations();
  }, []);
  // Filter reservations based on current filter settings and search term
  const filteredReservations = reservations.filter(reservation => {
    // Check status filter
    const statusMatch = filterStatus === 'All' || reservation.status === filterStatus;
    
    // Check reservation type filter
    const typeMatch = filterType === 'All' || reservation.reservationType === filterType;
    
    // Check search term
    const searchMatch = 
      searchTerm === '' ||
      reservation.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.email && reservation.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reservation.phone && reservation.phone.includes(searchTerm)) ||
      reservation.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && typeMatch && searchMatch;
  });

  const handleUpdateStatus = async (reservation, newStatus) => {
    try {
      // Determine which collection to update based on reservation type
      const collectionName = reservation.reservationType === 'Service' ? 'servicereservations' : 'technicianreservations';
      
      // Update in Firestore
      const reservationRef = doc(db, collectionName, reservation.id);
      await updateDoc(reservationRef, {
        status: newStatus
      });
      
      // Update local state
      setReservations(prevReservations => 
        prevReservations.map(item => 
          item.id === reservation.id ? {...item, status: newStatus} : item
        )
      );
      
    } catch (err) {
      console.error("Error updating reservation status:", err);
      alert("Failed to update reservation status. Please try again.");
    }
  };

  const handleDelete = async (reservation) => {
    if (window.confirm("Are you sure you want to delete this reservation? This action cannot be undone.")) {
      try {
        // Determine which collection to delete from based on reservation type
        const collectionName = reservation.reservationType === 'Service' ? 'servicereservations' : 'technicianreservations';
        
        // Delete from Firestore
        const reservationRef = doc(db, collectionName, reservation.id);
        await deleteDoc(reservationRef);
        
        // Update local state
        setReservations(prevReservations => 
          prevReservations.filter(item => item.id !== reservation.id)
        );
        
      } catch (err) {
        console.error("Error deleting reservation:", err);
        alert("Failed to delete reservation. Please try again.");
      }
    }
  };

  const openDetailModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  // Get count of reservations by status
  const pendingCount = reservations.filter(res => res.status === 'Pending').length;
  const completedCount = reservations.filter(res => res.status === 'Completed').length;
  const cancelledCount = reservations.filter(res => res.status === 'Cancelled').length;
  
  return (
    <div
      className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>

      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <AdminSidebar activePath="/all-reservations" />

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">All Reservations</h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">View and manage all customer reservations</p>
            </div>
          </header>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Total Reservations</h3>
              <p className="text-3xl font-bold">{reservations.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Pending</h3>
              <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-400">{completedCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Cancelled</h3>
              <p className="text-3xl font-bold text-red-400">{cancelledCount}</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="flex gap-4 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 rounded-md border bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="In Progress">In Progress</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-2 rounded-md border bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="All">All Types</option>
                <option value="Service">Service Center</option>
                <option value="Technician">Technician</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 pl-8 rounded-md border bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
              />
              <FaFilter className="absolute left-2.5 top-3 text-gray-400" />
            </div>
          </div>

          {/* Reservations Table */}
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-3 text-white/80">Loading reservations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-400">
              <p>{error}</p>
              <button 
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-md">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="border border-gray-700/50 p-3 text-left">Customer</th>
                    <th className="border border-gray-700/50 p-3 text-left">Date</th>
                    <th className="border border-gray-700/50 p-3 text-left">Service Type</th>
                    <th className="border border-gray-700/50 p-3 text-left">Provider</th>
                    <th className="border border-gray-700/50 p-3 text-left">Status</th>
                    <th className="border border-gray-700/50 p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-white/70 border border-gray-700/50">
                        No reservations found
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-700/50">
                        <td className="border border-gray-700/50 p-3 text-gray-300">
                          <div>
                            <p className="font-semibold">{reservation.customer}</p>
                            <p className="text-xs text-gray-400">{reservation.email}</p>
                            <p className="text-xs text-gray-400">{reservation.phone}</p>
                          </div>
                        </td>
                        <td className="border border-gray-700/50 p-3 text-gray-300">{reservation.date}</td>
                        <td className="border border-gray-700/50 p-3 text-gray-300">
                          <div>
                            <p>{reservation.type}</p>
                            <p className="text-xs text-gray-400">{reservation.reservationType}</p>
                          </div>
                        </td>
                        <td className="border border-gray-700/50 p-3 text-gray-300">
                          {reservation.reservationType === 'Service' ? (
                            <span>{reservation.serviceCenterName || 'Unknown Service Center'}</span>
                          ) : (
                            <span>{reservation.technicianName || 'Unknown Technician'}</span>
                          )}
                        </td>
                        <td className="border border-gray-700/50 p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              reservation.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              reservation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              reservation.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {reservation.status}
                          </span>
                        </td>
                        <td className="border border-gray-700/50 p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openDetailModal(reservation)}
                              className="text-blue-400 hover:text-blue-300 hover:scale-125 transition-all duration-200 ease-in-out"
                              title="View Details"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(reservation, 'Completed')}
                              className="text-green-500 hover:text-green-400 hover:scale-125 transition-all duration-200 ease-in-out"
                              title="Mark as Completed"
                              disabled={reservation.status === 'Completed'}
                            >
                              <FaCheck className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(reservation, 'Cancelled')}
                              className="text-red-500 hover:text-red-400 hover:scale-125 transition-all duration-200 ease-in-out"
                              title="Cancel"
                              disabled={reservation.status === 'Cancelled'}
                            >
                              <FaTimes className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(reservation)}
                              className="text-red-500 hover:text-red-400 hover:scale-125 transition-all duration-200 ease-in-out"
                              title="Delete"
                            >
                              <FaTrash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Reservation Detail Modal */}
          {showDetailModal && selectedReservation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
                  Reservation Details
                  <button 
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="border-b border-gray-700 pb-2">
                      <h3 className="text-lg font-semibold text-red-500">Customer Information</h3>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="font-bold">{selectedReservation.customer}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p>{selectedReservation.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p>{selectedReservation.phone}</p>
                    </div>
                    
                    {selectedReservation.reservationType === 'Technician' && (
                      <div>
                        <p className="text-sm text-gray-400">Address</p>
                        <p>{selectedReservation.address}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-b border-gray-700 pb-2">
                      <h3 className="text-lg font-semibold text-red-500">Reservation Details</h3>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Type</p>
                      <p className="font-bold">{selectedReservation.reservationType} Reservation</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Service</p>
                      <p>{selectedReservation.type}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p>{selectedReservation.date}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedReservation.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          selectedReservation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          selectedReservation.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {selectedReservation.status}
                      </span>
                    </div>
                    
                    {selectedReservation.cost > 0 && (
                      <div>
                        <p className="text-sm text-gray-400">Cost</p>
                        <p>${selectedReservation.cost.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedReservation.reservationType === 'Service' && (
                  <div className="mt-6 space-y-4">
                    <div className="border-b border-gray-700 pb-2">
                      <h3 className="text-lg font-semibold text-red-500">Vehicle Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Make</p>
                        <p>{selectedReservation.vehicleMake || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Model</p>
                        <p>{selectedReservation.vehicleModel || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Year</p>
                        <p>{selectedReservation.vehicleYear || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Vehicle Details</p>
                      <p>{selectedReservation.vehicleDetails || 'No details provided'}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 space-y-4">
                  <div className="border-b border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold text-red-500">Additional Information</h3>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Notes</p>
                    <p className="whitespace-pre-line">{selectedReservation.notes || 'No notes provided'}</p>
                  </div>
                  
                  {selectedReservation.reservationType === 'Service' && (
                    <div>
                      <p className="text-sm text-gray-400">Service Center</p>
                      <p>{selectedReservation.serviceCenterName || 'Unknown Service Center'}</p>
                    </div>
                  )}
                  
                  {selectedReservation.reservationType === 'Technician' && (
                    <div>
                      <p className="text-sm text-gray-400">Technician</p>
                      <p>{selectedReservation.technicianName || 'Unknown Technician'}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 flex justify-between">
                  <div>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedReservation, 
                          selectedReservation.status === 'Pending' ? 'Completed' : 'Pending');
                        setShowDetailModal(false);
                      }}
                      className={`px-4 py-2 rounded-md mr-3 ${
                        selectedReservation.status === 'Pending' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      }`}
                    >
                      {selectedReservation.status === 'Pending' ? 'Mark as Completed' : 'Mark as Pending'}
                    </button>
                    
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedReservation, 'Cancelled');
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700"
                      disabled={selectedReservation.status === 'Cancelled'}
                    >
                      Cancel Reservation
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
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

export default AllReservations;
