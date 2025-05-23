import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import serviceCenterService from "../services/serviceCenter.service";
import { motion } from "framer-motion";
import ServiceCenterSidebar from "../components/ServiceCenterSidebar";
import Footer from "../components/Footer";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentListIcon,
  PhoneIcon,
  EnvelopeIcon,
  TruckIcon, // Using TruckIcon instead of CarIcon which doesn't exist
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { auth } from "../firebase";

function ServiceCenterHome() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Fetch reservations when component mounts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchReservations();
      } else {
        navigate("/login");
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  const fetchReservations = async () => {
    try {
      setLoading(true);
      // First try to get data from backend API
      const response = await serviceCenterService.getServiceReservations();
      
      // If backend API fails, fallback to direct Firestore access
      if (!response.success && (response.isNetworkError || response.error === 'Backend server unavailable. Please check if the server is running.')) {
        console.log("Backend API unavailable, fetching directly from Firestore...");
        const firestoreResponse = await serviceCenterService.getServiceReservationsFromFirestore();
        
        if (firestoreResponse.success) {
          setReservations(firestoreResponse.data);
        } else {
          setError(firestoreResponse.error);
        }
      } else if (response.success) {
        setReservations(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError("Failed to load reservations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Filter reservations based on status
  const filteredReservations = filterStatus === "All" 
    ? reservations 
    : reservations.filter(reservation => reservation.status === filterStatus);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="flex flex-1 relative">
        {/* Include the sidebar */}
        <ServiceCenterSidebar activePath="/service-center-home" />

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 p-6 md:p-10 overflow-auto"
        >
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-[Poppins]">
                Service Center Dashboard
              </h1>
              <p className="text-gray-400 font-[Open Sans]">
                Manage your reservations and track business performance
              </p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                className="bg-gradient-to-br from-red-900/40 to-red-800/60 p-6 rounded-lg shadow-lg backdrop-blur-lg border border-red-800/50"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-200">Total Reservations</h3>
                  <ClipboardDocumentListIcon className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-3xl font-bold mt-2">{reservations.length}</p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-blue-900/40 to-blue-800/60 p-6 rounded-lg shadow-lg backdrop-blur-lg border border-blue-800/50"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-200">Pending</h3>
                  <ClockIcon className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold mt-2">
                  {reservations.filter(res => res.status === "pending" || res.status === "Pending").length}
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-green-900/40 to-green-800/60 p-6 rounded-lg shadow-lg backdrop-blur-lg border border-green-800/50"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-200">Completed</h3>
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold mt-2">
                  {reservations.filter(res => res.status === "completed" || res.status === "Completed").length}
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-purple-900/40 to-purple-800/60 p-6 rounded-lg shadow-lg backdrop-blur-lg border border-purple-800/50"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-200">Revenue</h3>
                  <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-3xl font-bold mt-2">
                  ${reservations.reduce((sum, reservation) => sum + (reservation.totalPrice || 0), 0).toFixed(2)}
                </p>
              </motion.div>
            </div>

            {/* Filter Controls */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold font-[Poppins]">Service Reservations</h2>
              
              <div className="flex gap-2">
                <button
                  onClick={() => fetchReservations()}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center gap-2 transition-all duration-300"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  Refresh
                </button>
                
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Reservations List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="bg-red-900/30 border border-red-800 p-6 rounded-lg text-center">
                <ExclamationCircleIcon className="h-12 w-12 mx-auto text-red-500 mb-2" />
                <h3 className="text-xl font-bold text-red-300 mb-1">Error Loading Reservations</h3>
                <p className="text-gray-300">{error}</p>
                <button 
                  onClick={fetchReservations}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
                >
                  Try Again
                </button>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-lg text-center">
                <ClipboardDocumentListIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <h3 className="text-xl font-bold text-gray-300 mb-1">No Reservations Found</h3>
                <p className="text-gray-400">
                  {filterStatus === "All"
                    ? "You don't have any service reservations yet."
                    : `You don't have any ${filterStatus.toLowerCase()} reservations.`}
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6"
              >
                {filteredReservations.map((reservation, index) => (
                  <motion.div
                    key={reservation.id}
                    variants={itemVariants}
                    custom={index}
                    whileHover="hover"
                    className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-lg overflow-hidden border border-gray-700 shadow-lg"
                  >
                    <div className="grid md:grid-cols-5 gap-4 p-6">
                      {/* Status Badge */}
                      <div className="md:col-span-5 flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-white">{reservation.serviceName || "Service Appointment"}</h3>
                        <span className={`py-1 px-3 rounded-full text-sm font-medium flex items-center gap-1 
                          ${(reservation.status?.toLowerCase() === "completed") ? "bg-green-900/40 text-green-300 border border-green-700" : 
                            (reservation.status?.toLowerCase() === "confirmed") ? "bg-blue-900/40 text-blue-300 border border-blue-700" : 
                            (reservation.status?.toLowerCase() === "in progress") ? "bg-yellow-900/40 text-yellow-300 border border-yellow-700" : 
                            (reservation.status?.toLowerCase() === "cancelled") ? "bg-red-900/40 text-red-300 border border-red-700" : 
                            "bg-purple-900/40 text-purple-300 border border-purple-700"}`}
                        >
                          {reservation.status === "pending" ? "Pending" : reservation.status || "Unknown"}
                        </span>
                      </div>
                      
                      {/* Customer Info */}
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                          <UserIcon className="h-5 w-5 text-red-500" />
                          Customer Details
                        </h4>
                        <div className="space-y-2">
                          <p className="text-white">{reservation.customerName || "N/A"}</p>
                          <div className="flex items-center gap-2 text-gray-400">
                            <PhoneIcon className="h-4 w-4" />
                            <span>{reservation.customerPhone || "No phone provided"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <EnvelopeIcon className="h-4 w-4" />
                            <span>{reservation.customerEmail || "No email provided"}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Service Info */}
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                          <ClipboardDocumentListIcon className="h-5 w-5 text-red-500" />
                          Service Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <TruckIcon className="h-4 w-4 text-gray-400" />
                            <span>{reservation.vehicleModel || "Vehicle not specified"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span>{reservation.serviceDate ? new Date(reservation.serviceDate).toLocaleDateString() : "Date not specified"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                            <span>${reservation.totalPrice?.toFixed(2) || "Price not set"}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="md:col-span-1 flex flex-row md:flex-col justify-end gap-2 md:items-end">
                        <button 
                          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all duration-300"
                          onClick={() => navigate(`/service-center/reservation/${reservation.id}`)}
                        >
                          View Details
                        </button>
                        
                        {(reservation.status?.toLowerCase() === "pending" || !reservation.status) && (
                          <button 
                            className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-all duration-300"
                            onClick={() => navigate(`/service-center/accept-reservation/${reservation.id}`)}
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.main>
      </div>
      <Footer />
    </div>
  );
}

export default ServiceCenterHome;
