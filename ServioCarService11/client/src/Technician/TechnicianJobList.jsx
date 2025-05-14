import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { WrenchScrewdriverIcon, DocumentTextIcon, TrashIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { getJobsByTechnician, getTechnicianByUserId, deleteJob, updateJobStatus } from "../services/technician.service";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import TechnicianSidebar from "../components/TechnicianSidebar";
import Footer from "../components/Footer";

const TechnicianJobList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialJobs = [
    {
      id: "J1234",
      vehicle: "Toyota Camry",
      customer: "Chanuka Herath",
      service: "Brake Repair",
      status: "In Progress",
    },
    {
      id: "J1235",
      vehicle: "Ford Focus",
      customer: "Suneth Herath",
      service: "Oil Change",
      status: "Pending",
    },
    {
      id: "J1236",
      vehicle: "Honda Civic",
      customer: "Lakshan Ekanayaka",
      service: "Tire Rotation",
      status: "In Progress",
    },
  ];

  const [jobs, setJobs] = useState(location.state?.jobs || initialJobs);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newStatus, setNewStatus] = useState("In Progress");
  const [updateNotes, setUpdateNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);

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
    useEffect(() => {
    const fetchJobs = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching all available technician bookings from Firebase");
        
        // Get all jobs from Firebase without technician filter to show all available bookings
        const jobsQuery = query(
          collection(db, "technicianreservations")
        );
        
        const jobsSnapshot = await getDocs(jobsQuery);
        
        if (!jobsSnapshot.empty) {
          const formattedJobs = jobsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              vehicle: `${data.vehicleMake || ''} ${data.vehicleModel || ''}`,
              customer: data.customerName || data.name || 'N/A',
              service: data.serviceType || data.service || (data.message ? data.message.substring(0, 20) : 'General Service'),
              status: data.status || 'Pending',
              date: data.date ? 
                    // Simplified date handling - universal format that handles both Timestamp and string dates
                    (data.date.seconds ? new Date(data.date.seconds * 1000).toLocaleDateString() : 
                    new Date(data.date).toLocaleDateString()) : 
                    'Unknown Date',
              notes: data.message || data.notes || 'No description provided',
              address: data.address || 'No address provided',
              customerPhone: data.phone || 'No phone provided',
              isAssigned: data.technicianId ? true : false,
              isMine: data.technicianId === currentUser.uid,
              technicianId: data.technicianId || '',
              firebaseOnly: true // Flag to mark jobs that exist only in Firebase
            };
          });
          setJobs(formattedJobs);
          return; // Successfully got jobs, exit early
        } else {
          // No jobs found in Firebase
          setJobs(location.state?.jobs || initialJobs);
          setError("No bookings found in the system.");
          return;
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load job data. Please try again later.");
        
        // Fallback to initial jobs if provided in location state
        if (location.state?.jobs) {
          setJobs(location.state.jobs);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [currentUser, location.state]);
  const handleDelete = async (jobId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this job? Click 'Yes' to confirm or 'Cancel' to abort.");
    if (confirmDelete) {
      try {
        setLoading(true);
        setError(null);
        
        // Check if this is a Firebase-only job
        const jobToDelete = jobs.find(job => job.id === jobId);
        
        if (jobToDelete?.firebaseOnly) {
          try {
            // Delete from Firebase directly
            const jobDocRef = doc(db, "technicianreservations", jobId);
            await deleteDoc(jobDocRef);
            
            // Update UI
            const updatedJobs = jobs.filter((job) => job.id !== jobId);
            setJobs(updatedJobs);
            setMessage("Job deleted successfully");
          } catch (firebaseErr) {
            console.error("Error deleting job from Firebase:", firebaseErr);
            setError("Failed to delete job from Firebase: " + firebaseErr.message);
          }
        } else {
          // Try to delete using the API first
          try {
            const response = await deleteJob(jobId);
            
            if (response.success) {
              // Update UI if successful
              const updatedJobs = jobs.filter((job) => job.id !== jobId);
              setJobs(updatedJobs);
              setMessage("Job deleted successfully");
            } else if (response.isNetworkError) {
              // If backend is unavailable but we have a Firebase ID, try to delete from Firebase as fallback
              if (jobId && jobId.length > 20) {
                try {
                  const jobDocRef = doc(db, "technicianreservations", jobId);
                  await deleteDoc(jobDocRef);
                  
                  // Update UI
                  const updatedJobs = jobs.filter((job) => job.id !== jobId);
                  setJobs(updatedJobs);
                  setMessage("Deleted in offline mode. Will sync when connection is restored.");
                } catch (fallbackErr) {
                  console.error("Fallback to Firebase also failed:", fallbackErr);
                  setError("Failed to delete job. Please check your connection.");
                }
              } else {
                setError("Cannot delete job while offline. Please try again when connected.");
              }
            } else {
              setError("Failed to delete job: " + (response.error || "Unknown error"));
            }
          } catch (err) {
            console.error("Error deleting job from backend:", err);
            setError("Failed to delete job. Please try again.");
          }
        }
      } catch (err) {
        console.error("Error in handleDelete:", err);
        setError("Failed to delete job. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const openUpdateModal = (job) => {
    setSelectedJob(job);
    setNewStatus(job.status);
    setUpdateNotes("");
    setShowUpdateModal(true);
  };
  
  const openDetailModal = (job) => {
    setViewingJob(job);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      setUpdating(true);
      setError(null);

      // Try to update using the API first
      try {
        const response = await updateJobStatus(
          selectedJob.id,
          newStatus,
          updateNotes
        );

        if (response.success) {
          // Update was successful through API
          updateJobInState();
          setMessage("Job status updated successfully");
        } else if (response.isNetworkError || response.error) {
          // Try to update directly in Firebase
          const jobDocRef = doc(db, "technicianreservations", selectedJob.id);
          const updateData = { 
            status: newStatus
          };
          
          if (updateNotes.trim() !== '') {
            updateData.notes = updateNotes;
          }

          await updateDoc(jobDocRef, updateData);
          
          // Update local state
          updateJobInState();
          setMessage("Job status updated successfully (offline mode)");
        }
      } catch (err) {
        console.error("Error updating through API, trying Firebase:", err);
        
        // Fallback to Firebase
        try {
          const jobDocRef = doc(db, "technicianreservations", selectedJob.id);
          const updateData = { 
            status: newStatus
          };
          
          if (updateNotes.trim() !== '') {
            updateData.notes = updateNotes;
          }

          await updateDoc(jobDocRef, updateData);
          
          // Update local state
          updateJobInState();
          setMessage("Job status updated successfully (offline mode)");
        } catch (firebaseErr) {
          console.error("Firebase update also failed:", firebaseErr);
          setError("Failed to update job status. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error updating job status:", err);
      setError("An error occurred while updating job status");
    } finally {
      setUpdating(false);
      setShowUpdateModal(false);
    }
  };

  const updateJobInState = () => {
    const updatedJobs = jobs.map((job) =>
      job.id === selectedJob.id ? { ...job, status: newStatus } : job
    );
    setJobs(updatedJobs);
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: i * 0.1 },
    }),
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };
  // Animation variants for container and items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };

  if (loading) {
    return (
      <div
        className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="flex flex-1 relative z-10">
          <div className="w-64 bg-gray-900/70 backdrop-blur-md p-6 hidden md:block">
            {/* Sidebar skeleton */}
            <div className="h-8 w-32 bg-gray-700/50 animate-pulse rounded-md mb-8"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-700/50 animate-pulse rounded-md"></div>
              ))}
            </div>
          </div>
          
          <main className="flex-1 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg animate-pulse">
              <div className="w-1/2">
                <div className="h-8 bg-gray-700/50 rounded-md mb-2"></div>
                <div className="h-4 bg-gray-700/50 rounded-md w-3/4"></div>
              </div>
              <div className="w-32 h-10 bg-red-600/50 rounded-full"></div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg mb-6 animate-pulse">
              <div className="h-8 bg-gray-700/50 rounded-md w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-700/50 rounded-md"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
  return (
    <div
      className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="flex flex-1 relative z-10"
      >
        <TechnicianSidebar user={currentUser} activePath="/job-list" />
        
        <motion.main className="flex-1 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">
                Job List
              </h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">
                View and manage your assigned jobs
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/job-add"
                className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all duration-300 no-underline font-[Open Sans]"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                New Job
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all duration-300 no-underline font-[Open Sans]"
              >
                <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
            </div>
          </header>
          {/* Main Content */}
        {/* Success message */}
        {message && (
          <div className="bg-green-600/20 border border-green-500 text-green-300 px-4 py-2 rounded-md mb-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {message}
          </div>
        )}
          {/* Error message or offline indicator */}
        {error && (
          <div className={`${error.includes('offline') ? 'bg-blue-600/20 border border-blue-500 text-blue-300' : 'bg-red-600/20 border border-red-500 text-red-300'} px-4 py-3 rounded-md mb-4 flex items-center`}>
            {error.includes('offline') ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <p className="font-medium">{error}</p>
                  <p className="text-sm opacity-80">Changes will be saved locally and synced when connection is restored</p>
                </div>
              </>
            ) : (
              <>
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                {error}
              </>
            )}
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold font-[Poppins] text-white mb-4">Filter Jobs</h2>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3">
              <label htmlFor="statusFilter" className="block mb-1 text-sm text-gray-300 font-[Open Sans]">Filter by Status</label>
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
            <div className="w-full md:w-2/3">
              <label htmlFor="searchInput" className="block mb-1 text-sm text-gray-300 font-[Open Sans]">Search</label>
              <input
                id="searchInput"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by vehicle or customer..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              onClick={() => {
                setFilterStatus("All");
                setSearchTerm("");
              }}
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold font-[Poppins] text-white mb-6">
          Job List
        </h2>
        <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {jobs
                  .filter(job => filterStatus === "All" || job.status === filterStatus)
                  .filter(job => 
                    searchTerm.trim() === "" || 
                    job.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.service.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((job, index) => (
                  <motion.tr
                    key={job.id}
                    custom={index}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="bg-gray-700/30 backdrop-blur-md"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {job.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {job.vehicle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {job.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {job.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 flex items-center gap-2">                      <button
                        onClick={() => openDetailModal(job)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors duration-200 inline-flex items-center"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        View
                      </button><button
                        onClick={() => openUpdateModal(job)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors duration-200 inline-flex items-center"
                      >
                        <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors duration-200 inline-flex items-center"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
                
                {jobs.filter(job => filterStatus === "All" || job.status === filterStatus)
                  .filter(job => 
                    searchTerm.trim() === "" || 
                    job.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.service.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 && (
                  <tr className="bg-gray-700/30 backdrop-blur-md">
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-300 text-sm">
                      <div className="flex flex-col items-center justify-center">
                        <DocumentTextIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <p>No matching jobs found</p>
                        <p className="text-xs text-gray-500 mt-1">Try changing your search criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>        </div>
        </motion.main>      {/* Update Status Modal */}
      {showUpdateModal && selectedJob && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/90 backdrop-blur-md rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-700"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
              Update Status: {selectedJob.vehicle}
            </h2>
            
            <form onSubmit={handleUpdateStatus}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Current Status</label>
                <div className={`px-3 py-1 rounded-full text-sm inline-flex ${
                  selectedJob.status === "Completed"
                    ? "bg-green-900/50 text-green-300"
                    : selectedJob.status === "In Progress"
                    ? "bg-blue-900/50 text-blue-300"
                    : "bg-yellow-900/50 text-yellow-300"
                }`}>
                  {selectedJob.status}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Add any notes about this status change..."
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className={`px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md flex items-center transition-colors duration-200 ${updating ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {updating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </button>
              </div>
            </form>          </motion.div>        </div>
      )}
      
      {/* Job Details Modal */}
      {showDetailModal && viewingJob && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/90 backdrop-blur-md rounded-lg p-6 w-full max-w-4xl mx-4 shadow-xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-red-500 mr-2" />
                Job Details
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-semibold text-red-500">Job Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Job ID</p>
                    <p className="font-bold">{viewingJob.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Service Type</p>
                    <p>{viewingJob.service}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        viewingJob.status === "Completed"
                          ? "bg-green-900/50 text-green-300"
                          : viewingJob.status === "In Progress"
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-yellow-900/50 text-yellow-300"
                      }`}
                    >
                      {viewingJob.status}
                    </span>
                  </div>
                  
                  {viewingJob.date && (
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p>{viewingJob.date}</p>
                    </div>
                  )}
                  
                  {viewingJob.notes && (
                    <div>
                      <p className="text-sm text-gray-400">Notes</p>
                      <p className="whitespace-pre-line">{viewingJob.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-semibold text-red-500">Customer & Vehicle Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Customer</p>
                    <p className="font-bold">{viewingJob.customer}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Vehicle</p>
                    <p>{viewingJob.vehicle}</p>
                  </div>
                  
                  {viewingJob.customerPhone && (
                    <div>
                      <p className="text-sm text-gray-400">Contact Number</p>
                      <p>{viewingJob.customerPhone}</p>
                    </div>
                  )}
                  
                  {viewingJob.address && (
                    <div>
                      <p className="text-sm text-gray-400">Address</p>
                      <p>{viewingJob.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  openUpdateModal(viewingJob);
                  setShowDetailModal(false);
                }}
                className="px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700 transition-colors duration-200"
              >
                Update Status
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default TechnicianJobList;