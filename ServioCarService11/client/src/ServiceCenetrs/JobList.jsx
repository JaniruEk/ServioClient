// src/components/JobList.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { WrenchScrewdriverIcon, DocumentTextIcon, ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import ServiceCenterSidebar from "../components/ServiceCenterSidebar"; // Import the sidebar
import Footer from "../components/Footer"; // Assuming you have a Footer component
import serviceCenterService from "../services/serviceCenter.service";
import { auth } from "../firebase";

const JobList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  // Fetch jobs from servicereservations collection
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        fetchJobs();
      } else {
        navigate("/login");
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  const fetchJobs = async () => {
    try {
      setLoading(true);
      // First try to get data from backend API
      const response = await serviceCenterService.getServiceReservations();
      
      // If backend API fails, fallback to direct Firestore access
      if (!response.success && (response.isNetworkError || response.error === 'Backend server unavailable. Please check if the server is running.')) {
        console.log("Backend API unavailable, fetching directly from Firestore...");
        const firestoreResponse = await serviceCenterService.getServiceReservationsFromFirestore();
        
        if (firestoreResponse.success) {
          setJobs(firestoreResponse.data);
        } else {
          setError(firestoreResponse.error);
        }
      } else if (response.success) {
        setJobs(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on status
  const filteredJobs = filterStatus === "All" 
    ? jobs 
    : jobs.filter(job => job.status === filterStatus);

  // Animation variants
  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: i * 0.1 },
    }),
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };

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
        <ServiceCenterSidebar activePath="/service-center/job-list" />

        {/* Main Content */}
        <main className="flex-1 ml-64 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div className="flex items-center">
              <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">Job List</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/pending-jobs"
                className="bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out flex items-center gap-1 font-[Open Sans] text-sm no-underline"
              >
                <DocumentTextIcon className="h-5 w-5" />
                Pending Jobs
              </Link>
              <Link
                to="/dashboard"
                className="group flex items-center gap-2 text-red-500 hover:text-red-400 transition-all duration-200 ease-in-out font-[Open Sans]"
              >
                <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to Dashboard
              </Link>
            </div>
          </header>          {/* Job List Section */}
          <section className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center font-[Poppins]">
                <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
                All Jobs
              </h2>
              
              <div className="flex items-center gap-4">
                {/* Filter dropdown */}
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                
                {/* Refresh button */}
                <button
                  onClick={fetchJobs}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                  title="Refresh jobs"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            )}
            
            {/* Error message */}
            {error && !loading && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-md mb-4">
                <p className="font-medium">Error: {error}</p>
                <button 
                  onClick={fetchJobs}
                  className="mt-2 text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {/* Empty state */}
            {!loading && !error && filteredJobs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg mb-4">No jobs found</p>
                {filterStatus !== "All" ? (
                  <p className="text-gray-500">Try changing the filter or check back later</p>
                ) : (
                  <p className="text-gray-500">There are currently no service reservations</p>
                )}
              </div>
            )}

            {/* Table for Larger Screens */}
            {!loading && !error && filteredJobs.length > 0 && (
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-md font-[Open Sans] text-gray-300">
                  <thead>
                    <tr className="bg-red-600 text-white">
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Job ID</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Vehicle</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Customer</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Service</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Date</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Status</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job, index) => (
                      <motion.tr
                        key={job.id}
                        custom={index}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        className="hover:bg-gray-700/50"
                      >
                        <td className="border border-gray-700/50 p-3 text-sm">{job.id.slice(0, 8)}</td>
                        <td className="border border-gray-700/50 p-3 text-sm">{job.vehicleModel || job.vehicle || "N/A"}</td>
                        <td className="border border-gray-700/50 p-3 text-sm">{job.customerName || "Not specified"}</td>
                        <td className="border border-gray-700/50 p-3 text-sm">{job.serviceType || job.service || "General Service"}</td>
                        <td className="border border-gray-700/50 p-3 text-sm">{job.formattedDate || new Date(job.serviceDate).toLocaleDateString() || "Not set"}</td>
                        <td className="border border-gray-700/50 p-3 text-sm">
                          <span className="flex items-center">
                            <span
                              className={`w-3 h-3 rounded-full mr-2 ${
                                job.status === "Completed" ? "bg-green-500" : 
                                job.status === "In Progress" ? "bg-blue-500" :
                                job.status === "Confirmed" ? "bg-yellow-500" :
                                job.status === "Cancelled" ? "bg-red-500" : "bg-gray-500"
                              }`}
                            ></span>
                            {job.status || "Pending"}
                          </span>
                        </td>
                        <td className="border border-gray-700/50 p-3">
                          <Link
                            to={`/view-details/${job.id}`}
                            className="bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 hover:scale-105 transition-all duration-200 ease-in-out flex items-center gap-1 font-[Open Sans] text-sm no-underline"
                          >
                            <DocumentTextIcon className="h-5 w-5" />
                            View Details
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Card Layout for Mobile Screens */}
            {!loading && !error && filteredJobs.length > 0 && (
              <div className="md:hidden space-y-4">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    custom={index}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-lg"
                  >
                    <div className="flex items-center mb-3">
                      <div>
                        <p className="text-base font-semibold text-white font-[Poppins]">{job.vehicleModel || job.vehicle || "Vehicle"}</p>
                        <p className="text-sm text-gray-300 font-[Open Sans]">Job ID: {job.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="space-y-2 font-[Open Sans] text-gray-300">
                      <p className="text-sm">
                        Customer: <span className="font-medium">{job.customerName || "Not specified"}</span>
                      </p>
                      <p className="text-sm">
                        Service: <span className="font-medium">{job.serviceType || job.service || "General Service"}</span>
                      </p>
                      <p className="text-sm">
                        Date: <span className="font-medium">{job.formattedDate || new Date(job.serviceDate).toLocaleDateString() || "Not set"}</span>
                      </p>
                      <p className="text-sm">
                        Status:{" "}
                        <span className="flex items-center">
                          <span
                            className={`w-3 h-3 rounded-full mr-2 ${
                              job.status === "Completed" ? "bg-green-500" : 
                              job.status === "In Progress" ? "bg-blue-500" :
                              job.status === "Confirmed" ? "bg-yellow-500" :
                              job.status === "Cancelled" ? "bg-red-500" : "bg-gray-500"
                            }`}
                          ></span>
                          <span className="font-medium">{job.status || "Pending"}</span>
                        </span>
                      </p>
                    </div>                    <Link
                      to={`/view-details/${job.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 hover:scale-105 transition-all duration-200 ease-in-out flex items-center gap-1 mt-3 font-[Open Sans] text-sm no-underline"
                    >
                      <DocumentTextIcon className="h-5 w-5" />
                      View Details
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default JobList;