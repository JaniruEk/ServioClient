// src/App.jsx
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { motion } from "framer-motion";

// Login
import Login from "./pages/Login";
import CategorySelection from "./pages/CategorySelection";
import OwnerSignUp from "./pages/OwnerSignUp";
import TechnicianSignUp from "./pages/TechnicianSignUp";
import ServiceCenterSignUp from "./pages/ServiceCenterSignup";
import UserEditProfile from "./pages/EditProfile";

// Guest
import GuestHome from "./pages/GuestHome";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";

// Payment System
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";

// Admin
import AdminDashboard from "./admin/AdminDashboard";
import ManageUsers from "./admin/ManageUsers";
import AllReservations from "./admin/AllReservations";
import AdminReports from "./admin/Reports";
import AdminLogin from "./admin/AdminLogin";
import AdminEditProfile from "./admin/AdminEditProfile";

// Owner
import OwnerHome from "./pages/OwnerHome";
import ContactTechnician from "./pages/contactTechnician";
import BookServiceCenter from "./pages/BookServiceCenter";
import Technicians from "./pages/Technicians";
import TechnicianDetail from "./pages/TechnicianDetail";
import ServiceCenters from './pages/ServiceCenters';
import ServiceCenterDetail from './pages/ServiceCenterDetail';

// Technician
import TechnicianDashboard from "./Technician/TechnicianDashboard";
import VehiclePartsRequest from "./Technician/VehiclePartsRequest";
import ViewDetails from "./Technician/ViewDetails";
import TechnicianJobList from "./Technician/TechnicianJobList";
import TechnicianEditProfile from "./Technician/EditProfile";
import ServiceHistory from "./Technician/ServiceHistory";

// Service Center
import ServiceCenterDashboard from "./ServiceCenetrs/ServiceCenterDashboard";
import JobList from "./ServiceCenetrs/JobList";
import ServiceCenterPendingJob from "./ServiceCenetrs/PendingJob";
import SparePartsInventory from "./ServiceCenetrs/SparePartsInventory";
import ReportAndAnalyse from "./ServiceCenetrs/Report&Analyse";
import ServiceCenterEditProfile from "./ServiceCenetrs/EditProfile";
import ProfileTester from "./ServiceCenetrs/ProfileTester";

// Components
import UserProfile from "./components/UserProfile";
import ChatWidget from "./components/ChatWidget";

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            console.log("User data fetched:", userDoc.data());
          } else {
            console.log("No user data found in Firestore");
            setUserData(null);
          }
          setUser(currentUser);
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Animation Variants (from AboutUs/AdminDashboard)
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

  const AuthLayout = ({ children }) => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gray-900 p-4 bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>
      <motion.div
        variants={itemVariants}
        className="relative w-full max-w-md p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50"
      >
        {children}
      </motion.div>
    </motion.div>
  );

  // Protected Route Component to restrict access based on user category
  const ProtectedRoute = ({ children, allowedCategories }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
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
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" />;
    }    // Add additional check for admin routes to ensure proper access
    if (!userData || !allowedCategories.includes(userData.category)) {
      console.log('Access denied: User category does not match required categories', {
        userCategory: userData?.category,
        requiredCategories: allowedCategories
      });
      
      // For admin routes, redirect to admin login
      if (allowedCategories.includes("admin")) {
        return <Navigate to="/admin-login" />;
      }
      
      // For other routes, redirect to home
      return <Navigate to="/" />;
    }

    return children;
  };

  // Redirect to the appropriate dashboard based on user category
  const DashboardRedirect = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
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
        </div>
      );
    }

    if (!user) {
      return <GuestHome user={user} />;
    }

    if (!userData) {
      return <AuthLayout><UserProfile user={user} userData={userData} loading={loading} /></AuthLayout>;
    }

    switch (userData.category) {
      case "owner":
        return <Navigate to="/owner-home" />;
      case "technician":
        return <Navigate to="/technician-home" />;
      case "service-center":
        return <Navigate to="/service-center-home" />;
      case "admin":
        return <Navigate to="/admin-dashboard" />;
      default:
        return <AuthLayout><UserProfile user={user} userData={userData} loading={loading} /></AuthLayout>;
    }
  };

  return (
    <Router>
      <Routes>
        {/* Root Route: Redirect to appropriate dashboard or show GuestHome */}
        <Route path="/" element={<DashboardRedirect />} />

        {/* Login and Signup Routes */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <AuthLayout><Login /></AuthLayout>} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <AuthLayout><CategorySelection /></AuthLayout>} />
        <Route path="/signup/owner" element={user ? <Navigate to="/" /> : <AuthLayout><OwnerSignUp /></AuthLayout>} />
        <Route path="/signup/technician" element={user ? <Navigate to="/" /> : <AuthLayout><TechnicianSignUp /></AuthLayout>} />
        <Route path="/signup/service-center" element={user ? <Navigate to="/" /> : <AuthLayout><ServiceCenterSignUp /></AuthLayout>} />

        {/* Guest Routes */}
        <Route path="/book-service" element={<div>Book Service Page (TBD)</div>} />
        <Route path="/contact" element={<Contact user={user} />} />
        <Route path="/about-us" element={<AboutUs user={user} />} />
        <Route path="/profile" element={user ? <AuthLayout><UserProfile user={user} userData={userData} loading={loading} /></AuthLayout> : <Navigate to="/login" />} />
        <Route path="/edit-profile" element={<UserEditProfile />} />

        {/* Payment System Routes */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedCategories={["admin"]}>
              <AdminDashboard user={user} />
            </ProtectedRoute>
          }        />
        <Route
          path="/admin-reports"
          element={
            <ProtectedRoute allowedCategories={["admin"]}>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-users"
          element={
            <ProtectedRoute allowedCategories={["admin"]}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />        <Route
          path="/admin-edit-profile"
          element={
            <ProtectedRoute allowedCategories={["admin"]}>
              <AdminEditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-reservations"
          element={
            <ProtectedRoute allowedCategories={["admin"]}>
              <AllReservations />
            </ProtectedRoute>
          }
        />        {/* Technician Routes */}
        <Route
          path="/technician-home"
          element={
            <ProtectedRoute allowedCategories={["technician"]}>
              <TechnicianDashboard user={user} />
            </ProtectedRoute>
          }
        />        {/* Update status functionality is now handled directly in the job list */}
        <Route
          path="/parts-request"
          element={
            <ProtectedRoute allowedCategories={["technician"]}>
              <VehiclePartsRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-list"
          element={
            <ProtectedRoute allowedCategories={["technician"]}>
              <TechnicianJobList />
            </ProtectedRoute>
          }
        />        {/* Removed pending job route as this functionality is no longer needed */}
        <Route
          path="/view-details/:id"
          element={
            <ProtectedRoute allowedCategories={["technician"]}>
              <ViewDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/edit-profile"
          element={
            <ProtectedRoute allowedCategories={["technician"]}>
              <TechnicianEditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/service-history"
          element={
            <ProtectedRoute allowedCategories={["technician"]}>
              <ServiceHistory />
            </ProtectedRoute>
          }
        />

        {/* Owner Routes */}
        <Route
          path="/owner-home"
          element={
            <ProtectedRoute allowedCategories={["owner"]}>
              <OwnerHome user={user} />
            </ProtectedRoute>
          }
        />        <Route
          path="/contact-technician"
          element={
            <ProtectedRoute allowedCategories={["owner"]}>
              <Navigate to="/technicians" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact-technician/:id"
          element={
            <ProtectedRoute allowedCategories={["owner"]}>
              <ContactTechnician />
            </ProtectedRoute>
          }
        /><Route
          path="/book-service-center"
          element={
            <ProtectedRoute allowedCategories={["owner"]}>
              <BookServiceCenter />
            </ProtectedRoute>
          }
        />        <Route
          path="/technicians"
          element={
            <ProtectedRoute allowedCategories={["owner"]}>
              <Technicians user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/:id"
          element={
            <ProtectedRoute allowedCategories={["owner"]}>
              <TechnicianDetail user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/service-centers"
          element={
            <ProtectedRoute allowedCategories={["owner"]}>
              <ServiceCenters user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/service-center/:id"
          element={
            <ProtectedRoute allowedCategories={["owner"]}>
              <ServiceCenterDetail user={user} />
            </ProtectedRoute>
          }
        />

        {/* Service Center Routes */}
        <Route
          path="/service-center-home"
          element={
            <ProtectedRoute allowedCategories={["service-center"]}>
              <ServiceCenterDashboard />
            </ProtectedRoute>
          }
        />        <Route
          path="/pending-jobs"
          element={
            <ProtectedRoute allowedCategories={["service-center"]}>
              <ServiceCenterPendingJob />
            </ProtectedRoute>
          }
        />        <Route
          path="/service-center/job-list"
          element={
            <ProtectedRoute allowedCategories={["service-center"]}>
              <JobList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spare-parts-inventory"
          element={
            <ProtectedRoute allowedCategories={["service-center"]}>
              <SparePartsInventory />
            </ProtectedRoute>
          }
        />        <Route
          path="/report-and-analyse"
          element={
            <ProtectedRoute allowedCategories={["service-center"]}>
              <ReportAndAnalyse />
            </ProtectedRoute>
          }
        />        <Route
          path="/service-center/edit-profile"
          element={
            <ProtectedRoute allowedCategories={["service-center"]}>
              <ServiceCenterEditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/service-center/profile-tester"
          element={
            <ProtectedRoute allowedCategories={["service-center"]}>
              <ProfileTester />
            </ProtectedRoute>
          }
        />
      </Routes>
      
      {/* Chat Widget - Only shown when user is logged in */}
      <ChatWidget isAuthenticated={!!user} />
    </Router>
  );
}

export default App;