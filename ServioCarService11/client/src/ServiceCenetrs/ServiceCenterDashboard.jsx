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
  UsersIcon
} from '@heroicons/react/24/outline';
import ServiceCenterSidebar from '../components/ServiceCenterSidebar';
import Footer from '../components/Footer';

const ServiceCenterDashboard = () => {
  // Placeholder images for services
  const placeholderImages = {
    brakeRepair: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    oilChange: "https://images.unsplash.com/photo-1613214665312-8e4de5e3eaa1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    tireRotation: "https://images.unsplash.com/photo-1593009052881-4daec3960fac?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    engineDiagnostics: "https://images.unsplash.com/photo-1606577924006-27d39b132ae2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  };

  const [services, setServices] = useState([
    { id: 1, title: "Brake Repair", description: "Expert brake repair services.", image: placeholderImages.brakeRepair, status: "Active", cost: 150 },
    { id: 2, title: "Oil Change", description: "Quick and efficient oil change.", image: placeholderImages.oilChange, status: "Active", cost: 50 },
    { id: 3, title: "Tire Rotation", description: "Professional tire rotation service.", image: placeholderImages.tireRotation, status: "Inactive", cost: 80 },
    { id: 4, title: "Engine Diagnostics", description: "Advanced engine diagnostics.", image: placeholderImages.engineDiagnostics, status: "Active", cost: 200 },
  ]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newService, setNewService] = useState({ title: "", description: "", image: "", status: "Active", cost: "" });
  const [editService, setEditService] = useState(null);

  const filteredServices = filterStatus === "All" ? services : services.filter((service) => service.status === filterStatus);

  const handleServiceSubmit = (e) => {
    e.preventDefault();
    setServices([...services, { ...newService, id: services.length + 1, cost: Number(newService.cost), image: newService.image || placeholderImages.brakeRepair }]);
    setNewService({ title: "", description: "", image: "", status: "Active", cost: "" });
    setShowAddModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setServices(services.map((service) => (service.id === editService.id ? { ...editService, cost: Number(editService.cost) } : service)));
    setEditService(null);
    setShowEditModal(false);
  };

  const handleDelete = (id) => setServices(services.filter((service) => service.id !== id));
  
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

        <main className="flex-1 ml-64 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">
                Service Center Dashboard
              </h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">
                Manage your services, bookings, and customer requests
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-all duration-200 ease-in-out flex items-center gap-1 font-[Open Sans]"
              >
                <PlusIcon className="h-5 w-5" />
                Add Service
              </button>
            </div>
          </header>

          {/* Statistics Overview */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <WrenchScrewdriverIcon className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-1 font-[Raleway]">
                Active Services
              </h3>
              <p className="text-3xl font-bold text-white font-[Poppins]">
                {services.filter((service) => service.status === "Active").length}
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <UsersIcon className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-1 font-[Raleway]">
                Pending Bookings
              </h3>
              <p className="text-3xl font-bold text-white font-[Poppins]">8</p>
            </div>
            <div className="p-6 rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <ChartBarIcon className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-1 font-[Raleway]">
                Total Revenue
              </h3>
              <p className="text-3xl font-bold text-white font-[Poppins]">$3,240</p>
            </div>
          </section>

          {/* Services Section */}
          <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg mb-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white font-[Poppins] flex items-center">
                <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
                Service Offerings
              </h2>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 outline-none focus:border-red-500 font-[Open Sans]"
                >
                  <option value="All">All Services</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  whileHover="hover"
                  className={`bg-white/5 backdrop-blur-md rounded-lg overflow-hidden border ${
                    service.status === "Active" ? "border-green-500/30" : "border-gray-600/30"
                  }`}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-white font-[Raleway]">{service.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          service.status === "Active"
                            ? "bg-green-900/20 text-green-500"
                            : "bg-gray-800/50 text-gray-400"
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4 font-[Open Sans]">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-red-500 font-semibold font-[Open Sans]">${service.cost}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(service)}
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Quick Links Section */}
          <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4 font-[Poppins]">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-[Open Sans]">
              <Link
                to="/job-list"
                className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all duration-300 no-underline text-center"
              >
                <WrenchScrewdriverIcon className="h-12 w-12 text-red-500 mb-2" />
                <span className="text-white font-medium">View Jobs</span>
              </Link>
              <Link
                to="/pending-jobs"
                className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all duration-300 no-underline text-center"
              >
                <UsersIcon className="h-12 w-12 text-red-500 mb-2" />
                <span className="text-white font-medium">Pending Requests</span>
              </Link>
              <Link
                to="/service-history"
                className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all duration-300 no-underline text-center"
              >
                <ChartBarIcon className="h-12 w-12 text-red-500 mb-2" />
                <span className="text-white font-medium">Service History</span>
              </Link>
              <Link
                to="/profile"
                className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all duration-300 no-underline text-center"
              >
                <UsersIcon className="h-12 w-12 text-red-500 mb-2" />
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
