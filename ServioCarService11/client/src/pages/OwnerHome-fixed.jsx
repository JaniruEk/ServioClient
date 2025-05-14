// src/pages/OwnerHome.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  WrenchScrewdriverIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  InformationCircleIcon,
  BuildingStorefrontIcon
} from "@heroicons/react/24/solid";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import Footer from "../components/Footer";
import OwnerSidebar from "../components/OwnerSidebar"; // Import the new OwnerSidebar component

const OwnerHome = ({ user }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [showStatusDropdownEdit, setShowStatusDropdownEdit] = useState(false);

  const statuses = ["Pending", "Completed", "Cancelled"];
  const types = ["All", "Service Center", "Technician"];
  
  // Fetch bookings from Firestore
  useEffect(() => {
    if (!user || !user.uid) {
      setIsLoading(false);
      return;
    }
    
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching bookings for user ID:", user.uid);
        
        // Create a query to get bookings for the current user from main bookings collection
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid)
        );

        // Create additional queries to get technician bookings specifically
        const technicianBookingsQuery = query(
          collection(db, "technicianreservations"),
          where("userId", "==", user.uid)
        );

        console.log("Fetching both regular and technician bookings");
        
        // Execute the queries
        const [querySnapshot, technicianSnapshot] = await Promise.all([
          getDocs(bookingsQuery),
          getDocs(technicianBookingsQuery)
        ]);
        
        console.log("Regular bookings found:", querySnapshot.size);
        console.log("Technician bookings found:", technicianSnapshot.size);
        
        // Array to store all bookings
        let allBookingsData = [];
        
        // Process bookings from main bookings collection
        if (!querySnapshot.empty) {
          const bookingsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Raw booking data from Firebase:', data);
            
            // Handle different date formats
            let formattedDate = '';
            if (data.serviceDate) {
              formattedDate = data.serviceDate;
            } else if (data.createdAt) {
              if (data.createdAt.toDate) { // It's a Firebase Timestamp
                formattedDate = data.createdAt.toDate().toISOString().split('T')[0];
              } else if (typeof data.createdAt === 'string') { // It's an ISO string
                formattedDate = data.createdAt.split('T')[0];
              }
            }
            
            // Normalize status field
            let normalizedStatus = data.status || 'Pending';
            if (normalizedStatus === 'pending') {
              normalizedStatus = 'Pending';
            } else if (normalizedStatus === 'completed') {
              normalizedStatus = 'Completed';
            } else if (normalizedStatus === 'cancelled') {
              normalizedStatus = 'Cancelled';
            }

            // Ensure booking type is set correctly
            const bookingType = data.bookingType || 
              (data.technicianId ? 'technician' : 'service-center');
            
            return {
              id: doc.id,
              ...data,
              date: formattedDate || '',
              serviceDate: formattedDate || '',
              type: data.serviceType || (data.message ? data.message.substring(0, 20) : 'General Service'),
              serviceType: data.serviceType || (data.message ? data.message.substring(0, 20) : 'General Service'),
              bookingType: bookingType,
              status: normalizedStatus,
              cost: typeof data.cost === 'number' ? data.cost : 0,
              serviceCenterName: data.serviceCenterName || 'Unknown Service Center',
              technicianName: data.technicianName || 'Unknown Technician',
              serviceTime: data.serviceTime || '00:00'
            };
          });
          
          allBookingsData = [...bookingsData];
        }
        
        // Process technician bookings
        if (!technicianSnapshot.empty) {
          console.log("Found technician bookings:", technicianSnapshot.size);
          
          const technicianBookingsData = technicianSnapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Raw technician booking data:', data);
            
            // Handle different date formats
            let formattedDate = '';
            if (data.serviceDate) {
              formattedDate = data.serviceDate;
            } else if (data.createdAt) {
              if (data.createdAt.toDate) { // It's a Firebase Timestamp
                formattedDate = data.createdAt.toDate().toISOString().split('T')[0];
              } else if (typeof data.createdAt === 'string') { // It's an ISO string
                formattedDate = data.createdAt.split('T')[0];
              }
            }
            
            // Normalize status field
            let normalizedStatus = data.status || 'Pending';
            if (normalizedStatus === 'pending') {
              normalizedStatus = 'Pending';
            } else if (normalizedStatus === 'completed') {
              normalizedStatus = 'Completed';
            } else if (normalizedStatus === 'cancelled') {
              normalizedStatus = 'Cancelled';
            }
            
            return {
              id: doc.id,
              ...data,
              date: formattedDate || '',
              serviceDate: formattedDate || '',
              type: data.serviceType || (data.message ? data.message.substring(0, 20) : 'Technician Service'),
              serviceType: data.serviceType || (data.message ? data.message.substring(0, 20) : 'Technician Service'),
              bookingType: 'technician', // Explicitly set booking type for technician bookings
              status: normalizedStatus,
              cost: typeof data.cost === 'number' ? data.cost : 0,
              technicianName: data.technicianName || 'Unknown Technician',
              serviceTime: data.serviceTime || '00:00'
            };
          });
          
          // Add technician bookings to all bookings
          allBookingsData = [...allBookingsData, ...technicianBookingsData];
          console.log('Added technician bookings to all bookings, current count:', allBookingsData.length);
        } else {
          console.log("No technician bookings found");
        }
        
        if (allBookingsData.length > 0) {
          // Sort all bookings by date (most recent first)
          allBookingsData.sort((a, b) => new Date(b.date || '2000-01-01') - new Date(a.date || '2000-01-01'));
          
          console.log('All processed bookings:', allBookingsData);
          setBookings(allBookingsData);
        } else {
          console.log("No bookings found");
          // Set sample bookings if no bookings are found
          setBookings([
            { 
              id: 1, 
              date: "2025-03-10", 
              serviceDate: "2025-03-10",
              serviceTime: "10:00 AM",
              type: "Oil Change", 
              serviceType: "Oil Change",
              status: "Completed", 
              cost: 50, 
              serviceCenterName: "Downtown Service Center",
              bookingType: "service-center" 
            },
            { 
              id: 2, 
              date: "2025-02-20", 
              serviceDate: "2025-02-20",
              serviceTime: "02:00 PM",
              type: "Brake Repair", 
              serviceType: "Brake Repair",
              status: "Completed", 
              cost: 150, 
              technicianName: "Alex Rodriguez",
              bookingType: "technician" 
            },
            { 
              id: 3, 
              date: "2025-04-15", 
              serviceDate: "2025-04-15",
              serviceTime: "11:00 AM",
              type: "Tire Rotation", 
              serviceType: "Tire Rotation",
              status: "Pending", 
              cost: 80, 
              serviceCenterName: "Westside Auto Care",
              bookingType: "service-center" 
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        // Provide more specific error messages based on the Firebase error code
        let errorMessage = `Error fetching bookings: ${err.message}`;
        
        if (err.code) {
          switch (err.code) {
            case 'permission-denied':
              errorMessage = 'Permission denied when accessing bookings. Please try logging out and back in.';
              break;
            case 'unavailable':
              errorMessage = 'The service is currently unavailable. Please check your internet connection.';
              break;
            case 'not-found':
              errorMessage = 'The requested booking data could not be found.';
              break;
            case 'invalid-argument':
              errorMessage = 'Invalid query parameters when fetching bookings.';
              break;
          }
        }
        
        console.log('Full error details:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);  
  
  // Filter bookings based on status and type
  const filteredBookings = bookings.filter((booking) => {
    // Log individual booking data to debug filtering
    console.log('Filtering booking:', booking.id, {
      status: booking.status,
      filterStatus,
      bookingType: booking.bookingType,
      filterType,
    });
    
    const matchesStatus = filterStatus === "All" || booking.status === filterStatus;
    const matchesType = filterType === "All" || 
                       (filterType === "Service Center" && booking.bookingType === "service-center") ||
                       (filterType === "Technician" && booking.bookingType === "technician");
    
    // Log result of filter match
    const result = matchesStatus && matchesType;
    console.log('Filter result:', result);
    
    return result;
  });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const updatedService = { ...editService, cost: Number(editService.cost) };

    try {
      // Check if it's a real Firebase document (string ID) vs. sample data (numeric ID)
      if (typeof updatedService.id === 'string') {
        // Determine which collection to update based on booking type
        const bookingCollection = updatedService.bookingType === 'technician' 
          ? 'technicianreservations' 
          : 'bookings';
        
        // Update the booking
        const bookingRef = doc(db, bookingCollection, updatedService.id);
        await updateDoc(bookingRef, {
          serviceDate: updatedService.serviceDate,
          serviceTime: updatedService.serviceTime,
          serviceType: updatedService.serviceType,
          status: updatedService.status,
          cost: updatedService.cost
        });
        console.log(`Booking updated in ${bookingCollection} collection`);
        
        // For regular bookings, also update the corresponding reservation if it exists
        if (bookingCollection === 'bookings') {
          // Try to find and update the corresponding reservation
          try {
            const reservationsQuery = query(
              collection(db, 'servicereservations'),
              where("bookingId", "==", updatedService.id)
            );
            
            const reservationsSnapshot = await getDocs(reservationsQuery);
            if (!reservationsSnapshot.empty) {
              const reservationDoc = reservationsSnapshot.docs[0];
              await updateDoc(doc(db, 'servicereservations', reservationDoc.id), {
                serviceDate: updatedService.serviceDate,
                serviceTime: updatedService.serviceTime,
                serviceType: updatedService.serviceType,
                status: updatedService.status,
                cost: updatedService.cost
              });
              console.log('Booking also updated in service reservations');
            }
          } catch (reservationError) {
            console.error('Error updating reservation:', reservationError);
            // Continue execution even if this fails
          }
        }
      }
      
      // Update the local state
      setBookings(
        bookings.map((booking) =>
          booking.id === updatedService.id ? updatedService : booking
        )
      );

      alert('Booking updated successfully!');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert(`Error updating booking: ${error.message}`);
    } finally {
      setEditService(null);
      setShowEditModal(false);
      setShowStatusDropdownEdit(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        // Check if it's a real Firebase document (string ID) vs. sample data (numeric ID)
        if (typeof id === 'string') {
          // Find the booking to get its type before deleting
          const bookingToDelete = bookings.find(booking => booking.id === id);
          const bookingType = bookingToDelete?.bookingType || 'service-center';
          
          // Delete from appropriate collection based on booking type
          const bookingCollection = bookingType === 'technician' ? 'technicianreservations' : 'bookings';
          const bookingRef = doc(db, bookingCollection, id);
          await deleteDoc(bookingRef);
          console.log(`Booking deleted from ${bookingCollection} collection`);
          
          // For regular bookings, also delete the corresponding reservation if it exists
          if (bookingCollection === 'bookings') {
            try {
              const reservationsQuery = query(
                collection(db, 'servicereservations'),
                where("bookingId", "==", id)
              );
              
              const reservationsSnapshot = await getDocs(reservationsQuery);
              if (!reservationsSnapshot.empty) {
                const reservationDoc = reservationsSnapshot.docs[0];
                await deleteDoc(doc(db, 'servicereservations', reservationDoc.id));
                console.log('Booking also deleted from service reservations');
              }
            } catch (reservationError) {
              console.error('Error deleting reservation:', reservationError);
              // Continue execution even if this fails
            }
          }
        }
        
        // Update local state
        setBookings(bookings.filter((booking) => booking.id !== id));
        alert('Booking deleted successfully!');
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert(`Error deleting booking: ${error.message}`);
      }
    }
  };
  
  const handleEditClick = (booking) => {
    setEditService({ ...booking });
    setShowEditModal(true);
  };  
  
  // Count statistics
  const totalServices = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const serviceCenterBookings = bookings.filter((b) => b.bookingType === "service-center").length;
  const technicianBookings = bookings.filter((b) => b.bookingType === "technician").length;
  
  // Debug info - log booking types and statuses
  useEffect(() => {
    console.log("Total bookings:", bookings.length);
    console.log("Service center bookings:", serviceCenterBookings);
    console.log("Technician bookings:", technicianBookings);
    console.log("Current filter type:", filterType);
    console.log("Current filter status:", filterStatus);
    console.log("Filtered bookings count:", filteredBookings.length);
    
    // Log each booking's type and status
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`, {
        id: booking.id,
        type: booking.serviceType,
        bookingType: booking.bookingType,
        status: booking.status,
        provider: booking.serviceCenterName || booking.technicianName
      });
    });
  }, [bookings, filterStatus, filterType, filteredBookings.length]);
  
  // Get next upcoming booking
  const upcomingBooking = bookings.find(b => b.status === "Pending");

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
        backgroundAttachment: "fixed", // Makes the image static
        backgroundSize: "cover", // Ensures the image covers the container
        backgroundPosition: "center", // Centers the image
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>

      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <OwnerSidebar activePath="/owner-home" />

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">
                Servio Customer Dashboard
              </h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">
                Manage your vehicle services with ease
              </p>
            </div>
          </header>
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
              <p className="ml-3 text-white">Loading your bookings...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 backdrop-blur-md p-4 rounded-lg mb-8">
              <p className="text-red-300">{error}</p>
            </div>
          ) : null}

          {/* Overview Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <CalendarIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">
                Upcoming Service
              </h3>
              {upcomingBooking ? (
                <div>
                  <p className="text-gray-300 font-[Open Sans]">
                    {upcomingBooking.serviceDate} at {upcomingBooking.serviceTime}
                  </p>
                  <p className="text-gray-300 font-[Open Sans]">
                    {upcomingBooking.serviceType}
                  </p>
                  <p className="text-gray-300 font-[Open Sans]">
                    {upcomingBooking.serviceCenterName || upcomingBooking.technicianName}
                  </p>
                </div>
              ) : (
                <p className="text-gray-300 font-[Open Sans]">
                  No upcoming services scheduled.
                </p>
              )}
              <button
                onClick={() => navigate("/service-centers")}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 ease-in-out"
              >
                Schedule Now
              </button>
            </div>
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <WrenchScrewdriverIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">
                Total Services
              </h3>
              <p className="text-gray-300 font-[Open Sans] text-2xl font-bold">{totalServices}</p>
            </div>
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <BuildingStorefrontIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">
                Booking Summary
              </h3>
              <div className="space-y-2">
                <p className="text-gray-300 font-[Open Sans]">
                  <span className="font-semibold">Pending:</span> {pendingBookings}
                </p>
                <p className="text-gray-300 font-[Open Sans]">
                  <span className="font-semibold">Service Centers:</span> {serviceCenterBookings}
                </p>
                <p className="text-gray-300 font-[Open Sans]">
                  <span className="font-semibold">Technicians:</span> {technicianBookings}
                </p>
              </div>
            </div>
          </section>

          {/* Service History */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
              <h2 className="text-2xl font-bold text-white font-[Poppins]">Your Service History</h2>
              <div className="flex gap-2">
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
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="p-2 rounded-md border bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-[Open Sans]"
                >
                  <option value="All">All Types</option>
                  <option value="Service Center">Service Centers</option>
                  <option value="Technician">Technicians</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-md">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Date</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">
                      Service Type
                    </th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Provider</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Booking Type</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Status</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Cost</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-700/50">
                        <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">
                          {booking.serviceDate} at {booking.serviceTime}
                        </td>
                        <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">
                          {booking.serviceType}
                        </td>
                        <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">
                          {booking.serviceCenterName || booking.technicianName || 'Unknown'}
                        </td>
                        <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              booking.bookingType === 'service-center'
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {booking.bookingType === 'service-center' ? 'Service Center' : 'Technician'}
                          </span>
                        </td>
                        <td className="border border-gray-700/50 p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-[Open Sans] ${
                              booking.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">
                          ${typeof booking.cost === 'number' ? booking.cost.toFixed(2) : '0.00'}
                        </td>
                        <td className="border border-gray-700/50 p-3 flex gap-2">
                          <button
                            onClick={() => handleEditClick(booking)}
                            className="text-red-500 hover:text-red-400 hover:scale-125 transition-all duration-200 ease-in-out"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="text-red-500 hover:text-red-400 hover:scale-125 transition-all duration-200 ease-in-out"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="border border-gray-700/50 p-6 text-center text-gray-400 font-[Open Sans]">
                        <InformationCircleIcon className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                        <p>No bookings found matching your criteria.</p>
                        <p className="mt-2">
                          <button 
                            onClick={() => navigate('/service-centers')}
                            className="text-red-500 hover:text-red-400 underline"
                          >
                            Book a service center
                          </button> or <button 
                            onClick={() => navigate('/technicians')}
                            className="text-red-500 hover:text-red-400 underline"
                          >
                            find a technician
                          </button>
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Edit Service Modal */}
          {showEditModal && editService && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="p-6 rounded-lg shadow-xl w-full max-w-md bg-gray-800 text-white">
                <h3 className="text-xl font-semibold mb-4 font-[Raleway] text-white">
                  Edit Booking
                </h3>
                <form onSubmit={handleEditSubmit} className="space-y-4 font-[Open Sans]">
                  <div className="mb-4 p-3 bg-gray-700 rounded-md">
                    <p className="text-gray-300">
                      <span className="font-semibold">Booking Type:</span> {editService?.bookingType === 'service-center' ? 'Service Center' : 'Technician'}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-semibold">Provider:</span> {editService?.serviceCenterName || editService?.technicianName || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Service Date</label>
                    <input
                      type="date"
                      value={editService.serviceDate}
                      onChange={(e) => setEditService({ ...editService, serviceDate: e.target.value, date: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Service Time</label>
                    <input
                      type="text"
                      value={editService.serviceTime}
                      onChange={(e) => setEditService({ ...editService, serviceTime: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Service Type</label>
                    <input
                      type="text"
                      value={editService.serviceType}
                      onChange={(e) => setEditService({ 
                        ...editService, 
                        serviceType: e.target.value,
                        type: e.target.value
                      })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Status</label>
                    <select
                      value={editService.status}
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
                      value={editService.cost}
                      onChange={(e) => setEditService({ ...editService, cost: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setShowStatusDropdownEdit(false);
                      }}
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
};

export default OwnerHome;
