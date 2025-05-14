import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import ServiceCenterSidebar from '../components/ServiceCenterSidebar';
import Footer from '../components/Footer';

const ServiceCenterHome = () => {
  // Sample data - in a real app, this would come from your backend
  const [services, setServices] = useState([
    { id: 1, title: "Brake Repair", description: "Expert brake repair services.", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FyJTIwYnJha2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60", status: "Active", cost: 150 },
    { id: 2, title: "Oil Change", description: "Quick and efficient oil change.", image: "https://images.unsplash.com/photo-1635100574034-eb8688db32fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b2lsJTIwY2hhbmdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60", status: "Active", cost: 50 },
    { id: 3, title: "Tire Rotation", description: "Professional tire rotation service.", image: "https://images.unsplash.com/photo-1581388223018-cf510cd5ca0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGlyZSUyMHJvdGF0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60", status: "Inactive", cost: 80 },
    { id: 4, title: "Engine Diagnostics", description: "Advanced engine diagnostics.", image: "https://images.unsplash.com/photo-1601523910463-f39a527c7a9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FyJTIwZW5naW5lfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60", status: "Active", cost: 200 },
  ]);
  
  const [reservations, setReservations] = useState([
    { id: 1, customer: "John Doe", service: "Oil Change", date: "2023-11-15", status: "Pending", contact: "555-1234" },
    { id: 2, customer: "Jane Smith", service: "Brake Repair", date: "2023-11-18", status: "Confirmed", contact: "555-5678" },
    { id: 3, customer: "Mike Johnson", service: "Engine Diagnostics", date: "2023-11-20", status: "Completed", contact: "555-9012" },
  ]);
  
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newService, setNewService] = useState({ title: "", description: "", image: "", status: "Active", cost: "" });
  const [editService, setEditService] = useState(null);
  
  const filteredServices = filterStatus === "All" 
    ? services 
    : services.filter(service => service.status === filterStatus);

  // Calculate statistics for the dashboard
  const totalServices = services.length;
  const activeServices = services.filter(s => s.status === "Active").length;
  const pendingReservations = reservations.filter(r => r.status === "Pending").length;
  const totalRevenue = services.reduce((sum, service) => sum + service.cost, 0);

  // Handle service form submission
  const handleServiceSubmit = (e) => {
    e.preventDefault();
    setServices([...services, { 
      ...newService, 
      id: services.length + 1, 
      cost: Number(newService.cost),
      image: newService.image || "https://via.placeholder.com/300x200?text=No+Image"
    }]);
    setNewService({ title: "", description: "", image: "", status: "Active", cost: "" });
    setShowAddModal(false);
  };

  // Handle edit service submission
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setServices(services.map(service => 
      service.id === editService.id ? { ...editService, cost: Number(editService.cost) } : service
    ));
    setEditService(null);
    setShowEditModal(false);
  };

  const handleDelete = (id) => setServices(services.filter(service => service.id !== id));
  
  const handleEditClick = (service) => {
    setEditService({ ...service });
    setShowEditModal(true);
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>

      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <ServiceCenterSidebar activePath="/service-center-home" />

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">Service Center Dashboard</h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">Manage your service offerings</p>
            </div>
          </header>
          
          {/* Overview Section */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <UsersIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">Total Services</h3>
              <p className="text-gray-300 font-[Open Sans] text-2xl font-bold">{totalServices}</p>
            </div>
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <WrenchScrewdriverIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">Active Services</h3>
              <p className="text-gray-300 font-[Open Sans] text-2xl font-bold">{activeServices}</p>
            </div>
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <ClockIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">Pending Reservations</h3>
              <p className="text-gray-300 font-[Open Sans] text-2xl font-bold">{pendingReservations}</p>
            </div>
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <CurrencyDollarIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">Revenue</h3>
              <p className="text-gray-300 font-[Open Sans] text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
          </section>

          {/* Services Management */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
              <h2 className="text-2xl font-bold text-white font-[Poppins]">Service Offerings</h2>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 rounded-md border bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-[Open Sans]"
                >
                  <option value="All">All Services</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 hover:scale-110 transition-all duration-200 ease-in-out flex items-center gap-1"
                >
                  <PlusIcon className="h-5 w-5" /> Add Service
                </button>
              </div>
            </div>
            
            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {filteredServices.map((service) => (
                <div 
                  key={service.id} 
                  className={`bg-white/10 backdrop-blur-md rounded-lg overflow-hidden shadow-lg border ${
                    service.status === "Active" ? "border-green-500/30" : "border-gray-600/30"
                  }`}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                      onError={(e) => {e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found"}}
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
                      <p className="text-red-500 font-semibold font-[Open Sans]">${service.cost.toFixed(2)}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(service)}
                          className="text-blue-400 hover:text-blue-300 hover:scale-125 transition-all duration-200"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="text-red-400 hover:text-red-300 hover:scale-125 transition-all duration-200"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links Section */}
            <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 font-[Poppins]">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-[Open Sans]">
                <Link
                  to="/service-center/job-reservations"
                  className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all duration-300 no-underline text-center"
                >
                  <ClockIcon className="h-12 w-12 text-red-500 mb-2" />
                  <span className="text-white font-medium">Job Reservations</span>
                </Link>
                <Link
                  to="/service-center/spare-parts"
                  className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all duration-300 no-underline text-center"
                >
                  <WrenchScrewdriverIcon className="h-12 w-12 text-red-500 mb-2" />
                  <span className="text-white font-medium">Spare Parts</span>
                </Link>
                <Link
                  to="/service-center/reports"
                  className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all duration-300 no-underline text-center"
                >
                  <ChartBarIcon className="h-12 w-12 text-red-500 mb-2" />
                  <span className="text-white font-medium">View Reports</span>
                </Link>
                <Link
                  to="/service-center/profile"
                  className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all duration-300 no-underline text-center"
                >
                  <UsersIcon className="h-12 w-12 text-red-500 mb-2" />
                  <span className="text-white font-medium">Edit Profile</span>
                </Link>
              </div>
            </section>
          </section>

          {/* Add Service Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="p-6 rounded-lg shadow-xl w-full max-w-md bg-gray-800 text-white">
                <h3 className="text-xl font-semibold mb-4 font-[Raleway] text-white">Add New Service</h3>
                <form onSubmit={handleServiceSubmit} className="space-y-4 font-[Open Sans]">
                  <div>
                    <label className="block mb-1 text-gray-300">Service Title</label>
                    <input
                      type="text"
                      value={newService.title}
                      onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Brake Repair"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Description</label>
                    <textarea
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Expert brake repair services"
                      required
                      rows="3"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Image URL (optional)</label>
                    <input
                      type="text"
                      value={newService.image}
                      onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Status</label>
                    <select
                      value={newService.status}
                      onChange={(e) => setNewService({ ...newService, status: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Cost ($)</label>
                    <input
                      type="number"
                      value={newService.cost}
                      onChange={(e) => setNewService({ ...newService, cost: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., 150"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Service Modal */}
          {showEditModal && editService && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="p-6 rounded-lg shadow-xl w-full max-w-md bg-gray-800 text-white">
                <h3 className="text-xl font-semibold mb-4 font-[Raleway] text-white">Edit Service</h3>
                <form onSubmit={handleEditSubmit} className="space-y-4 font-[Open Sans]">
                  <div>
                    <label className="block mb-1 text-gray-300">Service Title</label>
                    <input
                      type="text"
                      value={editService.title}
                      onChange={(e) => setEditService({ ...editService, title: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Description</label>
                    <textarea
                      value={editService.description}
                      onChange={(e) => setEditService({ ...editService, description: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                      rows="3"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Image URL</label>
                    <input
                      type="text"
                      value={editService.image}
                      onChange={(e) => setEditService({ ...editService, image: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Status</label>
                    <select
                      value={editService.status}
                      onChange={(e) => setEditService({ ...editService, status: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Cost ($)</label>
                    <input
                      type="number"
                      value={editService.cost}
                      onChange={(e) => setEditService({ ...editService, cost: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceCenterHome;
