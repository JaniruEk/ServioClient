import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  PhoneIcon, 
  ClockIcon, 
  StarIcon,
  WrenchScrewdriverIcon, 
  PresentationChartLineIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  CalendarIcon
} from '@heroicons/react/24/solid';
import { collection, addDoc, doc, setDoc, getFirestore } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';
import OwnerSidebar from '../components/OwnerSidebar';

function ServiceCenterDetail({ user }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [serviceCenter, setServiceCenter] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  // Sample reviews data
  const sampleReviews = [
    {
      id: 1,
      userName: "John Smith",
      rating: 5,
      date: "2025-03-15",
      comment: "Exceptional service! My car was fixed quickly and they kept me updated throughout the entire process.",
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      id: 2,
      userName: "Sarah Johnson",
      rating: 4.5,
      date: "2025-03-10",
      comment: "Great service center with knowledgeable staff. Slightly expensive but worth it for the quality.",
      avatar: "https://i.pravatar.cc/150?img=2"
    },
    {
      id: 3,
      userName: "Michael Brown",
      rating: 4,
      date: "2025-02-28",
      comment: "They did a good job fixing my transmission issues. The waiting area was comfortable with good amenities.",
      avatar: "https://i.pravatar.cc/150?img=3"
    }
  ];

  // Sample available services data
  const availableServices = [
    {
      name: "Oil Change",
      price: "$49.99",
      duration: "30 mins",
      description: "Full synthetic oil change with filter replacement and fluid check."
    },
    {
      name: "Brake Service",
      price: "$150 - $300",
      duration: "1-2 hours",
      description: "Inspection, pad replacement, rotor resurfacing, and brake fluid flush."
    },
    {
      name: "Engine Diagnostics",
      price: "$89.99",
      duration: "45-60 mins",
      description: "Complete computer diagnostic of engine performance and issues."
    },
    {
      name: "Tire Rotation & Balance",
      price: "$75.00",
      duration: "45 mins",
      description: "Rotation, balancing, and pressure adjustment for all tires."
    },
    {
      name: "Air Conditioning Service",
      price: "$120.00",
      duration: "1-1.5 hours",
      description: "Inspection, refrigerant recharge, and system performance check."
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  useEffect(() => {
    // In a real application, you would fetch the service center data from an API
    // For now, we'll use the data passed via location state or mock data
    if (location.state?.serviceCenter) {
      setServiceCenter(location.state.serviceCenter);
      setIsLoading(false);
    } else {
      // Mock fetch data (in a real app, this would be an API call)
      setTimeout(() => {
        // Sample service centers data (same as in ServiceCenters.jsx)
        const serviceCenters = [
          {
            id: 1,
            name: 'Downtown Service Center',
            rating: 4.5,
            address: '123 Auto Lane, Car City, CA 90210',
            phone: '+1 (555) 123-4567',
            image: 'https://images.unsplash.com/photo-1577301403002-07f807025d12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
            specialties: ['Brake Service', 'Engine Repair', 'Transmission'],
            description: 'Our flagship service center with state-of-the-art diagnostic equipment and certified technicians specializing in both domestic and foreign vehicles. We offer comprehensive automotive services from routine maintenance to complex repairs.',
            hours: 'Mon-Sat: 8:00 AM - 6:00 PM',
            facilities: ['Free Wi-Fi', 'Waiting Lounge', 'Courtesy Vehicle'],
            images: [
              'https://images.unsplash.com/photo-1577301403002-07f807025d12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
              'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
              'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
            ],
            reviews: 128
          },
          {
            id: 2,
            name: 'Westside Auto Care',
            rating: 4.8,
            address: '456 Mechanic Ave, Car City, CA 90211',
            phone: '+1 (555) 123-4568',
            image: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
            specialties: ['Electric Vehicles', 'Hybrid Service', 'Diagnostics'],
            description: 'Specialized in modern vehicles including electric and hybrid models. Our technicians are factory-trained and certified to work with the latest automotive technologies and provide expert solutions for complex electrical issues.',
            hours: 'Mon-Fri: 7:00 AM - 7:00 PM, Sat: 8:00 AM - 5:00 PM',
            facilities: ['Free Wi-Fi', 'EV Charging', 'Kids Area', 'Coffee Bar'],
            images: [
              'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
              'https://images.unsplash.com/photo-1550039575-34131c9dc352?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
              'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
            ],
            reviews: 97
          },
          {
            id: 3,
            name: 'Elite Auto Service',
            rating: 4.7,
            address: '789 Service Road, Car City, CA 90212',
            phone: '+1 (555) 123-4569',
            image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
            specialties: ['Performance Tuning', 'Body Work', 'Custom Modifications'],
            description: 'Premium auto service specializing in high-performance vehicles, custom modifications, and precision body work. Our team includes specialists in automotive aesthetics and engineering for those looking to upgrade their ride.',
            hours: 'Mon-Fri: 9:00 AM - 6:00 PM, Sat: By Appointment',
            facilities: ['Premium Lounge', 'Vehicle Pickup', 'Virtual Consultations', 'Detailing Services'],
            images: [
              'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
              'https://images.unsplash.com/photo-1565689157206-0fddef7589a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
              'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
            ],
            reviews: 65
          },
        ];
        
        const foundCenter = serviceCenters.find(center => center.id === parseInt(id));
        if (foundCenter) {
          setServiceCenter(foundCenter);
        } else {
          navigate('/service-centers', { replace: true });
        }
        setIsLoading(false);
      }, 500);
    }
  }, [id, location.state, navigate]);

  // Stars rendering function
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-5 w-5 text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <StarIcon className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    return stars;
  };
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    serviceType: '',
    serviceDate: '',
    serviceTime: '',
    message: '',
  });

  const handleBookService = () => {
    setShowBookingForm(true);
    setActiveTab('booking');
  };
  
  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingFormData({ ...bookingFormData, [name]: value });
  };  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Get user information from the user prop
    const userId = user?.uid;
    
    if (!userId) {
      alert('You need to be logged in to make a booking.');
      return;
    }
    
    // Validate form data
    const validationErrors = [];
    
    if (!bookingFormData.name.trim()) validationErrors.push("Name is required");
    if (!bookingFormData.email.trim()) validationErrors.push("Email is required");
    else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingFormData.email.trim())) {
        validationErrors.push("Please enter a valid email address");
      }
    }
    if (!bookingFormData.contactNumber.trim()) validationErrors.push("Contact number is required");
    if (!bookingFormData.vehicleMake.trim()) validationErrors.push("Vehicle make is required");
    if (!bookingFormData.vehicleModel.trim()) validationErrors.push("Vehicle model is required");
    if (!bookingFormData.vehicleYear.trim()) validationErrors.push("Vehicle year is required");
    if (!bookingFormData.serviceType.trim()) validationErrors.push("Service type is required");
    if (!bookingFormData.serviceDate.trim()) validationErrors.push("Service date is required");
    if (!bookingFormData.serviceTime.trim()) validationErrors.push("Service time is required");
    
    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n${validationErrors.join("\n")}`);
      return;
    }
      // Prepare booking data
    const bookingData = {
      userId: userId,
      serviceCenterId: serviceCenter.id,
      serviceCenterName: serviceCenter.name,
      bookingDate: new Date().toISOString(),
      status: 'Pending',
      cost: 0, // Initial cost - can be updated later by the service center
      name: bookingFormData.name,
      email: bookingFormData.email,
      contactNumber: bookingFormData.contactNumber,
      vehicleMake: bookingFormData.vehicleMake,
      vehicleModel: bookingFormData.vehicleModel,
      vehicleYear: bookingFormData.vehicleYear,
      serviceType: bookingFormData.serviceType,
      serviceDate: bookingFormData.serviceDate,
      serviceTime: bookingFormData.serviceTime,
      message: bookingFormData.message,
      type: 'service-center',
      bookingType: 'service-center', // This is used to identify the booking type in OwnerHome
      createdAt: new Date().toISOString(), // Use ISO string instead of serverTimestamp()
      createdBy: userId
    };
      try {
      // First try to validate the connection to Firebase
      console.log('Attempting to connect to Firebase...');
        // Set just the basic fields needed for booking
      const basicBookingData = {
        userId: userId,
        serviceCenterId: serviceCenter.id,
        serviceCenterName: serviceCenter.name,
        name: bookingFormData.name,
        email: bookingFormData.email,
        contactNumber: bookingFormData.contactNumber,
        vehicleMake: bookingFormData.vehicleMake,
        vehicleModel: bookingFormData.vehicleModel,
        vehicleYear: bookingFormData.vehicleYear,
        serviceType: bookingFormData.serviceType,
        serviceDate: bookingFormData.serviceDate,
        serviceTime: bookingFormData.serviceTime,
        message: bookingFormData.message || "",
        status: 'Pending',
        cost: 0,
        bookingType: 'service-center',
        createdAt: new Date().toISOString()
      };
      
      // Save booking to "bookings" collection
      console.log('Saving to bookings collection...');
      const docRef = await addDoc(collection(db, "bookings"), basicBookingData);
      console.log('Booking submitted with ID:', docRef.id);
        
      // Also save to servicereservations collection for service center access
      console.log('Saving to servicereservations collection...');
      await addDoc(collection(db, "servicereservations"), {
        ...basicBookingData,
        bookingId: docRef.id // Reference to the main booking
      });
      
      console.log('Booking also saved to servicereservations');
      alert('Your booking has been submitted successfully!');
      
      // Reset form
      setBookingFormData({
        name: '',
        email: '',
        contactNumber: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        serviceType: '',
        serviceDate: '',
        serviceTime: '',
        message: '',
      });
      
      // Navigate back to overview tab
      setActiveTab('overview');    } catch (error) {
      console.error("Error in booking process:", error);
      let errorMessage = 'An error occurred while submitting your booking.';
      
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
            errorMessage = `Error: ${error.message || 'Unknown error'}`;
        }
      }
      
      alert(errorMessage);
      console.log('Full error details:', error);
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    // Here you would normally submit the review to an API
    alert('Thank you for your review! It will be published after moderation.');
    setReviewText('');
    setReviewRating(5);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-xl font-[Open Sans] text-gray-300">Loading service center details...</p>
        </div>
      </div>
    );
  }

  if (!serviceCenter) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans justify-center items-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-2 font-[Raleway]">Service Center Not Found</h2>
          <p className="text-gray-300 mb-6 font-[Open Sans]">
            Sorry, the service center you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/service-centers"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 font-[Open Sans]"
          >
            Back to Service Centers
          </Link>
        </div>
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
        {/* Using the OwnerSidebar component */}
        <OwnerSidebar activePath="/service-centers" />

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-4">
            <button 
              onClick={() => navigate('/service-centers')}
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              <span className="font-[Open Sans]">Back to Service Centers</span>
            </button>
          </div>

          {/* Header */}
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight mb-2">{serviceCenter.name}</h1>
                <div className="flex items-center mb-3">
                  {renderStars(serviceCenter.rating)}
                  <span className="ml-2 text-gray-300">({serviceCenter.rating})</span>
                  <span className="ml-2 text-gray-400 text-sm">({serviceCenter.reviews} reviews)</span>
                </div>
                <div className="flex items-start gap-2 mb-2 text-gray-300 font-[Open Sans]">
                  <MapPinIcon className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                  <span>{serviceCenter.address}</span>
                </div>
                <div className="flex items-center gap-2 mb-4 text-gray-300 font-[Open Sans]">
                  <PhoneIcon className="h-5 w-5 text-red-500" />
                  <span>{serviceCenter.phone}</span>
                </div>
              </div>
              <button
                onClick={handleBookService}
                className="mt-4 md:mt-0 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out transform font-[Raleway] font-bold"
              >
                Book Service
              </button>
            </div>
          </header>          {/* Navigation Tabs */}
          <div className="flex mb-6 border-b border-gray-700/50 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-[Raleway] ${
                activeTab === 'overview'
                  ? 'text-red-500 border-b-2 border-red-500 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 font-[Raleway] ${
                activeTab === 'services'
                  ? 'text-red-500 border-b-2 border-red-500 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Services
            </button>            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 font-[Raleway] ${
                activeTab === 'gallery'
                  ? 'text-red-500 border-b-2 border-red-500 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`px-4 py-2 font-[Raleway] ${
                activeTab === 'booking'
                  ? 'text-red-500 border-b-2 border-red-500 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Book Service
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 font-[Raleway] ${
                activeTab === 'reviews'
                  ? 'text-red-500 border-b-2 border-red-500 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Reviews
            </button>
          </div>

          {/* Content Sections */}
          {activeTab === 'overview' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Description */}
              <motion.section
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg"
              >
                <h2 className="text-xl font-bold mb-3 font-[Raleway]">About This Service Center</h2>
                <p className="text-gray-300 font-[Open Sans] leading-relaxed">{serviceCenter.description}</p>
              </motion.section>

              {/* Hours & Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.section
                  variants={itemVariants}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg"
                >
                  <div className="flex items-center mb-3">
                    <ClockIcon className="h-6 w-6 text-red-500 mr-2" />
                    <h2 className="text-xl font-bold font-[Raleway]">Working Hours</h2>
                  </div>
                  <p className="text-gray-300 font-[Open Sans]">{serviceCenter.hours}</p>
                </motion.section>

                <motion.section
                  variants={itemVariants}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg"
                >
                  <div className="flex items-center mb-3">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
                    <h2 className="text-xl font-bold font-[Raleway]">Facilities</h2>
                  </div>
                  <ul className="grid grid-cols-2 gap-2">
                    {serviceCenter.facilities.map((facility, index) => (
                      <li key={index} className="flex items-center text-gray-300 font-[Open Sans]">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {facility}
                      </li>
                    ))}
                  </ul>
                </motion.section>
              </div>

              {/* Specialties */}
              <motion.section
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center mb-3">
                  <PresentationChartLineIcon className="h-6 w-6 text-red-500 mr-2" />
                  <h2 className="text-xl font-bold font-[Raleway]">Our Specialties</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {serviceCenter.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-red-600/80 text-white rounded-full font-[Open Sans]"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.section
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg"
              >
                <h2 className="text-xl font-bold mb-6 font-[Raleway]">Available Services</h2>
                <div className="space-y-4">
                  {availableServices.map((service, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-700/50 rounded-lg hover:border-red-500 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                        <h3 className="text-lg font-semibold text-white font-[Raleway]">{service.name}</h3>
                        <div className="flex gap-4 mt-2 sm:mt-0">
                          <span className="text-sm bg-red-600/80 text-white px-2 py-1 rounded font-[Open Sans]">
                            {service.price}
                          </span>
                          <span className="text-sm bg-gray-700/80 text-white px-2 py-1 rounded font-[Open Sans]">
                            {service.duration}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 font-[Open Sans]">{service.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleBookService}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out transform font-[Raleway] font-bold"
                  >
                    Book A Service
                  </button>
                </div>
              </motion.section>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.section
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg"
              >
                <h2 className="text-xl font-bold mb-6 font-[Raleway]">Photo Gallery</h2>
                <div className="mb-6">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={serviceCenter.images[activeImageIndex]}
                      alt={`${serviceCenter.name} - Gallery image ${activeImageIndex + 1}`}
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {serviceCenter.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${serviceCenter.name} - Gallery thumbnail ${index + 1}`}
                        className={`w-full h-24 object-cover rounded-md cursor-pointer transition-all duration-300 ${
                          activeImageIndex === index ? 'border-2 border-red-500 opacity-100' : 'opacity-60 hover:opacity-100'
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </motion.section>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Reviews List */}
              <motion.section
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center mb-3">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-red-500 mr-2" />
                  <h2 className="text-xl font-bold font-[Raleway]">Customer Reviews</h2>
                </div>
                
                <div className="space-y-4 mb-8">
                  {sampleReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-700/50 pb-4">
                      <div className="flex items-center mb-2">
                        <img 
                          src={review.avatar} 
                          alt={review.userName}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-semibold text-white font-[Raleway]">{review.userName}</p>
                          <div className="flex items-center">
                            <div className="flex mr-2">{renderStars(review.rating)}</div>
                            <span className="text-gray-400 text-sm font-[Open Sans]">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 font-[Open Sans] pl-13">{review.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Write a Review Form */}
                <div className="border-t border-gray-700/50 pt-6">
                  <h3 className="text-lg font-semibold mb-4 font-[Raleway]">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block mb-2 text-gray-300 font-[Open Sans]">Your Rating:</label>
                      <div className="flex space-x-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewRating(rating)}
                            className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
                              reviewRating >= rating ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="reviewText" className="block mb-2 text-gray-300 font-[Open Sans]">Your Review:</label>
                      <textarea
                        id="reviewText"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors font-[Open Sans] resize-y"
                        rows={4}
                        placeholder="Share your experience with this service center..."
                        required
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 font-[Open Sans]"
                      >
                        Submit Review
                      </button>
                    </div>
                  </form>
                </div>
              </motion.section>
            </motion.div>
          )}

          {/* Booking Form Tab */}
          {activeTab === 'booking' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.section
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center mb-6">
                  <CalendarIcon className="h-6 w-6 text-red-500 mr-2" />
                  <h2 className="text-xl font-bold font-[Raleway]">Book Service at {serviceCenter.name}</h2>
                </div>
                
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold font-[Raleway] border-b border-gray-700/50 pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block mb-1 text-sm font-[Open Sans] text-gray-300">Your Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={bookingFormData.name}
                          onChange={handleBookingFormChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-red-500 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block mb-1 text-sm font-[Open Sans] text-gray-300">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={bookingFormData.email}
                          onChange={handleBookingFormChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-red-500 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="contactNumber" className="block mb-1 text-sm font-[Open Sans] text-gray-300">Contact Number</label>
                        <input
                          type="tel"
                          id="contactNumber"
                          name="contactNumber"
                          value={bookingFormData.contactNumber}
                          onChange={handleBookingFormChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-red-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Vehicle Information */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-lg font-semibold font-[Raleway] border-b border-gray-700/50 pb-2">Vehicle Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="vehicleMake" className="block mb-1 text-sm font-[Open Sans] text-gray-300">Vehicle Make</label>
                        <input
                          type="text"
                          id="vehicleMake"
                          name="vehicleMake"
                          value={bookingFormData.vehicleMake}
                          onChange={handleBookingFormChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-red-500 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="vehicleModel" className="block mb-1 text-sm font-[Open Sans] text-gray-300">Vehicle Model</label>
                        <input
                          type="text"
                          id="vehicleModel"
                          name="vehicleModel"
                          value={bookingFormData.vehicleModel}
                          onChange={handleBookingFormChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-red-500 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="vehicleYear" className="block mb-1 text-sm font-[Open Sans] text-gray-300">Vehicle Year</label>
                        <input
                          type="number"
                          id="vehicleYear"
                          name="vehicleYear"
                          value={bookingFormData.vehicleYear}
                          onChange={handleBookingFormChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-red-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Service Information */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-lg font-semibold font-[Raleway] border-b border-gray-700/50 pb-2">Service Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="serviceType" className="block mb-1 text-sm font-[Open Sans] text-gray-300">Service Type</label>
                        <select
                          id="serviceType"
                          name="serviceType"
                          value={bookingFormData.serviceType}
                          onChange={handleBookingFormChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-red-500 transition-colors"
                          required
                        >
                          <option value="">Select Service Type</option>
                          <option value="Regular Maintenance">Regular Maintenance</option>
                          <option value="Oil Change">Oil Change</option>
                          <option value="Brake Service">Brake Service</option>
                          <option value="Engine Repair">Engine Repair</option>
                          <option value="Transmission Service">Transmission Service</option>
                          <option value="Wheel Alignment">Wheel Alignment</option>
                          <option value="Battery Replacement">Battery Replacement</option>
                          <option value="Diagnostic Check">Diagnostic Check</option>
                          <option value="Air Conditioning">Air Conditioning</option>
                          <option value="Other">Other (Specify in Message)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="serviceDate" className="block mb-1 text-sm font-[Open Sans] text-gray-300">Preferred Date</label>
                        <input
                          type="date"
                          id="serviceDate"
                          name="serviceDate"
                          value={bookingFormData.serviceDate}
                          onChange={handleBookingFormChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-red-500 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="serviceTime" className="block mb-1 text-sm font-[Open Sans] text-gray-300">Preferred Time</label>
                        <select
                          id="serviceTime"
                          name="serviceTime"
                          value={bookingFormData.serviceTime}
                          onChange={handleBookingFormChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-red-500 transition-colors"
                          required
                        >
                          <option value="">Select Time</option>
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="12:00 PM">12:00 PM</option>
                          <option value="01:00 PM">01:00 PM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="03:00 PM">03:00 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Information */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-lg font-semibold font-[Raleway] border-b border-gray-700/50 pb-2">Additional Information</h3>
                    <div>
                      <label htmlFor="message" className="block mb-1 text-sm font-[Open Sans] text-gray-300">Message (Optional)</label>
                      <textarea
                        id="message"
                        name="message"
                        value={bookingFormData.message}
                        onChange={handleBookingFormChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-red-500 transition-colors resize-y"
                        rows={4}
                        placeholder="Describe any specific issues with your vehicle or special requests..."
                      />
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-[Raleway] font-bold"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </motion.section>
            </motion.div>
          )}
        </main>
      </div>

      {/* Footer - Full Width */}
      <Footer />
    </div>
  );
}

export default ServiceCenterDetail;