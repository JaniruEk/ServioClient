// src/components/ServiceCenterDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  XCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  UsersIcon,
  TruckIcon,
  ListBulletIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import ServiceCenterSidebar from '../components/ServiceCenterSidebar';
import Footer from '../components/Footer';
import serviceCenterService from '../services/serviceCenter.service';

const ServiceCenterDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await serviceCenterService.getServiceReservations();
        
        if (response.success) {
          setReservations(response.data);
        } else {
          setError(response.error || 'Failed to fetch reservations');
          
          // If backend is unavailable, use sample data for demonstration purposes
          setReservations([
            { 
              id: 'res1', 
              customerName: 'John Smith', 
              vehicleMake: 'Toyota', 
              vehicleModel: 'Corolla',
              serviceType: 'Oil Change',
              status: 'Pending', 
              scheduledDate: '2025-05-25T10:00:00',
              contactNumber: '077-1234567'
            },
            { 
              id: 'res2', 
              customerName: 'Sarah Williams', 
              vehicleMake: 'Honda', 
              vehicleModel: 'Civic',
              serviceType: 'Brake Inspection',
              status: 'Confirmed', 
              scheduledDate: '2025-05-20T14:30:00',
              contactNumber: '071-9876543'
            },
            { 
              id: 'res3', 
              customerName: 'Michael Brown', 
              vehicleMake: 'Nissan', 
              vehicleModel: 'Altima',
              serviceType: 'Engine Diagnosis',
              status: 'Completed', 
              scheduledDate: '2025-05-10T09:15:00',
              contactNumber: '076-5557777'
            },
            { 
              id: 'res4', 
              customerName: 'Emma Davis', 
              vehicleMake: 'BMW', 
              vehicleModel: '3 Series',
              serviceType: 'Full Service',
              status: 'Cancelled', 
              scheduledDate: '2025-05-12T11:00:00',
              contactNumber: '070-3334444'
            }
          ]);
        }
      } catch (err) {
        setError('Error fetching reservations: ' + err.message);
        console.error('Error fetching reservations:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservations();
  }, []);
  
  const filteredReservations = filterStatus === "All" 
    ? reservations 
    : reservations.filter(reservation => reservation.status === filterStatus);
  
  const handleEditClick = (service) => {
    setEditService(service);
    setShowEditModal(true);
  };

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
      <div className="flex flex-1">
        <ServiceCenterSidebar activePath="/service-center-home" />

        <main className="flex-1 ml-64 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">          {/* Header */}
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">
                Service Center Dashboard
              </h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">
                Manage your reservations, bookings, and customer requests
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/service-center/job-list"
                className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-all duration-200 ease-in-out flex items-center gap-1 font-[Open Sans]"
              >
                <ClockIcon className="h-5 w-5" />
                Manage Jobs
              </Link>
            </div>
          </header>{/* Statistics Overview */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <CalendarIcon className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-1 font-[Raleway]">
                Total Reservations
              </h3>
              <p className="text-3xl font-bold text-white font-[Poppins]">
                {reservations.length}
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <ClockIcon className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-1 font-[Raleway]">
                Pending
              </h3>
              <p className="text-3xl font-bold text-white font-[Poppins]">
                {reservations.filter(res => res.status === 'Pending').length}
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <CheckCircleIcon className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-1 font-[Raleway]">
                Completed
              </h3>
              <p className="text-3xl font-bold text-white font-[Poppins]">
                {reservations.filter(res => res.status === 'Completed').length}
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <XCircleIcon className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-1 font-[Raleway]">
                Cancelled
              </h3>
              <p className="text-3xl font-bold text-white font-[Poppins]">
                {reservations.filter(res => res.status === 'Cancelled').length}
              </p>
            </div>
          </section>          {/* Reservations Section */}
          <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg mb-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white font-[Poppins] flex items-center">
                <CalendarIcon className="h-6 w-6 text-red-500 mr-2" />
                Service Reservations
              </h2>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 outline-none focus:border-red-500 font-[Open Sans]"
                >
                  <option value="All">All Reservations</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 backdrop-blur-md border border-red-500 text-red-300 px-4 py-3 rounded-md">
                <p>{error}</p>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="bg-gray-800/50 text-center py-8 rounded-lg">
                <p className="text-gray-400 font-[Open Sans]">No reservations found</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="overflow-x-auto"
              >
                <table className="w-full text-white">
                  <thead className="bg-gray-800/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-[Raleway]">Customer</th>
                      <th className="px-4 py-3 font-[Raleway]">Vehicle</th>
                      <th className="px-4 py-3 font-[Raleway]">Service</th>
                      <th className="px-4 py-3 font-[Raleway]">Date</th>
                      <th className="px-4 py-3 font-[Raleway]">Status</th>
                      <th className="px-4 py-3 font-[Raleway]">Contact</th>
                      <th className="px-4 py-3 font-[Raleway]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((reservation) => (
                      <motion.tr
                        key={reservation.id}
                        variants={itemVariants}
                        className="border-b border-gray-700/30 hover:bg-white/5"
                      >
                        <td className="px-4 py-3 font-[Open Sans]">{reservation.customerName}</td>
                        <td className="px-4 py-3 font-[Open Sans]">{`${reservation.vehicleMake} ${reservation.vehicleModel}`}</td>
                        <td className="px-4 py-3 font-[Open Sans]">{reservation.serviceType}</td>
                        <td className="px-4 py-3 font-[Open Sans]">
                          {new Date(reservation.scheduledDate).toLocaleDateString('en-US', {
                            day: 'numeric', 
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            reservation.status === "Pending" ? "bg-yellow-900/20 text-yellow-500" :
                            reservation.status === "Confirmed" ? "bg-blue-900/20 text-blue-500" :
                            reservation.status === "In Progress" ? "bg-indigo-900/20 text-indigo-500" :
                            reservation.status === "Completed" ? "bg-green-900/20 text-green-500" :
                            "bg-red-900/20 text-red-500"
                          }`}>
                            {reservation.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-[Open Sans]">{reservation.contactNumber}</td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => navigate(`/service-center/job-details/${reservation.id}`)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-all duration-200 ease-in-out"
                          >
                            View Details
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </section>          {/* Quick Links Section */}
          <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4 font-[Poppins]">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-[Open Sans]">
              <Link
                to="/service-center/job-list"
                className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all duration-300 no-underline text-center"
              >
                <ListBulletIcon className="h-12 w-12 text-red-500 mb-2" />
                <span className="text-white font-medium">View Jobs</span>
              </Link>
              <Link
                to="/pending-jobs"
                className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all duration-300 no-underline text-center"
              >
                <ClockIcon className="h-12 w-12 text-red-500 mb-2" />
                <span className="text-white font-medium">Pending Jobs</span>
              </Link>
              <Link
                to="/report-and-analyse"
                className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all duration-300 no-underline text-center"
              >
                <ChartBarIcon className="h-12 w-12 text-red-500 mb-2" />
                <span className="text-white font-medium">Analytics</span>
              </Link>              <Link
                to="/service-center/edit-profile"
                className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all duration-300 no-underline text-center"
              >
                <UserIcon className="h-12 w-12 text-red-500 mb-2" />
                <span className="text-white font-medium">Edit Profile</span>
              </Link>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceCenterDashboard;
