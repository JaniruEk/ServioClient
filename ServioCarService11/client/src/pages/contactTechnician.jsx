import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Bars3Icon, UserIcon } from '@heroicons/react/24/solid';
import Footer from '../components/Footer';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import OwnerSidebar from '../components/OwnerSidebar';

function ContactTechnician({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const technicianFromState = location.state?.technician;
  const [technician, setTechnician] = useState(technicianFromState || null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    message: '',
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile sidebar toggle
    // If technician wasn't passed through location state, fetch it from Firebase
  useEffect(() => {
    if (!technicianFromState && id) {
      const fetchTechnicianData = async () => {
        try {
          console.log(`Fetching data for technician ID: ${id}`);
          
          // Get the technician document from Firestore
          const technicianDocRef = doc(db, "users", id);
          const technicianDocSnapshot = await getDoc(technicianDocRef);
          
          if (technicianDocSnapshot.exists()) {
            const techData = technicianDocSnapshot.data();
            
            // Transform Firebase data to match the frontend structure
            const technicianData = {
              id: id,
              name: techData.name || 'Unknown Technician',
              title: techData.specialization || 'Automotive Technician',
              specialties: techData.skills ? techData.skills : 
                          (techData.specialization ? [techData.specialization] : ['General Maintenance']),
              email: techData.email,
              contactNumber: techData.contactNumber
            };
            
            setTechnician(technicianData);
          } else {
            console.error('Technician not found in Firebase');            console.log('No technician found with ID:', id);
            // Set fallback data if technician not found in database
            const fallbackTechnician = {
              id: id,
              name: 'Technician',
              title: 'Automotive Specialist',
              specialties: ['General Maintenance'],
            };
            setTechnician(fallbackTechnician);
          }
        } catch (error) {
          console.error('Error fetching technician data:', error);
        }
      };
      
      fetchTechnicianData();
    }
  }, [id, technicianFromState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = [];
    
    if (!formData.name.trim()) validationErrors.push("Name is required");
    if (!formData.email.trim()) validationErrors.push("Email is required");
    else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        validationErrors.push("Please enter a valid email address");
      }
    }
    if (!formData.contactNumber.trim()) validationErrors.push("Contact number is required");
    if (!formData.address.trim()) validationErrors.push("Address is required");
    if (!formData.vehicleMake.trim()) validationErrors.push("Vehicle make is required");
    if (!formData.vehicleModel.trim()) validationErrors.push("Vehicle model is required");
    if (!formData.vehicleYear.trim()) validationErrors.push("Vehicle year is required");
    
    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n${validationErrors.join("\n")}`);
      return;
    }
    
    try {      // Prepare booking data with consistent status casing
      const bookingData = {
        ...formData,
        technicianId: id,
        technicianName: technician?.name,
        status: 'Pending', // Changed to capital P for consistency
        createdAt: new Date().toISOString(), // Use ISO string for date
        userId: user?.uid || 'guest',
        userEmail: user?.email || formData.email
      };
      
      console.log('Submitting booking data:', bookingData);
      console.log('Attempting to connect to Firebase...');
        // Add the booking to Firebase main bookings collection
      console.log('Saving to bookings collection...');      // Create basic booking object with only the necessary fields
      const basicBookingData = {
        name: formData.name,
        email: formData.email,
        contactNumber: formData.contactNumber,
        address: formData.address,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear,
        message: formData.message || "",
        technicianId: id,
        technicianName: technician?.name || "",
        status: 'Pending', // Changed to capital P for consistency
        createdAt: new Date().toISOString(),
        userId: user?.uid || 'guest',
        userEmail: user?.email || formData.email,
        bookingType: 'technician' // Ensures correct identification of technician bookings
      };
      
      const bookingsCollectionRef = collection(db, "bookings");
      const newBookingRef = await addDoc(bookingsCollectionRef, basicBookingData);
      
      console.log('Booking created with ID:', newBookingRef.id);
        // Also save to technicianreservations collection for technician access
      console.log('Saving to technicianreservations collection...');
      const technicianReservationsRef = collection(db, "technicianreservations");
      await addDoc(technicianReservationsRef, {
        ...basicBookingData,
        bookingId: newBookingRef.id, // Reference to the main booking
        serviceDate: new Date().toISOString().split('T')[0], // Add service date for consistency with service center bookings
        serviceTime: new Date().toLocaleTimeString() // Add service time for consistency
      });
      
      console.log('Booking also saved to technicianreservations');
      alert('Your booking request has been sent to the technician!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        contactNumber: '',
        address: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        message: '',
      });    } catch (error) {
      console.error('Error creating booking:', error);
      
      let errorMessage = 'There was an error submitting your booking.';
      
      // Provide more specific error messages based on the type of error
      if (error.code) {
        switch (error.code) {
          case 'permission-denied':
            errorMessage = 'Permission denied. You may not have the required access rights.';
            break;
          case 'unavailable':
            errorMessage = 'The service is currently unavailable. Please check your internet connection and try again.';
            break;
          case 'not-found':
            errorMessage = 'The requested resource was not found. Please check your configuration.';
            break;
          case 'invalid-argument':
            errorMessage = 'Some of the data you entered is invalid. Please check your inputs and try again.';
            break;
          default:
            errorMessage = `Error: ${error.message || 'Unknown error. Please try again later.'}`;
        }
      }
      
      alert(errorMessage);
      console.log('Full error details:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

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
        {/* OwnerSidebar Component */}
        <OwnerSidebar 
          activePath="/technicians"
        />

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
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">
                {technician ? `Contact ${technician.name}` : 'Contact a Technician'}
              </h1>
            </div>
          </header>

          {technician && (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg mb-6 shadow-lg flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center justify-center bg-gray-700 rounded-full p-4">
                <UserIcon className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white font-[Raleway]">
                  {technician.name}
                </h2>
                <p className="text-red-400 text-sm">{technician.title}</p>
                {technician.specialties && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {technician.specialties.map((specialty, index) => (
                      <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <h2 className="text-2xl font-semibold text-white mb-4 font-[Raleway] text-center">
            Get in Touch
          </h2>
          <p className="text-gray-300 mb-6 font-[Open Sans] text-center">
            Fill out the form below with your details and vehicle information
            {technician ? ` to send a message to ${technician.name}.` : ' to contact one of our technicians.'} 
            We'll get back to you as soon as possible!
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Two Boxes Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Details Box */}
              <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 font-[Raleway] border-b border-gray-500 pb-2">Customer Details</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block mb-1 text-gray-300 font-[Open Sans]">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-1 text-gray-300 font-[Open Sans]">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., john.doe@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactNumber" className="block mb-1 text-gray-300 font-[Open Sans]">Contact Number</label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., +1 123-456-7890"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block mb-1 text-gray-300 font-[Open Sans]">Customer Address</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                      rows="3"
                      placeholder="e.g., 123 Main St, City, State, ZIP"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Vehicle Details Box */}
              <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 font-[Raleway] border-b border-gray-500 pb-2">Vehicle Details</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="vehicleMake" className="block mb-1 text-gray-300 font-[Open Sans]">Vehicle Make</label>
                    <input
                      type="text"
                      id="vehicleMake"
                      name="vehicleMake"
                      value={formData.vehicleMake}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Toyota"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicleModel" className="block mb-1 text-gray-300 font-[Open Sans]">Vehicle Model</label>
                    <input
                      type="text"
                      id="vehicleModel"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Camry"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicleYear" className="block mb-1 text-gray-300 font-[Open Sans]">Vehicle Year</label>
                    <input
                      type="number"
                      id="vehicleYear"
                      name="vehicleYear"
                      value={formData.vehicleYear}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., 2020"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Message Box */}
            <section className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-gray-700/50">
              <div className="space-y-4">
                <div>
                  <label htmlFor="message" className="block mb-1 text-gray-300 font-[Open Sans]">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                    rows="4"
                    placeholder={technician 
                      ? `Hi ${technician.name}, I'd like to inquire about your services for my vehicle...` 
                      : "Type your message here..."}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out transform"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </section>
          </form>
        </main>
      </div>

      {/* Footer - Full Width */}
      <Footer />
    </div>
  );
}

export default ContactTechnician;