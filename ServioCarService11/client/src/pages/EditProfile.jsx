import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  DocumentTextIcon,
  MapPinIcon,
  CakeIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Footer from "../components/Footer";
import OwnerSidebar from "../components/OwnerSidebar";
import TechnicianSidebar from "../components/TechnicianSidebar";
import ServiceCenterSidebar from "../components/ServiceCenterSidebar";
import { onAuthStateChanged } from "firebase/auth";

function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Form data state for each user type
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

  // Second effect to fetch user data once we have the user
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User data fetched:", userData); // Debug log
          setUserData(userData);
          
          // Initialize form based on user category
          const initialFormData = {
            name: userData.name || "",
            email: userData.email || user.email || "",
          };

          // Add category-specific fields
          if (userData.category === "owner") {
            initialFormData.carMake = userData.carMake || "";
            initialFormData.carModel = userData.carModel || "";
            initialFormData.numberPlate = userData.numberPlate || "";
            initialFormData.vinNumber = userData.vinNumber || "";
          } else if (userData.category === "technician") {
            initialFormData.specialization = userData.specialization || "";
            initialFormData.age = userData.age || "";
          } else if (userData.category === "service-center") {
            initialFormData.certification = userData.certification || "";
            initialFormData.address = userData.address || "";
          }

          setFormData(initialFormData);
        } else {
          console.log("No user document exists");
          setErrorMessage("User profile not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Failed to load user profile: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !userData) {
      setErrorMessage("User data not available");
      return;
    }

    try {
      setUpdating(true);
      setSuccessMessage("");
      setErrorMessage("");

      // Make sure we're using the correct document reference
      const userDocRef = doc(db, "users", user.uid);
      
      // Base update data
      const updateData = {
        name: formData.name,
        // Don't update email as it requires auth change
      };

      // Add category-specific fields
      if (userData.category === "owner") {
        updateData.carMake = formData.carMake;
        updateData.carModel = formData.carModel;
        updateData.numberPlate = formData.numberPlate;
        updateData.vinNumber = formData.vinNumber;
      } else if (userData.category === "technician") {
        updateData.specialization = formData.specialization;
        updateData.age = parseInt(formData.age) || 0;
      } else if (userData.category === "service-center") {
        updateData.certification = formData.certification;
        updateData.address = formData.address;
      }
      
      console.log("Updating user with data:", updateData); // Debug log
      
      // Perform the update and await the result
      await updateDoc(userDocRef, updateData);
      
      console.log("Update successful"); // Debug log
      setSuccessMessage("Profile updated successfully!");

      // Update local userData state to reflect changes
      setUserData(prevData => ({ ...prevData, ...updateData }));
      
      // Redirect to profile after successful update
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-white font-sans justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
        <p className="mt-4 text-xl font-[Open Sans]">Loading profile...</p>
      </div>
    );
  }

  // Determine which sidebar to use based on user category
  const SidebarComponent = userData?.category === "owner" 
    ? OwnerSidebar 
    : userData?.category === "technician" 
      ? TechnicianSidebar 
      : ServiceCenterSidebar;

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
        {/* Sidebar Component */}
        {SidebarComponent && (
          <SidebarComponent
            isOpen={isSidebarOpen}
            onClose={toggleSidebar}
            activePage="Edit Profile"
          />
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden fixed top-4 left-4 z-30 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all duration-200 ease-in-out"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">Edit Profile</h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">Update your personal information</p>
            </div>
          </header>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-xl border border-gray-700/50"
          >
            {/* Success Message */}
            {successMessage && (
              <motion.div
                variants={itemVariants}
                className="bg-green-600/20 text-green-300 p-4 rounded-xl shadow-md mb-6 flex items-center"
              >
                <CheckCircleIcon className="h-6 w-6 mr-2" />
                {successMessage}
              </motion.div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                variants={itemVariants}
                className="bg-red-600/20 text-red-300 p-4 rounded-xl shadow-md mb-6 flex items-center"
              >
                <ExclamationCircleIcon className="h-6 w-6 mr-2" />
                {errorMessage}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Common fields for all users */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white border-b border-gray-600 pb-2 font-[Raleway]">
                    <UserIcon className="inline-block h-6 w-6 mr-2" />
                    Account Information
                  </h2>
                  
                  <div>
                    <label htmlFor="name" className="block mb-1 text-gray-300 font-[Open Sans]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-1 text-gray-300 font-[Open Sans]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled
                      title="Email cannot be changed directly"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Email cannot be changed directly for security reasons.
                    </p>
                  </div>
                </div>

                {/* Owner-specific fields */}
                {userData?.category === "owner" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white border-b border-gray-600 pb-2 font-[Raleway]">
                      <TruckIcon className="inline-block h-6 w-6 mr-2" />
                      Vehicle Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="carMake" className="block mb-1 text-gray-300 font-[Open Sans]">
                          Car Make
                        </label>
                        <input
                          type="text"
                          id="carMake"
                          name="carMake"
                          value={formData.carMake}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="carModel" className="block mb-1 text-gray-300 font-[Open Sans]">
                          Car Model
                        </label>
                        <input
                          type="text"
                          id="carModel"
                          name="carModel"
                          value={formData.carModel}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="numberPlate" className="block mb-1 text-gray-300 font-[Open Sans]">
                          License Plate Number
                        </label>
                        <input
                          type="text"
                          id="numberPlate"
                          name="numberPlate"
                          value={formData.numberPlate}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="vinNumber" className="block mb-1 text-gray-300 font-[Open Sans]">
                          VIN Number
                        </label>
                        <input
                          type="text"
                          id="vinNumber"
                          name="vinNumber"
                          value={formData.vinNumber}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Technician-specific fields */}
                {userData?.category === "technician" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white border-b border-gray-600 pb-2 font-[Raleway]">
                      <WrenchScrewdriverIcon className="inline-block h-6 w-6 mr-2" />
                      Professional Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="specialization" className="block mb-1 text-gray-300 font-[Open Sans]">
                          Specialization
                        </label>
                        <input
                          type="text"
                          id="specialization"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="age" className="block mb-1 text-gray-300 font-[Open Sans]">
                          Age
                        </label>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                          min="18"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Service Center-specific fields */}
                {userData?.category === "service-center" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white border-b border-gray-600 pb-2 font-[Raleway]">
                      <BuildingOfficeIcon className="inline-block h-6 w-6 mr-2" />
                      Business Information
                    </h2>
                    
                    <div>
                      <label htmlFor="certification" className="block mb-1 text-gray-300 font-[Open Sans]">
                        Certification
                      </label>
                      <input
                        type="text"
                        id="certification"
                        name="certification"
                        value={formData.certification}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block mb-1 text-gray-300 font-[Open Sans]">
                        Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                        required
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2 mr-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300"
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Save Changes"}
                </button>
              </motion.div>
            </form>
          </motion.div>
        </main>
      </div>

      {/* Footer - Full Width */}
      <Footer />
    </div>
  );
}

export default EditProfile;