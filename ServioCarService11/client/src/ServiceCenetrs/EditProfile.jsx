import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  Bars3Icon,
  MapPinIcon,
  HomeIcon,
  XMarkIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Footer from "../components/Footer";
import ServiceCenterSidebar from "../components/ServiceCenterSidebar";
import { onAuthStateChanged } from "firebase/auth";
import serviceCenterService from "../services/serviceCenter.service";

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [serviceCenterData, setServiceCenterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Form data state for service center
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    certification: "",
    description: "",
    serviceTypes: "",
    website: "",
  });

  // First effect to get the current authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  // Second effect to fetch service center data once user is authenticated
  useEffect(() => {
    const fetchServiceCenterData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // First, get the basic user data from Firebase
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUserData(userData);
          
          // Next, try to get detailed service center data from API service
          const response = await serviceCenterService.getServiceCenterProfile();
          
          if (response.success) {
            setServiceCenterData(response.data);
            
            // Populate form with service center data
            setFormData({
              name: response.data.name || "",
              email: response.data.email || user.email || "",
              phone: response.data.phone || "",
              address: response.data.address || "",
              certification: response.data.certification || "",
              description: response.data.description || "", 
              serviceTypes: Array.isArray(response.data.serviceTypes) 
                ? response.data.serviceTypes.join(", ") 
                : response.data.serviceTypes || "",
              website: response.data.website || "",
            });
          } else {
            // If API failed but we have some data from Firebase, use that
            setFormData({
              name: userData.name || "",
              email: userData.email || user.email || "",
              phone: userData.phone || "",
              address: userData.address || "",
              certification: userData.certification || "",
              description: userData.description || "", 
              serviceTypes: Array.isArray(userData.serviceTypes) 
                ? userData.serviceTypes.join(", ") 
                : userData.serviceTypes || "",
              website: userData.website || "",
            });
          }
        } else {
          setErrorMessage("User profile not found.");
        }
      } catch (error) {
        console.error("Error fetching service center data:", error);
        setErrorMessage("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceCenterData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Format service types as array if provided as comma-separated string
      const formattedData = {
        ...formData,
        serviceTypes: formData.serviceTypes 
          ? formData.serviceTypes.split(',').map(type => type.trim()) 
          : []
      };
      
      // Update service center profile using the service
      const response = await serviceCenterService.updateServiceCenterProfile(formattedData);
      
      if (response.success) {
        setSuccessMessage("Profile updated successfully!");
        setServiceCenterData({...serviceCenterData, ...formattedData});
      } else {
        throw new Error(response.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage(`Failed to update profile: ${error.message}`);
    } finally {
      setUpdating(false);
      
      // Auto-hide success message after 5 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      }
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="flex flex-1 relative">
        <ServiceCenterSidebar activePath="/edit-profile" />

        <button
          className="md:hidden fixed top-4 left-4 z-30 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all duration-200 ease-in-out"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 shadow-lg">
                <h1 className="text-3xl font-bold font-[Poppins] tracking-tight">Update Your Details</h1>
                <p className="text-sm mt-1 font-[Open Sans] text-gray-300">
                  Modify your service center information below
                </p>
              </header>
              
              {/* Success/Error Messages */}
              {successMessage && (
                <div className="bg-green-500/20 backdrop-blur-md border border-green-500 text-green-300 px-4 py-3 rounded-md flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <p>{successMessage}</p>
                </div>
              )}
              {errorMessage && (
                <div className="bg-red-500/20 backdrop-blur-md border border-red-500 text-red-300 px-4 py-3 rounded-md flex items-center">
                  <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Profile Sections */}              <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center font-[Raleway]">
                  <BuildingOfficeIcon className="mr-2 h-6 w-6 text-red-500" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Service Center Name */}
                  <div>
                    <label htmlFor="name" className="block mb-1 text-gray-300 font-[Open Sans]">
                      Service Center Name
                    </label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter service center name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block mb-1 text-gray-300 font-[Open Sans]">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block mb-1 text-gray-300 font-[Open Sans]">
                      Phone Number
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label htmlFor="website" className="block mb-1 text-gray-300 font-[Open Sans]">
                      Website (Optional)
                    </label>
                    <div className="relative">
                      <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full pl-10 p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="https://your-website.com"
                      />
                    </div>
                  </div>
                </div>
              </section>              <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center font-[Raleway]">
                  <UserIcon className="mr-2 h-6 w-6 text-red-500" />
                  Additional Details
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {/* Certification */}
                  <div>
                    <label htmlFor="certification" className="block mb-1 text-gray-300 font-[Open Sans]">
                      Certification Number
                    </label>
                    <div className="relative">
                      <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="certification"
                        name="certification"
                        value={formData.certification}
                        onChange={handleChange}
                        className="w-full pl-10 p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter certification number"
                      />
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div>                    <label htmlFor="address" className="block mb-1 text-gray-300 font-[Open Sans]">
                      Business Address
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter complete address"
                        rows="3"
                      />
                    </div>
                  </div>
                  
                  {/* Service Types */}
                  <div>                    <label htmlFor="serviceTypes" className="block mb-1 text-gray-300 font-[Open Sans]">
                      Services Offered (comma separated)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="serviceTypes"
                        name="serviceTypes"
                        value={formData.serviceTypes}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. Oil Change, Brake Repair, Engine Diagnosis"
                      />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>                    <label htmlFor="description" className="block mb-1 text-gray-300 font-[Open Sans]">
                      Business Description
                    </label>
                    <div className="relative">
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Tell customers about your service center, expertise, and specialties..."
                        rows="4"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/service-center-home")}
                  className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className={`px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all flex items-center justify-center ${
                    updating ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {updating ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.main>
      </div>
      <Footer />
    </div>
  );
};

export default EditProfile;