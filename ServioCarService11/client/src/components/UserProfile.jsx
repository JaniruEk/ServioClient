import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

// Icons for different profile sections
import { 
  UserIcon, 
  TruckIcon, 
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  IdentificationIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";

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
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

const UserProfile = ({ user, userData, loading }) => {
  const navigate = useNavigate();
  
  // Add a handler to navigate directly to edit profile page
  const handleProfileClick = () => {
    navigate("/edit-profile");
  };
  
  if (loading) {
    return (
      <svg
        className="animate-spin h-8 w-8 text-red-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );
  }

  // Welcome section for all user types
  const welcomeSection = (
    <motion.p
      variants={itemVariants}
      className="text-lg font-medium text-red-500 bg-red-100/20 p-3 rounded-md shadow-sm font-[Open Sans]"
    >
      Welcome, {user.email}!
    </motion.p>
  );
  
  // Conditional rendering based on user category
  const renderUserSpecificProfile = () => {
    if (!userData) {
      return (
        <motion.p variants={itemVariants} className="text-red-400 font-[Open Sans]">
          No profile data found.
        </motion.p>
      );
    }

    switch(userData.category) {
      case "owner":
        return renderOwnerProfile();
      case "technician":
        return renderTechnicianProfile();
      case "service-center":
        return renderServiceCenterProfile();
      default:
        return renderDefaultProfile();
    }
  };

  const renderDefaultProfile = () => (
    <motion.div
      variants={itemVariants}
      className="w-full bg-gray-800 p-4 rounded-lg shadow-inner border border-gray-700/50 cursor-pointer"
      onClick={handleProfileClick} // Add click handler to navigate to edit profile
    >
      <h3 className="text-xl font-semibold text-white mb-4 text-center font-[Poppins]">
        Your Profile
      </h3>
      <div className="text-gray-300 space-y-2 font-[Open Sans]">
        <p>
          <span className="font-medium text-white">User ID:</span> {userData.userId}
        </p>
        <p>
          <span className="font-medium text-white">Category:</span> {userData.category}
        </p>
        <p>
          <span className="font-medium text-white">Name:</span> {userData.name}
        </p>
      </div>
    </motion.div>
  );

  const renderOwnerProfile = () => (
    <motion.div
      variants={itemVariants}
      className="w-full bg-gray-800 p-6 rounded-lg shadow-inner border border-gray-700/50 cursor-pointer hover:border-red-500 transition-all duration-300"
      onClick={handleProfileClick} // Add click handler to navigate to edit profile
    >
      <h3 className="text-xl font-semibold text-white mb-4 text-center font-[Poppins] border-b border-gray-700 pb-2">
        Owner Profile
      </h3>

      {/* Personal Information */}
      <div className="mb-5">
        <h4 className="text-md font-semibold text-red-400 mb-3 flex items-center font-[Raleway]">
          <UserIcon className="h-5 w-5 mr-2" />
          Personal Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-300 font-[Open Sans]">
          <div>
            <p className="text-sm text-gray-400">Name</p>
            <p className="font-medium">{userData.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="font-medium">{userData.email}</p>
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="bg-gray-700/30 p-4 rounded-md mb-5">
        <h4 className="text-md font-semibold text-red-400 mb-3 flex items-center font-[Raleway]">
          <TruckIcon className="h-5 w-5 mr-2" />
          Vehicle Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-300 font-[Open Sans]">
          <div>
            <p className="text-sm text-gray-400">Car Make</p>
            <p className="font-medium">{userData.carMake || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Car Model</p>
            <p className="font-medium">{userData.carModel || "Not specified"}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-400">License Plate</p>
            <p className="font-medium">{userData.numberPlate || "Not specified"}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-400">VIN Number</p>
            <p className="font-medium">{userData.vinNumber || "Not specified"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderTechnicianProfile = () => (
    <motion.div
      variants={itemVariants}
      className="w-full bg-gray-800 p-6 rounded-lg shadow-inner border border-gray-700/50 cursor-pointer hover:border-red-500 transition-all duration-300"
      onClick={handleProfileClick} // Add click handler to navigate to edit profile
    >
      <h3 className="text-xl font-semibold text-white mb-4 text-center font-[Poppins] border-b border-gray-700 pb-2">
        Technician Profile
      </h3>

      {/* Personal Information */}
      <div className="mb-5">
        <h4 className="text-md font-semibold text-red-400 mb-3 flex items-center font-[Raleway]">
          <UserIcon className="h-5 w-5 mr-2" />
          Personal Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-300 font-[Open Sans]">
          <div>
            <p className="text-sm text-gray-400">Name</p>
            <p className="font-medium">{userData.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="font-medium">{userData.email}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-400">Age</p>
            <p className="font-medium">{userData.age || "Not specified"}</p>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-gray-700/30 p-4 rounded-md mb-5">
        <h4 className="text-md font-semibold text-red-400 mb-3 flex items-center font-[Raleway]">
          <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
          Professional Information
        </h4>
        <div className="grid grid-cols-1 gap-y-2 text-gray-300 font-[Open Sans]">
          <div>
            <p className="text-sm text-gray-400">Specialization</p>
            <p className="font-medium">{userData.specialization || "Not specified"}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-400">Experience</p>
            <p className="font-medium">{userData.experience || "Not specified"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderServiceCenterProfile = () => (
    <motion.div
      variants={itemVariants}
      className="w-full bg-gray-800 p-6 rounded-lg shadow-inner border border-gray-700/50 cursor-pointer hover:border-red-500 transition-all duration-300"
      onClick={handleProfileClick} // Add click handler to navigate to edit profile
    >
      <h3 className="text-xl font-semibold text-white mb-4 text-center font-[Poppins] border-b border-gray-700 pb-2">
        Service Center Profile
      </h3>

      {/* Business Information */}
      <div className="mb-5">
        <h4 className="text-md font-semibold text-red-400 mb-3 flex items-center font-[Raleway]">
          <BuildingOfficeIcon className="h-5 w-5 mr-2" />
          Business Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-300 font-[Open Sans]">
          <div>
            <p className="text-sm text-gray-400">Business Name</p>
            <p className="font-medium">{userData.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="font-medium">{userData.email}</p>
          </div>
        </div>
      </div>

      {/* Certification & Address */}
      <div className="bg-gray-700/30 p-4 rounded-md mb-5">
        <h4 className="text-md font-semibold text-red-400 mb-3 flex items-center font-[Raleway]">
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Certification & Location
        </h4>
        <div className="grid grid-cols-1 gap-y-2 text-gray-300 font-[Open Sans]">
          <div>
            <p className="text-sm text-gray-400">Certification</p>
            <p className="font-medium">{userData.certification || "Not specified"}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-400">Business Address</p>
            <p className="font-medium">{userData.address || "Not specified"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-6"
    >
      {welcomeSection}
      {renderUserSpecificProfile()}
      
      {/* Edit Profile Button */}
      {userData && (
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleProfileClick}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform"
        >
          Edit Profile
        </motion.button>
      )}
      
      {/* Logout Button */}
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => auth.signOut()}
        className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform"
      >
        Logout
      </motion.button>
    </motion.div>
  );
};

export default UserProfile;