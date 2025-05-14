// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  WrenchScrewdriverIcon,
  PencilIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid"; // Matching Dashboard icons
import { logout, getUser } from "../services/authService";
import { getTechnicianByUserId, updateTechnicianProfile } from "../services/technicianService";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const navigate = useNavigate();
  const [technicianData, setTechnicianData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch technician data from backend
  useEffect(() => {
    const fetchTechnicianData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current logged in user
        const user = getUser();
        
        if (!user || user.category !== 'technician') {
          setError("You must be logged in as a technician to view this page");
          navigate('/login');
          return;
        }
        
        // Fetch technician profile data using the user ID
        const response = await getTechnicianByUserId(user.id);
        
        if (response.success) {
          setTechnicianData(response.data);
          // Initialize form data with technician info
          setFormData({
            name: response.data.fullName || "",
            email: response.data.contactInformation?.email || "",
            phone: response.data.contactInformation?.phone || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        } else {
          setError("Failed to fetch technician data");
        }
      } catch (err) {
        console.error("Error fetching technician data:", err);
        setError("An error occurred while fetching your profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTechnicianData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      if (activeTab === "personal") {
        // Update personal information
        if (!technicianData?._id) {
          setError("Technician ID not found");
          return;
        }
        
        // Prepare data for API
        const updateData = {
          fullName: formData.name,
          contactInformation: {
            email: formData.email,
            phone: formData.phone,
            // Keep other contact info fields if they exist
            ...(technicianData.contactInformation || {})
          }
        };
        
        const response = await updateTechnicianProfile(technicianData._id, updateData);
        
        if (response.success) {
          setTechnicianData({
            ...technicianData,
            ...response.data
          });
          setSuccessMessage("Profile updated successfully");
        }
      } else if (activeTab === "security") {
        // Handle password change in a separate API call
        // This would use the updatePassword function from authService
        if (formData.newPassword !== formData.confirmPassword) {
          setError("New passwords do not match");
          return;
        }
        
        if (!formData.currentPassword) {
          setError("Current password is required");
          return;
        }
        
        // Password update would go here
        setSuccessMessage("Password updated successfully");
      }
    } catch (err) {
      console.error("Save failed:", err);
      setError(err.response?.data?.error || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset form to original values
    if (technicianData) {
      setFormData({
        name: technicianData.fullName || "",
        email: technicianData.contactInformation?.email || "",
        phone: technicianData.contactInformation?.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (isLoading && !technicianData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-white font-sans justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
        <p className="mt-4 text-xl font-[Open Sans]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white font-sans relative">
      {/* Background Image Section */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('./images/profile2.jpg')",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
      </div>
      {/* Header */}
      <header className="flex justify-between items-center bg-gray-800 p-4 shadow-lg sticky top-0 z-10 mb-8">
        <div className="flex items-center">
          <UserGroupIcon className="h-8 w-8 text-red-500 mr-3" />
          <h1 className="text-2xl font-bold font-[Poppins] text-white">
            Technician Profile
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/editprofile"
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all duration-300 no-underline font-[Open Sans]"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Profile
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all duration-300 no-underline font-[Open Sans]"
          >
            <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all duration-300 font-[Open Sans]"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl">
          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-900/50 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-900/50 text-white p-4 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b-2 border-gray-700 mb-6">
            <button
              className={`flex-1 py-3 text-base font-bold font-[Poppins] transition-all duration-300 ${
                activeTab === "personal"
                  ? "text-red-500 bg-white/10 border-b-2 border-red-500"
                  : "text-gray-300 hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("personal")}
            >
              Personal Info
            </button>
            <button
              className={`flex-1 py-3 text-base font-bold font-[Poppins] transition-all duration-300 ${
                activeTab === "availability"
                  ? "text-red-500 bg-white/10 border-b-2 border-red-500"
                  : "text-gray-300 hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("availability")}
            >
              Availability
            </button>
            <button
              className={`flex-1 py-3 text-base font-bold font-[Poppins] transition-all duration-300 ${
                activeTab === "security"
                  ? "text-red-500 bg-white/10 border-b-2 border-red-500"
                  : "text-gray-300 hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("security")}
            >
              Security
            </button>
          </div>

          {/* Tab Content */}
          <motion.section
            key={activeTab}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Personal Info */}
            {activeTab === "personal" && (
              <div>
                <h2 className="text-xl font-bold font-[Poppins] mb-4 text-white flex items-center">
                  <UserGroupIcon className="h-6 w-6 text-red-500 mr-2" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 mb-6 font-[Open Sans] text-gray-300">
                  <label className="text-sm font-medium">Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <label className="text-sm font-medium">Technician ID:</label>
                  <input
                    type="text"
                    value={technicianData?._id || ""}
                    disabled
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400"
                  />
                  <label className="text-sm font-medium">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <label className="text-sm font-medium">Phone:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            {/* Availability */}
            {activeTab === "availability" && (
              <div>
                <h2 className="text-xl font-bold font-[Poppins] mb-4 text-white flex items-center">
                  <CalendarIcon className="h-6 w-6 text-red-500 mr-2" />
                  Set Availability
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 font-[Open Sans] text-gray-300">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <div key={day} className="bg-white/5 p-4 rounded-lg">
                      <p className="text-sm font-bold font-[Poppins] mb-2 text-white">
                        {day}
                      </p>
                      <label className="block text-sm">
                        <input 
                          type="checkbox" 
                          className="mr-2 accent-red-500"
                          checked={technicianData?.availability?.daysOfWeek?.includes(day) || false}
                        />{" "}
                        8:00 AM
                      </label>
                      <label className="block text-sm">
                        <input 
                          type="checkbox" 
                          className="mr-2 accent-red-500" 
                        />{" "}
                        6:00 PM
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div>
                <h2 className="text-xl font-bold font-[Poppins] mb-4 text-white flex items-center">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
                  Security Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 font-[Open Sans] text-gray-300">
                  <label className="text-sm font-medium">Current Password:</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <label className="text-sm font-medium">New Password:</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <label className="text-sm font-medium">
                    Confirm New Password:
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            {/* Save/Reset Buttons */}
            <div className="text-right mt-6">
              <button 
                className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all duration-300 font-[Open Sans] mr-2"
                onClick={handleSaveChanges}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button 
                className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all duration-300 font-[Open Sans]"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </button>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default Profile;