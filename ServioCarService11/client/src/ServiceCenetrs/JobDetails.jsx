// src/ServiceCenetrs/JobDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";
import ServiceCenterSidebar from "../components/ServiceCenterSidebar";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");
  const [updating, setUpdating] = useState(false);  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError("");
        
        if (!id) {
          setError("Invalid service job ID");
          setLoading(false);
          return;
        }
        
        // First check if we have the job in localStorage for quicker initial loading
        const savedJob = localStorage.getItem('selectedJob');
        if (savedJob) {
          // Use localStorage data initially for faster first render
          const parsedJob = JSON.parse(savedJob);
          if (parsedJob.id === id) {
            setJob(parsedJob);
            // Don't set loading to false yet - we'll still fetch the latest data
          }
        }
        
        // Always fetch the latest data from Firestore to ensure it's up-to-date
        const jobRef = doc(db, "servicereservations", id);
        const jobSnap = await getDoc(jobRef);
        
        if (jobSnap.exists()) {
          const data = jobSnap.data();
          
          // Build a complete job object with all available fields from Firestore
          const updatedJob = {
            id: jobSnap.id,
            bookingId: data.bookingId || jobSnap.id,
            customer: data.name || "N/A",
            customerName: data.name || "N/A", // For compatibility
            email: data.email || "N/A",
            contactNumber: data.contactNumber || "N/A",
            vehicle: `${data.vehicleMake || ''} ${data.vehicleModel || ''} ${data.vehicleYear || ''}`,
            vehicleDetails: {
              make: data.vehicleMake || "N/A",
              model: data.vehicleModel || "N/A",
              year: data.vehicleYear || "N/A",
              vin: data.vin || "N/A",
              licensePlate: data.licensePlate || "N/A",
              color: data.color || "N/A",
              mileage: data.mileage || "N/A"
            },
            vehicleMake: data.vehicleMake || "N/A",
            vehicleModel: data.vehicleModel || "N/A",
            vehicleYear: data.vehicleYear || "N/A",
            service: data.serviceType || "General Service",
            serviceType: data.serviceType || "General Service",
            status: data.status || "Pending",
            date: data.serviceDate || new Date().toLocaleDateString(),
            serviceDate: data.serviceDate || new Date().toLocaleDateString(),
            time: data.serviceTime || "N/A",
            serviceTime: data.serviceTime || "N/A",
            message: data.message || "",
            notes: data.notes || "",
            cost: data.cost || 0,
            estimatedCompletionTime: data.estimatedCompletionTime || "N/A",
            assignedTechnician: data.assignedTechnician || "Not Assigned",
            paymentStatus: data.paymentStatus || "Pending",
            paymentMethod: data.paymentMethod || "N/A",
            serviceItems: data.serviceItems || [],
            partsUsed: data.partsUsed || [],
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || data.createdAt || new Date().toISOString()
          };
          
          // Update the job with the latest data from Firestore
          setJob(updatedJob);
          setStatusUpdate(updatedJob.status); // Set the current status in the update form
          
          // Update localStorage with fresh data
          localStorage.setItem('selectedJob', JSON.stringify(updatedJob));
        } else {
          setError("Service job not found in database. It may have been deleted or you don't have permission to access it.");
          // If we didn't have it in localStorage and it doesn't exist in Firestore, clear any local data
          if (job && job.id === id) {
            setJob(null);
          }
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load service job details: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
    
    // Clean up localStorage when component unmounts
    return () => {
      localStorage.removeItem('selectedJob');
    };
  }, [id]);
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    
    if (!statusUpdate) {
      setError("Please select a status to update");
      return;
    }
    
    // Don't update if status hasn't changed
    if (job && job.status === statusUpdate) {
      setError("The job already has this status. No changes were made.");
      return;
    }
    
    // Clear previous messages
    setError("");
    setSuccess("");
    
    try {
      setUpdating(true);
      
      const jobRef = doc(db, "servicereservations", id);
      const now = new Date().toISOString();
      
      // Prepare update data
      const updateData = {
        status: statusUpdate,
        updatedAt: now
      };
      
      // Add status change notes if appropriate
      if (statusUpdate === "Completed") {
        updateData.completedAt = now;
      } else if (statusUpdate === "In Progress" && job.status === "Pending") {
        updateData.startedAt = now;
      }
      
      // Update in Firestore
      await updateDoc(jobRef, updateData);
        // Update local state with all the changes
      const updatedJob = {
        ...job,
        status: statusUpdate,
        updatedAt: now
      };
      
      // Add appropriate timestamps to the updated job object
      if (statusUpdate === "Completed") {
        updatedJob.completedAt = now;
      } else if (statusUpdate === "In Progress" && job.status === "Pending") {
        updatedJob.startedAt = now;
      }
      
      setJob(updatedJob);
      
      // Update localStorage with the new data
      localStorage.setItem('selectedJob', JSON.stringify(updatedJob));
      
      // Show success message
      setSuccess(`Job status successfully updated to "${statusUpdate}"`);
    } catch (err) {
      console.error("Error updating job status:", err);
      setError("Failed to update job status: " + err.message);
    } finally {
      setUpdating(false);
    }
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
        <main className="flex-1 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div className="flex items-center">
              <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">Job Details</h1>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setLoading(true);
                  setError("");
                  setSuccess("");
                  const fetchJobDetails = async () => {
                    try {
                      const jobRef = doc(db, "servicereservations", id);
                      const jobSnap = await getDoc(jobRef);
                      
                      if (jobSnap.exists()) {
                        const data = jobSnap.data();
                        const updatedJob = {
                          id: jobSnap.id,
                          bookingId: data.bookingId || jobSnap.id,
                          customer: data.name || "N/A",
                          email: data.email || "N/A",
                          contactNumber: data.contactNumber || "N/A",
                          vehicle: `${data.vehicleMake || ''} ${data.vehicleModel || ''} ${data.vehicleYear || ''}`,
                          vehicleDetails: {
                            make: data.vehicleMake || "N/A",
                            model: data.vehicleModel || "N/A",
                            year: data.vehicleYear || "N/A",
                          },
                          service: data.serviceType || "General Service",
                          status: data.status || "Pending",
                          date: data.serviceDate || new Date().toLocaleDateString(),
                          time: data.serviceTime || "N/A",
                          message: data.message || "",
                          cost: data.cost || 0,
                          createdAt: data.createdAt || new Date().toISOString(),
                          updatedAt: data.updatedAt || data.createdAt || new Date().toISOString()
                        };
                        
                        setJob(updatedJob);
                        localStorage.setItem('selectedJob', JSON.stringify(updatedJob));
                        setSuccess("Job data refreshed successfully");
                      } else {
                        setError("Job not found in database");
                      }
                    } catch (err) {
                      console.error("Error refreshing job details:", err);
                      setError("Failed to refresh job details: " + err.message);
                    } finally {
                      setLoading(false);
                    }
                  };
                  
                  fetchJobDetails();
                }}
                className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-all duration-200 ease-in-out flex items-center gap-1"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? "Loading..." : "Refresh"}
              </button>
              <Link
                to="/service-center/job-list"
                className="group flex items-center gap-2 text-red-500 hover:text-red-400 transition-all duration-200 ease-in-out font-[Open Sans]"
              >
                <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to Job List
              </Link>
            </div>
          </header>{/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-white flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
              <button onClick={() => setError("")} className="text-white hover:text-gray-200">
                ×
              </button>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-white flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
              <button onClick={() => setSuccess("")} className="text-white hover:text-gray-200">
                ×
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : job ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Job Summary */}              <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white font-[Raleway]">Job Summary</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      job.status === "Completed" ? "bg-green-100 text-green-800" : 
                      job.status === "In Progress" ? "bg-blue-100 text-blue-800" : 
                      job.status === "Cancelled" ? "bg-red-100 text-red-800" : 
                      "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="space-y-4 text-gray-300">
                  <div className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    <div>
                      <span className="text-gray-400 text-sm">Booking ID</span>
                      <p>{job.bookingId?.substring(0, 8) || job.id?.substring(0, 8)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    <div>
                      <span className="text-gray-400 text-sm">Service Type</span>
                      <p>{job.service || job.serviceType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CalendarIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    <div>
                      <span className="text-gray-400 text-sm">Appointment Date</span>
                      <p>{job.date || job.serviceDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <ClockIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    <div>
                      <span className="text-gray-400 text-sm">Appointment Time</span>
                      <p>{job.time || job.serviceTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CurrencyDollarIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    <div>
                      <span className="text-gray-400 text-sm">Estimated Cost</span>
                      <p>{job.cost ? `$${job.cost}` : 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <ClockIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    <div>
                      <span className="text-gray-400 text-sm">Created On</span>
                      <p>{new Date(job.createdAt).toLocaleDateString()} {new Date(job.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>{/* Update Status Form */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                      <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                    </svg>
                    Update Job Status
                  </h3>
                  
                  <form onSubmit={handleUpdateStatus} className="space-y-4">
                    <div className="mb-2">
                      <label className="block text-sm text-gray-400 mb-1">Current Status: 
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          job.status === "Completed" ? "bg-green-100 text-green-800" : 
                          job.status === "In Progress" ? "bg-blue-100 text-blue-800" : 
                          job.status === "Cancelled" ? "bg-red-100 text-red-800" : 
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {job.status}
                        </span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Change to:</label>
                      <select
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select new status...</option>
                        {job.status !== "Pending" && <option value="Pending">Pending</option>}
                        {job.status !== "In Progress" && <option value="In Progress">In Progress</option>}
                        {job.status !== "Completed" && <option value="Completed">Completed</option>}
                        {job.status !== "Cancelled" && <option value="Cancelled">Cancelled</option>}
                      </select>
                    </div>
                    
                    <button
                      type="submit"
                      className={`w-full ${!statusUpdate ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center`}
                      disabled={updating || !statusUpdate}
                    >
                      {updating ? (
                        <>
                          <span className="mr-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5 mr-1" />
                          Update Status
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </section>

              {/* Right Columns - Customer & Vehicle Info */}
              <div className="col-span-1 md:col-span-2 space-y-6">
                {/* Customer Information */}                <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center font-[Raleway]">
                    <UserIcon className="h-5 w-5 text-red-500 mr-2" />
                    Customer Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
                    <div>
                      <span className="text-gray-400 text-sm">Name</span>
                      <p className="font-medium">{job.customer || job.customerName}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-400 text-sm">Phone</span>
                      <p className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-red-500 mr-1" />
                        {job.contactNumber || "Not provided"}
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <span className="text-gray-400 text-sm">Email</span>
                      <p className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 text-red-500 mr-1" />
                        {job.email || "Not provided"}
                      </p>
                    </div>
                    
                    <div className="md:col-span-2 pt-2 border-t border-gray-700">
                      <p className="text-sm text-gray-400">
                        All customer information is protected under our privacy policy. 
                        Contact information should only be used for service-related communication.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Vehicle Information */}
                <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center font-[Raleway]">
                    <TruckIcon className="h-5 w-5 text-red-500 mr-2" />
                    Vehicle Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
                    <div>
                      <span className="text-gray-400 text-sm">Make</span>
                      <p className="font-medium">{job.vehicleDetails?.make || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-400 text-sm">Model</span>
                      <p className="font-medium">{job.vehicleDetails?.model || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-400 text-sm">Year</span>
                      <p className="font-medium">{job.vehicleDetails?.year || 'N/A'}</p>
                    </div>
                  </div>
                </section>

                {/* Service Details / Message */}
                {job.message && (
                  <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center font-[Raleway]">
                      <DocumentTextIcon className="h-5 w-5 text-red-500 mr-2" />
                      Service Details
                    </h2>
                    
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-gray-300 whitespace-pre-line">{job.message}</p>
                    </div>
                  </section>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-lg">
              <DocumentTextIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Job Not Found</h3>
              <p className="text-gray-400">The requested job details could not be found.</p>
              <Link
                to="/service-center/job-list"
                className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-300"
              >
                Return to Job List
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobDetails;
