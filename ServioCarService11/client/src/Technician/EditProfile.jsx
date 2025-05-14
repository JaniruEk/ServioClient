import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  Bars3Icon,
  CakeIcon,
} from "@heroicons/react/24/outline";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Footer from "../components/Footer";
import TechnicianSidebar from "../components/TechnicianSidebar";
import { onAuthStateChanged } from "firebase/auth";
import { getTechnicianByUserId, updateTechnician } from "../services/technician.service";

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [technicianData, setTechnicianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Form data state for technician
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    age: "",
    bio: "",
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
        
        // Fetch user data from Firebase
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let backendAvailable = true;
        let techData = null;
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserData(data);
          
          // Also try to get technician data from the backend API
          try {
            const techResponse = await getTechnicianByUserId(user.uid);
            if (techResponse.success && techResponse.data) {
              setTechnicianData(techResponse.data);
              techData = techResponse.data;
            } else if (techResponse.isNetworkError) {
              console.warn('Backend server unavailable, working in offline mode');
              backendAvailable = false;
            }
          } catch (apiError) {
            console.error("Error fetching technician data from API:", apiError);
            backendAvailable = false;
          }
          
          // Set form data (prioritize API data, fallback to Firebase data)
          setFormData({
            name: techData?.fullName || data.name || "",
            email: techData?.email || data.email || user.email || "",
            phone: techData?.contactNumber || data.contactNumber || data.phone || "",
            specialization: techData?.specialization || data.specialization || "",
            experience: techData?.experience || data.experience || "",
            age: techData?.age?.toString() || data.age?.toString() || "",
            bio: techData?.bio || data.bio || "",
          });
          
          if (!backendAvailable) {
            setErrorMessage("Working in offline mode. Changes will sync when connection is restored.");
          }
        } else {
          setErrorMessage("User profile not found. Please complete your profile.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Failed to load your profile data. Please try again.");
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
    
    if (!user) {
      setErrorMessage("You must be logged in to update your profile");
      return;
    }

    try {
      setUpdating(true);
      setErrorMessage("");
      setSuccessMessage("");
      
      // Always update user data in Firebase Firestore first since it's our primary data source
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: formData.name,
        email: formData.email,
        contactNumber: formData.phone,
        specialization: formData.specialization,
        experience: formData.experience,
        age: parseInt(formData.age, 10) || 0,
        bio: formData.bio,
        updatedAt: new Date().toISOString(),
        needsSync: true, // Flag to indicate this record needs syncing when backend is available
      });
      
      // If we have technician data from the API, try to update it as well
      let backendUpdated = false;
      if (technicianData) {
        const updateData = {
          fullName: formData.name,
          email: formData.email,
          contactNumber: formData.phone,
          specialization: formData.specialization,
          age: parseInt(formData.age, 10) || 0,
          bio: formData.bio,
          experience: formData.experience,
        };
        
        try {
          // Check first if backend is available
          let backendAvailable = true;
          try {
            // Make a lightweight call to check backend health
            await fetch('http://localhost:5000/api/health-check', { 
              method: 'GET',
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 2000
            });
          } catch (healthErr) {
            console.warn('Backend server appears to be offline:', healthErr.message);
            backendAvailable = false;
          }
          
          if (backendAvailable) {
            // Proceed with API update
            const apiResponse = await updateTechnician(technicianData._id, updateData);
            
            if (apiResponse.success) {
              backendUpdated = true;
              // If backend update succeeded, remove the needsSync flag
              await updateDoc(userDocRef, { needsSync: false });
            } else {
              console.warn("API update failed, but Firebase update succeeded:", apiResponse);
            }
          } else {
            setErrorMessage("Changes saved locally. Will sync with server when connection is restored.");
          }
        } catch (apiError) {
          console.error("Error updating profile in backend:", apiError);
          // Don't set an error message since Firebase update succeeded
        }
      }

      setSuccessMessage("Profile updated successfully!");
      
      // Briefly show success message and then redirect
      setTimeout(() => {
        navigate("/technician-home");
      }, 2000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile: " + (error.message || "Unknown error"));
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
        <p className="mt-4 text-xl font-[Open Sans]">Loading technician profile...</p>
      </div>
    );
  }

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
        {/* Technician Sidebar */}
        <TechnicianSidebar user={userData} activePath="/technician/edit-profile" />

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
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">Edit Technician Profile</h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">Update your professional information</p>
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
                {/* Personal Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white border-b border-gray-600 pb-2 font-[Raleway]">
                    <UserIcon className="inline-block h-6 w-6 mr-2" />
                    Personal Information
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    <div>
                      <label htmlFor="phone" className="block mb-1 text-gray-300 font-[Open Sans]">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g., +94 77 123 4567"
                      />
                    </div>
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
                      min="18"
                      max="100"
                    />
                  </div>
                </div>

                {/* Professional Information */}
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
                        placeholder="e.g., Engine Repair, Electrical Systems"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="experience" className="block mb-1 text-gray-300 font-[Open Sans]">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        min="0"
                        placeholder="e.g., 5"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block mb-1 text-gray-300 font-[Open Sans]">
                      Professional Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                      placeholder="Tell customers about your expertise and experience..."
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/technician-home")}
                  className="px-5 py-2 mr-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300 flex items-center"
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </motion.div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default EditProfile;