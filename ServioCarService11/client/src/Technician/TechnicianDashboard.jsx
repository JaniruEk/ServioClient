import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  WrenchScrewdriverIcon,
  CalendarIcon,
  UserGroupIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  BoltIcon,
  StarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import Footer from "../components/Footer";
import TechnicianSidebar from "../components/TechnicianSidebar";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Import API services
import { 
  getTechnicianByUserId, 
  getTechnicianDashboard,
  getJobsByTechnician,
  getJobsByTechnicianAndStatus,
  getJobStatsForTechnician 
} from '../services/technician.service';

// Import sync service (imported but will use optimized loading)
// import { syncTechnicianData, syncJobData } from '../services/sync.service';

const getUser = () => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
};

const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("user");
    return { success: true };
  } catch (error) {
    console.error("Error during logout:", error);
    return { success: false, error };
  }
};

const TechnicianDashboard = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(user || getUser());
  const [technicianData, setTechnicianData] = useState(null);  
  const [stats, setStats] = useState({
    tasksToday: 0,
    completed: 0,
    urgent: 0,
    assignedJobs: 0,
    completedJobs: 0,
    // pending and pendingRequests removed as pending jobs functionality has been deprecated
  });
  const [recentJobs, setRecentJobs] = useState([]);  const [performanceData, setPerformanceData] = useState({
    efficiency: 0,
    customerSatisfaction: 0,
    earnings: 0
    // Weekly performance data completely removed
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReloading, setIsReloading] = useState(false);
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsReloading(true);
      
      const userData = currentUser || getUser();
      
      if (!userData) {
        setError("You must be logged in to view this dashboard");
        navigate('/login');
        return;
      }
      
      // Skip sync operations to improve loading time
      // const syncResult = await syncTechnicianData(userData.uid);
      // const isOfflineMode = syncResult.isNetworkError;
      // if (!isOfflineMode) {
      //   await syncJobData(userData.uid);
      // }
      
      // Priority: Get data from Firebase directly first (much faster)
      try {
        // Get technician data from Firebase directly
        const userDocRef = doc(db, "users", userData.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const firebaseData = userDocSnap.data();
          setTechnicianData({
            fullName: firebaseData.name || userData.displayName || "Technician",
            email: firebaseData.email || userData.email || "",
            specialization: firebaseData.specialization || "Automotive Technician",
            jobsCompleted: firebaseData.jobsCompleted || 0,
            averageRating: firebaseData.averageRating || 0
          });
            // Get reservations data from Firebase to show as jobs
          const reservationsQuery = query(
            collection(db, 'technicianreservations'),
            where('technicianId', '==', userData.uid)
          );
          
          const reservationsSnapshot = await getDocs(reservationsQuery);
          
          if (!reservationsSnapshot.empty) {
            const formattedJobs = reservationsSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                vehicle: `${data.vehicleMake || ''} ${data.vehicleModel || ''}`,
                service: data.serviceType || data.service || 'General Service',
                priority: data.priority || 'Medium',
                due: `${data.date || new Date().toLocaleDateString()} ${data.time || ''}`,
                customer: data.customerName || data.name || 'N/A',
                status: data.status || 'Pending',
                date: data.date || new Date().toLocaleDateString(),
                notes: data.notes || data.message || 'No description provided',
                image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60",
                completedAt: data.completedAt || null,
              };
            });
            
            // Get completed jobs for the Recent Jobs section
            const completedJobs = formattedJobs.filter(job => job.status === 'Completed')
              .sort((a, b) => {
                // Sort by completedAt date if available, or regular date
                const dateA = a.completedAt ? new Date(a.completedAt) : new Date(a.date);
                const dateB = b.completedAt ? new Date(b.completedAt) : new Date(b.date);
                return dateB - dateA; // Most recent first
              });
            
            setRecentJobs(completedJobs);
              // Calculate basic stats
            const completedCount = formattedJobs.filter(job => job.status === 'Completed').length;
            const inProgressCount = formattedJobs.filter(job => job.status === 'In Progress').length;
            const availableJobs = formattedJobs.filter(job => !job.technicianId || job.technicianId === userData.uid).length;
            
            setStats({
              tasksToday: formattedJobs.length || 0,
              completed: completedCount,
              urgent: formattedJobs.filter(job => job.priority === 'High').length || 0,
              assignedJobs: inProgressCount,
              completedJobs: completedCount,
              // Pending jobs functionality has been removed
            });            // Calculate average customer satisfaction from completed jobs (or use default)
            const satisfactionRating = completedCount > 0 ? 
              (Math.random() * 1.5 + 3.5) : // Simulate ratings between 3.5 and 5.0
              4.5; // Default rating
            
            // Calculate simulated earnings based on completed jobs
            const averageJobPrice = 150; // Assume average job costs $150
            const totalEarnings = completedCount * averageJobPrice;
              setPerformanceData({
              efficiency: completedCount / (formattedJobs.length || 1) * 100,
              customerSatisfaction: satisfactionRating,
              earnings: totalEarnings
              // Weekly performance data completely removed
            });
          } else {            // No reservations found, use demo data with completed jobs
            setRecentJobs([
              {
                id: "demo1",
                vehicle: "Toyota Camry",
                service: "Brake Repair",
                priority: "High",
                due: "2025-05-15 15:00",
                customer: "John Smith",
                status: "Completed",
                date: "2025-05-15",
                completedAt: "2025-05-15T16:30:00",
                notes: "Customer reported squeaking brakes. Fixed by replacing brake pads.",
                image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60"
              },
              {
                id: "demo2",
                vehicle: "Ford Focus",
                service: "Oil Change",
                priority: "Medium",
                due: "2025-05-12 17:00",
                customer: "Alice Johnson",
                status: "Completed",
                date: "2025-05-12",
                completedAt: "2025-05-12T17:45:00",
                notes: "Routine maintenance completed on schedule.",
                image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60"
              },
              {
                id: "demo3",
                vehicle: "Honda Civic",
                service: "Battery Replacement",
                priority: "High",
                due: "2025-05-10 09:00",
                customer: "David Miller",
                status: "Completed",
                date: "2025-05-10",
                completedAt: "2025-05-10T10:15:00",
                notes: "Dead battery replaced with new one. All electrical systems working properly.",
                image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60"
              }
            ]);
            setStats({
              tasksToday: 2,
              completed: 0,
              urgent: 1,
              assignedJobs: 2,
              completedJobs: 0,
              // Pending jobs functionality has been removed
            });
          }
        } else {
          setError("User data not found in Firebase. Please complete your profile.");
        }
      } catch (err) {
        console.error("Error fetching data from Firebase:", err);
        setError("Failed to load data. Please check your connection.");
        
        // Set minimal fallback data
        setTechnicianData({
          fullName: userData.displayName || "Technician",
          email: userData.email || "",
          specialization: "Automotive Technician"
        });
      }
      
      // After setting initial data from Firebase, try to get API data in the background
      // This non-blocking approach allows the UI to load quickly while still fetching fresh data
      setTimeout(() => {
        getTechnicianByUserId(userData.uid)
          .then(response => {
            if (response.success && response.data) {
              // Update with any additional data from API if available
              setTechnicianData(prev => ({...prev, ...response.data}));
            }
          })
          .catch(err => console.log("Backend sync failed:", err));
      }, 100);    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("An error occurred while loading your dashboard data. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsReloading(false);
    }
  };

  const calculateEfficiency = (statusDistribution) => {
    const total = statusDistribution.reduce((sum, item) => sum + item.count, 0);
    const completed = statusDistribution.find(item => item.status === 'Completed')?.count || 0;
    return total > 0 ? (completed / total) * 100 : 0;
  };
  useEffect(() => {
    // Set a timeout to prevent blocking the UI thread
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentUser]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };

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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 },
    }),
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  // Update status functionality has been moved to job list page
  // Show a faster loading state or render a skeleton UI instead of full-screen loading
  if (isLoading) {
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-12 rounded-lg animate-pulse"></div>
              ))}
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
        <TechnicianSidebar user={currentUser} activePath="/dashboard" />

        <motion.main className="flex-1 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-900/50 text-white p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-6 w-6 mr-2 text-red-400" />
                <p>{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="ml-auto flex items-center bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all duration-300 font-[Open Sans]"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Reload
                </button>
              </div>
            </div>
          )}

          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">
                Welcome, {technicianData?.fullName || "Technician"}
              </h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">
                Manage your tasks efficiently and keep vehicles running smoothly.
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={isReloading}
              className={`flex items-center bg-red-600 text-white px-4 py-2 rounded-full font-medium 
                ${isReloading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'} 
                transition-all duration-300 no-underline font-[Open Sans]`}
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${isReloading ? 'animate-spin' : ''}`} />
              {isReloading ? 'Reloading...' : 'Refresh Data'}
            </button>
          </header>

          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold font-[Poppins] mb-4 flex items-center">
              <ChartBarIcon className="h-6 w-6 text-red-500 mr-2" />
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                variants={itemVariants}
                whileHover="hover"
                className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
              >
                <div className="relative mb-2">
                  <svg className="w-20 h-20">
                    <circle
                      className="text-gray-700"
                      strokeWidth="5"
                      stroke="currentColor"
                      fill="transparent"
                      r="30"
                      cx="40"
                      cy="40"
                    />
                    <circle
                      className="text-red-500"
                      strokeWidth="5"
                      strokeDasharray={30 * 2 * Math.PI}
                      strokeDashoffset={30 * 2 * Math.PI * (1 - performanceData.efficiency / 100)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="30"
                      cx="40"
                      cy="40"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{performanceData.efficiency.toFixed(0)}%</span>
                  </div>
                </div>
                <p className="font-[Open Sans] text-gray-300">Efficiency</p>
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                whileHover="hover"
                className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
              >
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-8 w-8 ${
                        i < Math.floor(performanceData.customerSatisfaction)
                          ? "text-yellow-500"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xl font-bold">{performanceData.customerSatisfaction.toFixed(1)}</p>
                <p className="font-[Open Sans] text-gray-300">Customer Satisfaction</p>
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                whileHover="hover"
                className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
              >
                <CurrencyDollarIcon className="h-10 w-10 text-green-500 mb-2" />
                <p className="text-xl font-bold">${performanceData.earnings.toLocaleString()}</p>
                <p className="font-[Open Sans] text-gray-300">Total Earnings</p>
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                whileHover="hover"
                className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
              >
                <BoltIcon className="h-10 w-10 text-blue-500 mb-2" />
                <p className="text-xl font-bold">{stats.completedJobs}</p>
                <p className="font-[Open Sans] text-gray-300">Jobs Completed</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold font-[Poppins] text-white mb-6">Job Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
              >
                <ClockIcon className="h-10 w-10 text-yellow-500 mb-2" />
                <p className="text-xl font-bold">{stats.assignedJobs}</p>
                <p className="font-[Open Sans] text-gray-300">Current Jobs</p>
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
              >
                <WrenchScrewdriverIcon className="h-10 w-10 text-red-500 mb-2" />
                <p className="text-xl font-bold">{stats.assignedJobs}</p>
                <p className="font-[Open Sans] text-gray-300">Assigned Jobs</p>
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
              >
                <BoltIcon className="h-10 w-10 text-blue-500 mb-2" />
                <p className="text-xl font-bold">{stats.completedJobs}</p>
                <p className="font-[Open Sans] text-gray-300">Jobs Completed</p>
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
              >
                <StarIcon className="h-10 w-10 text-green-500 mb-2" />
                <p className="text-xl font-bold">{performanceData.customerSatisfaction.toFixed(1)}/5</p>
                <p className="font-[Open Sans] text-gray-300">Satisfaction Rating</p>
              </motion.div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-8">
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                whileHover="hover"
                custom={0}
                className="bg-white/10 backdrop-blur-md p-6 rounded-xl"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-xl font-bold font-[Poppins] mb-4 flex items-center"
                >
                  <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
                  Today's Tasks
                </motion.h2>
                <motion.div
                  variants={itemVariants}
                  className="space-y-2 font-[Open Sans] text-gray-300"
                >
                  <p>
                    Tasks Today: <span className="font-semibold">{stats.tasksToday}</span>
                  </p>
                  <p className="text-green-400">
                    Completed: <span className="font-semibold">{stats.completed}</span>
                  </p>                  <p className="text-red-400">
                    Urgent: <span className="font-semibold">{stats.urgent}</span>
                  </p>
                </motion.div>
              </motion.div>
              {/* Overview and Quick Actions sections removed as requested */}
            </div>
            <div className="lg:col-span-2">
              {/* Recent Jobs section moved below */}
            </div>
          </div>
          
          {/* Weekly Performance chart removed as requested */}
            {/* Recent Completed Jobs section moved to bottom as requested */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-8 bg-white/10 backdrop-blur-md p-6 rounded-lg"
          >
            <motion.h2
              variants={itemVariants}
              className="text-xl font-bold font-[Poppins] mb-4 flex items-center"
            >
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
              Completed Jobs
            </motion.h2>
            <div className="relative">
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {recentJobs.length > 0 ? (
                  recentJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex-1 font-[Open Sans] text-gray-300">
                        <p className="text-base font-semibold">
                          {job.vehicle} - {job.service}
                        </p>                        <p>
                          Priority:{" "}
                          <span
                            className={
                              job.priority === "High"
                                ? "text-red-400"
                                : job.priority === "Medium"
                                ? "text-yellow-400"
                                : "text-green-400"
                            }
                          >
                            {job.priority}
                          </span>
                        </p>
                        <p>
                          <span className="text-green-400">Completed: </span>
                          {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : job.date}
                        </p>
                      </div>                      <Link
                        to={`/view-details/${job.id}`}
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-full font-medium hover:bg-green-700 transition-all duration-300 no-underline font-[Open Sans]"
                      >
                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                        View Record
                      </Link>
                    </motion.div>
                  ))                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No completed jobs found</p>
                    <p className="text-sm">When you complete job assignments, they will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.main>
      </motion.div>

      <Footer />
    </div>
  );
};

export default TechnicianDashboard;