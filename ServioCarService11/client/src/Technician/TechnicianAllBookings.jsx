import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  WrenchScrewdriverIcon, 
  DocumentTextIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  CheckIcon,
  XMarkIcon
} from "@heroicons/react/24/solid";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, collection, query, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';

const TechnicianAllBookings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterAssignment, setFilterAssignment] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch all technician bookings without filtering by technician
  useEffect(() => {
    const fetchAllBookings = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get all technician bookings from Firebase
        const bookingsQuery = query(
          collection(db, "technicianreservations")
        );
        
        const snapshot = await getDocs(bookingsQuery);
        
        if (!snapshot.empty) {
          const formattedBookings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              vehicle: `${data.vehicleMake || ''} ${data.vehicleModel || ''}`,
              customer: data.customerName || data.name || 'Unknown',
              service: data.serviceType || data.service || (data.message ? data.message.substring(0, 20) : 'General Service'),
              status: data.status || 'Pending',
              date: data.serviceDate || new Date().toLocaleDateString(),
              notes: data.message || data.notes || 'No description provided',
              address: data.address || 'No address provided',
              customerPhone: data.phone || 'No phone provided',
              isAssigned: data.technicianId ? true : false,
              isMine: data.technicianId === currentUser.uid,
              technicianId: data.technicianId || '',
              technicianName: data.technicianName || ''
            };
          });
          
          setJobs(formattedBookings);
        } else {
          setError("No technician bookings found in the system");
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllBookings();
  }, [currentUser]);

  const handleAccept = async (job) => {
    if (!currentUser) {
      setError("You must be logged in to accept bookings");
      return;
    }
    
    if (window.confirm(`Are you sure you want to accept this booking from ${job.customer}?`)) {
      try {
        setLoading(true);
        
        // Update the job in Firebase
        const jobRef = doc(db, "technicianreservations", job.id);
        await updateDoc(jobRef, {
          technicianId: currentUser.uid,
          technicianName: currentUser.displayName || "Technician",
          status: "In Progress"
        });
        
        // Update local state
        setJobs(prevJobs => 
          prevJobs.map(j => 
            j.id === job.id 
              ? { 
                  ...j, 
                  technicianId: currentUser.uid, 
                  technicianName: currentUser.displayName || "Technician", 
                  status: "In Progress",
                  isAssigned: true,
                  isMine: true
                } 
              : j
          )
        );
        
        setMessage("Booking accepted successfully!");
      } catch (err) {
        console.error("Error accepting booking:", err);
        setError("Failed to accept booking. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRelease = async (job) => {
    if (!currentUser) return;
    
    if (window.confirm(`Are you sure you want to release this booking from ${job.customer}?`)) {
      try {
        setLoading(true);
        
        // Update the job in Firebase if it was assigned to this technician
        if (job.technicianId === currentUser.uid) {
          const jobRef = doc(db, "technicianreservations", job.id);
          await updateDoc(jobRef, {
            technicianId: "",
            technicianName: "",
            status: "Pending"
          });
          
          // Update local state
          setJobs(prevJobs => 
            prevJobs.map(j => 
              j.id === job.id 
                ? { 
                    ...j, 
                    technicianId: "", 
                    technicianName: "", 
                    status: "Pending",
                    isAssigned: false,
                    isMine: false
                  } 
                : j
            )
          );
          
          setMessage("Booking returned to available pool");
        } else {
          setError("You can only release bookings assigned to you");
        }
      } catch (err) {
        console.error("Error releasing booking:", err);
        setError("Failed to release booking. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (jobId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this booking? This action cannot be undone.");
    if (confirmDelete) {
      try {
        setLoading(true);
        
        // Delete from Firebase
        const jobRef = doc(db, "technicianreservations", jobId);
        await deleteDoc(jobRef);
        
        // Update UI
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        setMessage("Booking deleted successfully");
      } catch (err) {
        console.error("Error deleting booking:", err);
        setError("Failed to delete booking. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, delay: i * 0.05 },
    }),
    hover: { scale: 1.01, transition: { duration: 0.2 } },
  };

  // Filter jobs based on user selections
  const filteredJobs = jobs
    .filter(job => filterStatus === "All" || job.status === filterStatus)
    .filter(job => {
      if (filterAssignment === "All") return true;
      if (filterAssignment === "Assigned" && job.isAssigned) return true;
      if (filterAssignment === "Unassigned" && !job.isAssigned) return true;
      if (filterAssignment === "My Jobs" && job.isMine) return true;
      return false;
    })
    .filter(job => 
      searchTerm.trim() === "" || 
      job.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.address && job.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading available bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white font-sans relative">
      {/* Background Image Section */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('./images/tpr.jpg')", 
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
      </div>
      
      {/* Header */}
      <header className="flex justify-between items-center bg-gray-900 p-4 shadow-lg sticky top-0 z-10 mb-8">
        <div className="flex items-center">
          <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
          <h1 className="text-2xl font-bold text-white font-[Poppins]">
            Available Bookings
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all duration-300 no-underline font-[Open Sans]"
          >
            <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Notifications */}
        {message && (
          <div className="bg-green-600/20 border border-green-500 text-green-300 px-4 py-2 rounded-md mb-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-3 rounded-md mb-4 flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}
        
        {/* Booking count summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm">Total Bookings</p>
            <p className="text-2xl font-bold text-white">{jobs.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm">Available</p>
            <p className="text-2xl font-bold text-yellow-400">
              {jobs.filter(job => !job.isAssigned).length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm">My Jobs</p>
            <p className="text-2xl font-bold text-green-400">
              {jobs.filter(job => job.isMine).length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm">Assigned to Others</p>
            <p className="text-2xl font-bold text-blue-400">
              {jobs.filter(job => job.isAssigned && !job.isMine).length}
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold font-[Poppins] text-white mb-4">Filter Bookings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="statusFilter" className="block mb-1 text-sm text-gray-300 font-[Open Sans]">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="assignFilter" className="block mb-1 text-sm text-gray-300 font-[Open Sans]">
                Filter by Assignment
              </label>
              <select
                id="assignFilter"
                value={filterAssignment}
                onChange={(e) => setFilterAssignment(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="All">All Bookings</option>
                <option value="Unassigned">Available Bookings</option>
                <option value="Assigned">Assigned Bookings</option>
                <option value="My Jobs">My Bookings</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="searchInput" className="block mb-1 text-sm text-gray-300 font-[Open Sans]">
                Search
              </label>
              <input
                id="searchInput"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by vehicle, customer, service..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilterStatus("All");
                setFilterAssignment("All");
                setSearchTerm("");
              }}
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <h2 className="text-2xl font-bold font-[Poppins] text-white mb-6">
          Available Bookings
        </h2>
        
        <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, index) => (
                    <motion.tr
                      key={job.id}
                      custom={index}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      className={`${
                        job.isMine 
                          ? "bg-green-900/20" 
                          : job.isAssigned 
                          ? "bg-gray-700/30" 
                          : "bg-yellow-900/10"
                      } backdrop-blur-md`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-white">{job.customer}</div>
                          <div className="text-xs text-gray-400">{job.customerPhone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {job.vehicle || "Not specified"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex flex-col">
                          <div>{job.service}</div>
                          <div className="text-xs text-gray-400">{job.date}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            job.status === "Completed"
                              ? "bg-green-900/50 text-green-300"
                              : job.status === "In Progress"
                              ? "bg-blue-900/50 text-blue-300"
                              : "bg-yellow-900/50 text-yellow-300"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {job.isAssigned ? (
                          job.isMine ? (
                            <span className="text-green-400">Assigned to me</span>
                          ) : (
                            <span className="text-gray-400">Assigned to {job.technicianName || "another technician"}</span>
                          )
                        ) : (
                          <span className="text-yellow-400">Available</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/view-details/${job.id}`}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors duration-200 inline-flex items-center"
                          >
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            Details
                          </Link>
                          
                          {job.isMine ? (
                            <>
                              <Link
                                to={`/update-status/${job.id}`}
                                className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors duration-200 inline-flex items-center"
                              >
                                <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
                                Update
                              </Link>
                              
                              <button
                                onClick={() => handleRelease(job)}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors duration-200 inline-flex items-center"
                              >
                                <XMarkIcon className="h-4 w-4 mr-1" />
                                Release
                              </button>
                            </>
                          ) : (
                            !job.isAssigned && (
                              <button
                                onClick={() => handleAccept(job)}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors duration-200 inline-flex items-center"
                              >
                                <CheckIcon className="h-4 w-4 mr-1" />
                                Accept
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-300 text-sm">
                      <div className="flex flex-col items-center justify-center">
                        <DocumentTextIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <p>No bookings found</p>
                        <p className="text-xs text-gray-500 mt-1">Try changing your filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TechnicianAllBookings;
