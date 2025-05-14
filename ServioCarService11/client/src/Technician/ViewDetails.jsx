import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { getJobById, updateJobStatus } from "../services/technician.service";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const ViewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [notes, setNotes] = useState("");
  // Sample job data as fallback
  const sampleJobs = [
    {
      id: "J1234",
      vehicle: "Toyota Camry",
      customer: "Chanuka Herath",
      service: "Brake Repair",
      status: "In Progress",
      date: "2025-03-20",
      priority: "High",
      notes: "Customer reported squeaking brakes. Replaced brake pads and rotors. Test drive completed.",
    },
    {
      id: "J1235",
      vehicle: "Ford Focus",
      customer: "Suneth Herath",
      service: "Oil Change",
      status: "Pending",
      date: "2025-03-19",
      priority: "Medium",
      notes: "Scheduled for standard oil change. Awaiting customer approval for additional fluid checks.",    },
    {
      id: "J1236",
      vehicle: "Honda Civic",
      customer: "Lakshan Ekanayaka",
      service: "Tire Rotation",
      status: "In Progress",
      date: "2025-03-18",
      priority: "Low",
      notes: "Tires rotated as per schedule. Noticed slight wear on front left tire, recommended replacement.",
    },
  ];
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching job details for ID:", id);
        
        // Try to determine if this is a Firebase ID
        const isFirebaseId = id && id.length > 20; // Firebase IDs are typically long
        let firebaseJob = null;
        
        // First try to fetch from Firebase regardless of ID format
        try {
          const jobDocRef = doc(db, "technicianreservations", id);
          const jobDocSnap = await getDoc(jobDocRef);
          
          if (jobDocSnap.exists()) {
            const data = jobDocSnap.data();
            console.log("Found job in Firebase:", data);
            firebaseJob = {
              id: id,
              vehicle: `${data.vehicleMake || ''} ${data.vehicleModel || ''}`,
              customer: data.customerName || data.name || 'N/A',
              service: data.serviceType || (data.message ? data.message.substring(0, 20) : 'General Service'),
              status: data.status || 'Pending',
              date: data.date ? 
                (data.date.seconds ? new Date(data.date.seconds * 1000).toLocaleDateString() : 
                 new Date(data.date).toLocaleDateString()) : 
                new Date().toLocaleDateString(),
              priority: data.priority || 'Medium',
              notes: data.message || 'No description provided',
              contactNumber: data.contactNumber || data.phone || 'N/A',
              email: data.email || 'N/A',
              firebaseOnly: true // Mark that this came from Firebase
            };
            
            setJob(firebaseJob);
            setLoading(false);
            return; // Skip backend call if we found the job in Firebase
          }
        } catch (firebaseErr) {
          console.error("Error fetching from Firebase:", firebaseErr);
          // Continue to backend attempt
        }

        // If not found in Firebase or not a Firebase ID, try the backend
        try {
          // Fetch the job details from the API
          const response = await getJobById(id);
  
          if (response.success && response.data) {
            // Format job for display
            const jobData = response.data;
            const formattedJob = {
              id: jobData._id,
              vehicle: `${jobData.vehicle?.make || ""} ${jobData.vehicle?.model || ""}`,
              customer: jobData.customer?.name || "Unknown Customer",
              service: jobData.service?.type || "General Service",
              status: jobData.status || "Pending",
              date: jobData.service?.date
                ? new Date(jobData.service.date).toLocaleDateString()
                : "N/A",
              priority: jobData.priority || "Medium",
              notes: jobData.notes || jobData.problemDescription || "No description provided",
              backendOnly: true // Mark that this came from the backend
            };
  
            setJob(formattedJob);
          } else if (!firebaseJob) {
            // If API fails and we don't have a Firebase job, use sample data as fallback
            const fallbackJob = sampleJobs.find((j) => j.id === id);
            if (fallbackJob) {
              setJob(fallbackJob);
            } else {
              setError("Job not found");
            }
          }
        } catch (err) {
          if (!firebaseJob) {
            console.error("Error fetching job details from backend:", err);
            setError("Failed to load job details. Please try again later.");
  
            // Fallback to sample data only if we don't have a Firebase job
            const fallbackJob = sampleJobs.find((j) => j.id === id);
            if (fallbackJob) {
              setJob(fallbackJob);
            }
          }
        }
      } catch (err) {
        console.error("Overall error in fetchJobDetails:", err);
        setError("An unexpected error occurred. Please try again.");
        
        // Ultimate fallback
        const fallbackJob = sampleJobs.find((j) => j.id === id);
        if (fallbackJob) {
          setJob(fallbackJob);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);
  const handleStatusUpdate = async (newStatus) => {
    try {
      if (!job) return;
      
      setUpdating(true);
      setError(null);
      setUpdateSuccess(false);
      
      // Check if this is a Firebase-only job
      if (job.firebaseOnly) {
        try {
          // Update the job status directly in Firebase
          const jobDocRef = doc(db, "technicianreservations", id);
          await updateDoc(jobDocRef, {
            status: newStatus,
            lastUpdated: new Date().toISOString(),
            notes: notes ? [...(job.notes ? [job.notes] : []), notes] : undefined
          });
          
          // Update local state
          setJob({
            ...job,
            status: newStatus,
            notes: notes ? `${job.notes || ''}\n${notes}` : job.notes
          });
          
          setUpdateSuccess(true);
          setNotes("");
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setUpdateSuccess(false);
          }, 3000);
        } catch (firebaseErr) {
          console.error("Error updating job in Firebase:", firebaseErr);
          setError("Failed to update status in Firebase: " + firebaseErr.message);
        }
      } else {
        // Regular backend update
        try {
          // Update job status in the backend
          const response = await updateJobStatus(id, newStatus, notes);
          
          if (response.success) {
            setJob({
              ...job,
              status: newStatus
            });
            setUpdateSuccess(true);
            setNotes("");
            
            // Clear success message after 3 seconds
            setTimeout(() => {
              setUpdateSuccess(false);
            }, 3000);
          } else {
            setError("Failed to update status: " + (response.message || "Unknown error"));
          }
        } catch (backendErr) {
          console.error("Error updating job in backend:", backendErr);
          
          // If backend update fails, try Firebase as fallback if we have a Firebase ID
          if (id && id.length > 20) {
            try {
              const jobDocRef = doc(db, "technicianreservations", id);
              await updateDoc(jobDocRef, {
                status: newStatus,
                lastUpdated: new Date().toISOString(),
                notes: notes || undefined
              });
              
              // Update local state
              setJob({
                ...job,
                status: newStatus
              });
              
              setUpdateSuccess(true);
              setNotes("");
              
              // Show message that we used Firebase fallback
              setError("Backend unavailable. Updated in offline mode.");
              
              // Clear success message after 3 seconds
              setTimeout(() => {
                setUpdateSuccess(false);
              }, 3000);
            } catch (fallbackErr) {
              console.error("Fallback to Firebase also failed:", fallbackErr);
              setError("Failed to update status. Please check your connection.");
            }
          } else {
            setError("An error occurred while updating the job status");
          }
        }
      }
    } catch (err) {
      console.error("Error in handleStatusUpdate:", err);
      setError("An unexpected error occurred while updating the job status");
    } finally {
      setUpdating(false);
    }
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center bg-gray-900 p-4 shadow-lg sticky top-0 z-10 mb-8">
        <div className="flex items-center">
          <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
          <h1 className="text-2xl font-bold text-white font-[Poppins]">
            View Details
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
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center text-gray-300">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/10 backdrop-blur-md p-6 rounded-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
                <h2 className="text-xl font-bold font-[Poppins] text-white">
                  Job Details - {job.id}
                </h2>
              </div>
              <Link
                to="/job-list"
                className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all duration-300 no-underline font-[Open Sans]"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Job List
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-2xl font-bold font-[Poppins] text-white">
                      {job.vehicle}
                    </h3>
                    <p className="text-sm font-[Open Sans] text-gray-300">
                      Job ID: {job.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-[Open Sans] text-gray-300">
                        Customer
                      </p>
                      <p className="text-base font-medium font-[Open Sans] text-white">
                        {job.customer}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-[Open Sans] text-gray-300">
                        Service
                      </p>
                      <p className="text-base font-medium font-[Open Sans] text-white">
                        {job.service}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-[Open Sans] text-gray-300">
                        Date
                      </p>
                      <p className="text-base font-medium font-[Open Sans] text-white">
                        {job.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-[Open Sans] text-gray-300">
                        Status
                      </p>
                      <p
                        className={`text-base font-medium font-[Open Sans] ${
                          job.status === "Completed"
                            ? "text-green-400"
                            : job.status === "Pending"
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {job.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-[Open Sans] text-gray-300">
                        Priority
                      </p>
                      <p
                        className={`text-base font-medium font-[Open Sans] ${
                          job.priority === "High"
                            ? "text-red-400"
                            : job.priority === "Medium"
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {job.priority}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-lg font-bold font-[Poppins] text-white mb-2">
                    Notes
                  </h4>
                  <textarea
                    value={notes}
                    onChange={handleNotesChange}
                    className="w-full p-2 rounded-lg bg-gray-800 text-white text-sm font-[Open Sans]"
                    placeholder="Add notes for the job status update..."
                  />
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => handleStatusUpdate("Completed")}
                    className="flex items-center bg-green-600 text-white px-4 py-2 rounded-full font-medium hover:bg-green-700 transition-all duration-300 font-[Open Sans]"
                    disabled={updating}
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Mark as Completed
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("Pending")}
                    className="flex items-center bg-yellow-600 text-white px-4 py-2 rounded-full font-medium hover:bg-yellow-700 transition-all duration-300 font-[Open Sans]"
                    disabled={updating}
                  >
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Mark as Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("In Progress")}
                    className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all duration-300 font-[Open Sans]"
                    disabled={updating}
                  >
                    <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                    Mark as In Progress
                  </button>
                  <button
                    onClick={() => alert("Contacting customer...")}
                    className="flex items-center bg-gray-700 text-white px-4 py-2 rounded-full font-medium hover:bg-gray-600 transition-all duration-300 font-[Open Sans]"
                  >
                    <PhoneIcon className="h-5 w-5 mr-2 text-red-500" />
                    Contact Customer
                  </button>
                </div>
                {updateSuccess && (
                  <div className="text-center text-green-500">
                    Job status updated successfully!
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold font-[Poppins] text-white mb-4">Update Job Status</h3>
                {updateSuccess && (
                  <div className="bg-green-600/20 border border-green-500 text-green-300 px-4 py-2 rounded-md mb-4 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Status updated successfully!
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-2 rounded-md mb-4 flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-[Open Sans] text-gray-300 mb-1">
                    Service Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={handleNotesChange}
                    disabled={updating}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white resize-y h-32"
                    placeholder="Enter details about the service performed..."
                  ></textarea>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleStatusUpdate("In Progress")}
                    disabled={updating || job?.status === "In Progress"}
                    className={`flex items-center px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                      updating || job?.status === "In Progress" 
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Mark In Progress
                  </button>
                  
                  <button
                    onClick={() => handleStatusUpdate("Completed")}
                    disabled={updating || job?.status === "Completed"}
                    className={`flex items-center px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                      updating || job?.status === "Completed" 
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Mark Complete
                  </button>
                  
                  <button
                    onClick={() => handleStatusUpdate("Pending")}
                    disabled={updating || job?.status === "Pending"}
                    className={`flex items-center px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                      updating || job?.status === "Pending" 
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                        : "bg-yellow-600 text-white hover:bg-yellow-700"
                    }`}
                  >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Return to Pending
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </main>

      <footer className="bg-gray-800 p-4 mt-auto">
        <div className="text-center text-gray-300 font-[Open Sans]">
          © {new Date().getFullYear()} Auto Service Management
        </div>
      </footer>
    </div>
  );
};

export default ViewDetails;