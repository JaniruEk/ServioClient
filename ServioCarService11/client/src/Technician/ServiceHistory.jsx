import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  WrenchScrewdriverIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
} from "@heroicons/react/24/solid";
import TechnicianSidebar from "../components/TechnicianSidebar";
import Footer from "../components/Footer";

const ServiceHistory = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    // Get the user from localStorage
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    setCurrentUser(user);

    const fetchServiceHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock API call for service history
        // In a real app, replace with actual API call
        // const response = await axios.get(`/api/technicians/${user.userId}/service-history`);
        
        // Mock data for demonstration
        const mockServiceHistory = [
          {
            id: "SH001",
            jobId: "J1234",
            vehicle: "Toyota Camry",
            service: "Brake Repair",
            customer: "Chanuka Herath",
            date: "2025-05-01",
            completionDate: "2025-05-02",
            status: "Completed",
            notes: "Replaced brake pads and rotors, customer satisfied with work.",
            rating: 4.8,
          },
          {
            id: "SH002",
            jobId: "J1235",
            vehicle: "Honda Civic",
            service: "Oil Change",
            customer: "Suneth Herath",
            date: "2025-04-28",
            completionDate: "2025-04-28",
            status: "Completed",
            notes: "Routine oil change completed, also topped off other fluids.",
            rating: 5.0,
          },
          {
            id: "SH003",
            jobId: "J1236",
            vehicle: "Ford Focus",
            service: "Engine Diagnostics",
            customer: "Lakshan Ekanayaka",
            date: "2025-04-25",
            completionDate: "2025-04-26",
            status: "Completed",
            notes: "Diagnosed and fixed check engine light issue. Faulty O2 sensor replaced.",
            rating: 4.5,
          },
          {
            id: "SH004",
            jobId: "J1237",
            vehicle: "Nissan Altima",
            service: "Transmission Service",
            customer: "Dilshan Silva",
            date: "2025-04-22",
            completionDate: "2025-04-23",
            status: "Completed",
            notes: "Flushed transmission fluid and replaced filter. Test drive showed smooth shifting.",
            rating: 4.7,
          },
          {
            id: "SH005",
            jobId: "J1238",
            vehicle: "BMW 3 Series",
            service: "Electrical System Repair",
            customer: "Ramesh Perera",
            date: "2025-04-18",
            completionDate: null,
            status: "Cancelled",
            notes: "Customer cancelled the appointment due to emergency.",
            rating: null,
          },
        ];

        setTimeout(() => {
          setServiceHistory(mockServiceHistory);
          setIsLoading(false);
        }, 800); // Simulate loading delay
      } catch (err) {
        console.error("Error fetching service history:", err);
        setError("An error occurred while loading your service history.");
        setIsLoading(false);
      }
    };

    fetchServiceHistory();
  }, []);

  // Filter and search functionality
  const filteredHistory = serviceHistory.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jobId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || item.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Export service history as CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Job ID",
      "Vehicle",
      "Service",
      "Customer",
      "Date",
      "Completion Date",
      "Status",
      "Rating",
    ];
    
    const dataToExport = filteredHistory.map((item) => [
      item.id,
      item.jobId,
      item.vehicle,
      item.service,
      item.customer,
      item.date,
      item.completionDate || "N/A",
      item.status,
      item.rating || "N/A",
    ]);
    
    const csvContent = [
      headers.join(","),
      ...dataToExport.map((row) => row.join(",")),
    ].join("\\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `service_history_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View details handler
  const handleViewDetails = (jobId) => {
    navigate(`/view-details/${jobId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white font-sans justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-xl font-[Open Sans] text-gray-300">Loading service history...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <TechnicianSidebar user={currentUser} activePath="/service-history" />

        {/* Main Content */}
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
        >
          {/* Header */}
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">
                Service History
              </h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">
                View your past services and completed jobs
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-300"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export
            </button>
          </header>

          {/* Error message */}
          {error && (
            <div className="bg-red-900/50 text-white p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-6 w-6 mr-2 text-red-400" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Search and Filter Section */}
          <motion.div
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-md p-6 rounded-lg mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by vehicle, service, customer or job ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Service History List */}
          <motion.div variants={itemVariants} className="space-y-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-white/10 backdrop-blur-md p-6 rounded-lg"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
                        <h3 className="text-xl font-bold font-[Poppins]">
                          {item.service} - {item.vehicle}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-gray-300">
                        <p>
                          <span className="font-semibold">Job ID:</span> {item.jobId}
                        </p>
                        <p>
                          <span className="font-semibold">Customer:</span> {item.customer}
                        </p>
                        <p className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="font-semibold mr-1">Date:</span> {item.date}
                        </p>
                        <p className="flex items-center">
                          {item.status === "Completed" ? (
                            <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                          ) : (
                            <ExclamationCircleIcon className="h-4 w-4 mr-1 text-orange-500" />
                          )}
                          <span className="font-semibold mr-1">Status:</span>
                          <span
                            className={
                              item.status === "Completed"
                                ? "text-green-500"
                                : "text-orange-400"
                            }
                          >
                            {item.status}
                          </span>
                        </p>
                        <p className="md:col-span-2">
                          <span className="font-semibold">Notes:</span> {item.notes}
                        </p>
                      </div>
                      {item.rating && (
                        <div className="mt-2 flex items-center">
                          <span className="font-semibold mr-2">Customer Rating:</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 ${
                                  i < Math.floor(item.rating)
                                    ? "text-yellow-500"
                                    : "text-gray-400"
                                }`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-1 text-yellow-500">{item.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleViewDetails(item.jobId)}
                        className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-300"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-lg">
                <CalendarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold font-[Poppins] mb-2">No service history found</h3>
                <p className="text-gray-400">
                  {searchTerm || filterStatus !== "all"
                    ? "No results match your search criteria. Try adjusting your filters."
                    : "You haven't completed any services yet."}
                </p>
              </div>
            )}
          </motion.div>
        </motion.main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ServiceHistory;
