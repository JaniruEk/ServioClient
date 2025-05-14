import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  WrenchIcon, 
  WrenchScrewdriverIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/solid';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';
import Header from '../components/Header';

const TechnicianDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [technician, setTechnician] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsToShow, setReviewsToShow] = useState(4);
  
  // Reviews pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };
  
  // Get the technician's data from Firebase
  useEffect(() => {
    const fetchTechnicianData = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching data for technician ID: ${id}`);
        
        // Get the technician document from Firestore
        const technicianDocRef = doc(db, "users", id);
        const technicianDocSnapshot = await getDoc(technicianDocRef);
        
        if (technicianDocSnapshot.exists()) {
          const techData = technicianDocSnapshot.data();
          console.log("Fetched technician data:", techData);
          
          // Transform Firebase data to match the frontend structure
          const technicianData = {
            id: id,
            name: techData.name || 'Unknown Technician',
            title: techData.specialization || 'Automotive Technician',
            rating: techData.averageRating || 4.5,
            numReviews: techData.reviews ? techData.reviews.length : 0,
            phone: techData.contactNumber || 'Not Available',
            email: techData.email || 'Not Available',
            location: techData.location || 'Not Available',
            distance: techData.distance || '5 miles away',
            hourlyRate: techData.hourlyRate || '$50-$80',
            image: techData.profileImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',        description: techData.bio || 'With over 10 years of experience in automotive repair and maintenance, I specialize in diagnosing and repairing complex electrical issues, engine problems, and computer systems in modern vehicles.',
        specialties: techData.skills ? 
                    (Array.isArray(techData.skills) ? techData.skills : [techData.skills]) 
                    : (techData.specialization ? [techData.specialization] : ['Engine Repair', 'Electrical Systems', 'Diagnostics']),
        certifications: techData.certifications || [
          {
            name: 'ASE Master Technician',
            issuer: 'National Institute for Automotive Service Excellence',
            year: 2018,
          },
          {
            name: 'BMW Certified Technician',
            issuer: 'BMW Training Academy',
            year: 2019,
          },
          {
            name: 'Toyota Expert Technician',
            issuer: 'Toyota Technical Education Network',
            year: 2020,
          },
        ],        experience: techData.experience || [
          {
            role: 'Lead Technician',
            company: 'AutoExpert Service Center',
            period: '2019 - Present',
            description: 'Diagnose and repair complex vehicle issues, manage a team of 5 technicians, and handle customer consultations for high-value repairs.'
          },
          {
            role: 'Senior Automotive Technician',
            company: 'Precision Auto Repair',
            period: '2015 - 2019',
            description: 'Specialized in electrical diagnostics and engine performance issues across multiple vehicle makes and models.'
          },
          {
            role: 'Automotive Technician',
            company: 'Citywide Auto Service',
            period: '2012 - 2015',
            description: 'Performed maintenance services, brake repairs, and basic engine work under supervision.'
          },
        ],        skills: techData.skillLevels || [
          { name: 'Diagnostic Expertise', level: 95 },
          { name: 'Engine Repair', level: 90 },
          { name: 'Electrical Systems', level: 95 },
          { name: 'Brake Systems', level: 85 },
          { name: 'Suspension & Steering', level: 80 },
          { name: 'Computer Systems', level: 90 },
          { name: 'Hybrid/EV Repair', level: 75 },
        ],
        services: techData.services || [
          'Complete Engine Diagnostics',
          'Check Engine Light Analysis',
          'Electrical System Repair',
          'Engine Repair & Replacement',
          'Brake System Service',
          'Suspension & Steering Repair',
          'Transmission Diagnostics',
          'Hybrid Vehicle Service',
          'Pre-Purchase Inspections',
          'Performance Tuning',
        ],
        galleries: techData.portfolioImages || [
          'https://images.unsplash.com/photo-1493238792000-8113da705763?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
          'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
          'https://images.unsplash.com/photo-1562510953-d292f430a328?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
          'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        ],
        reviews: techData.reviews || [
          {
            id: 1,
            name: 'John D.',
            rating: 5,
            date: '2023-03-15',
            comment: 'Alex diagnosed a complex electrical issue in my BMW that two other shops couldn\'t figure out. Fixed it quickly and for a fair price. Extremely knowledgeable and professional.',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          },
          {
            id: 2,
            name: 'Sarah M.',
            rating: 5,
            date: '2023-02-21',
            comment: 'I was having intermittent starting issues with my car for months. Alex found the problem in minutes and had it repaired the same day. Excellent service!',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          },
          {
            id: 3,
            name: 'Michael T.',
            rating: 4,
            date: '2023-01-05',
            comment: 'Very thorough and knowledgeable. Explained everything clearly and didn\'t try to upsell unnecessary services like other places do.',
            avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
          },
          {
            id: 4,
            name: 'Emily K.',
            rating: 5,
            date: '2022-12-18',
            comment: 'Alex provided excellent diagnostic service for my Tesla. He\'s one of the few technicians I\'ve found who really understands both traditional and electric vehicles.',
            avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
          },
          {
            id: 5,
            name: 'Robert P.',
            rating: 5,
            date: '2022-11-30',
            comment: 'Above and beyond service. My check engine light came on while I was traveling, and Alex made time to see me that same day. Highly recommend!',
            avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
          },
          {
            id: 6,
            name: 'Jennifer L.',
            rating: 4,
            date: '2022-10-12',
            comment: 'Fixed a persistent brake issue that another shop couldn\'t resolve. Fair pricing and excellent communication throughout the process.',
            avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
          },
          {
            id: 7,
            name: 'David W.',
            rating: 5,
            date: '2022-09-05',
            comment: 'I\'ve been bringing all my vehicles to Alex for the past two years. His attention to detail and technical knowledge are unmatched.',
            avatar: 'https://randomuser.me/api/portraits/men/77.jpg',
          },
        ],        availability: techData.availability || [
          { day: 'Monday', hours: '8:00 AM - 6:00 PM' },
          { day: 'Tuesday', hours: '8:00 AM - 6:00 PM' },
          { day: 'Wednesday', hours: '8:00 AM - 6:00 PM' },
          { day: 'Thursday', hours: '8:00 AM - 6:00 PM' },
          { day: 'Friday', hours: '8:00 AM - 5:00 PM' },
          { day: 'Saturday', hours: '9:00 AM - 2:00 PM' },
          { day: 'Sunday', hours: 'Closed' },
        ],
      };
      
      setTechnician(technicianData);
      console.log("Technician data processed:", technicianData);
    } else {
      console.error('Technician document does not exist');
    }
    } catch (error) {
      console.error('Error fetching technician data:', error);    } finally {
      setIsLoading(false);
    }
  };
  
  fetchTechnicianData();
  }, [id]);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleContactClick = () => {
    console.log('Navigating to contact page with technician:', technician);
    navigate(`/contact-technician/${id}`, { state: { technician } });
  };

  const calculateRatingPercentage = (reviews) => {
    const totalReviews = reviews.length;
    if (totalReviews === 0) return [0, 0, 0, 0, 0];
    
    const ratings = [0, 0, 0, 0, 0]; // 5 star, 4 star, 3 star, 2 star, 1 star
    
    reviews.forEach(review => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratings[5 - rating]++;
      }
    });
    
    return ratings.map(count => (count / totalReviews) * 100);
  };

  // Pagination for reviews
  const indexOfLastReview = currentPage * itemsPerPage;
  const indexOfFirstReview = indexOfLastReview - itemsPerPage;
  const currentReviews = technician?.reviews?.slice(indexOfFirstReview, indexOfLastReview) || [];
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => prev + 1);
  const prevPage = () => setCurrentPage(prev => prev - 1);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <Header user={user} />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-300">Loading technician data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header user={user} />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation breadcrumbs */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <Link to="/technicians" className="ml-1 text-sm font-medium text-gray-400 hover:text-white md:ml-2">Technicians</Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-300 md:ml-2">{technician?.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        {/* Technician Header */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden shadow-xl mb-8">
          <div className="relative h-64 sm:h-80">
            {/* Background image */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90">
              <img 
                src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80" 
                alt="Technician Workshop" 
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            
            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                {/* Profile image */}
                <div className="relative">
                  <img 
                    src={technician?.image} 
                    alt={technician?.name}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-red-500"
                  />
                  <div className="absolute bottom-0 right-0 bg-red-600 rounded-full p-2">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                {/* Technician info */}
                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1">{technician?.name}</h1>
                  <p className="text-red-500 font-medium mb-2">{technician?.title}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1 mb-3">
                    {technician?.specialties.slice(0, 3).map((specialty, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {technician?.specialties.length > 3 && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                        +{technician.specialties.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center sm:items-start text-sm">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className={`h-4 w-4 ${i < Math.floor(technician?.rating) ? 'text-yellow-400' : 'text-gray-600'}`} />
                        ))}
                      </div>
                      <span className="ml-1 font-medium">{technician?.rating}</span>
                      <span className="text-gray-400 ml-1">({technician?.numReviews} reviews)</span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{technician?.location} • {technician?.distance}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleContactClick}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md font-medium flex items-center justify-center transition-all duration-200"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs and content */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden shadow-xl">
          {/* Tab navigation */}
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-6 overflow-x-auto p-4" aria-label="Tabs">
              <button
                onClick={() => handleTabChange('overview')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'overview' 
                    ? 'border-red-500 text-red-500' 
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Overview
              </button>
              <button
                onClick={() => handleTabChange('skills')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'skills' 
                    ? 'border-red-500 text-red-500' 
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Skills & Experience
              </button>
              <button
                onClick={() => handleTabChange('services')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'services' 
                    ? 'border-red-500 text-red-500' 
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Services
              </button>
              <button
                onClick={() => handleTabChange('portfolio')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'portfolio' 
                    ? 'border-red-500 text-red-500' 
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Portfolio
              </button>
              <button
                onClick={() => handleTabChange('reviews')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'reviews' 
                    ? 'border-red-500 text-red-500' 
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Reviews
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="p-6">
            {/* Overview tab */}
            {activeTab === 'overview' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* About */}
                <motion.section variants={itemVariants}>
                  <h2 className="text-xl font-bold mb-4">About</h2>
                  <p className="text-gray-300 leading-relaxed">
                    {technician?.description}
                  </p>
                </motion.section>
                
                {/* Quick Info */}
                <motion.section variants={itemVariants}>
                  <h2 className="text-xl font-bold mb-4">Quick Info</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start">
                      <div className="bg-gray-700/60 p-3 rounded-full">
                        <CurrencyDollarIcon className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold">Hourly Rate</h3>
                        <p className="text-gray-300">{technician?.hourlyRate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-gray-700/60 p-3 rounded-full">
                        <UserIcon className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold">Experience</h3>
                        <p className="text-gray-300">10+ Years</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-gray-700/60 p-3 rounded-full">
                        <ClockIcon className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold">Response Time</h3>
                        <p className="text-gray-300">Usually within 2 hours</p>
                      </div>
                    </div>
                  </div>
                </motion.section>
                
                {/* Certifications */}
                <motion.section variants={itemVariants} className="bg-gray-800/50 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-4">Certifications</h2>
                  <div className="space-y-4">
                    {technician?.certifications.map((cert, index) => (
                      <div key={index} className="flex items-start">
                        <div className="bg-gray-700 p-2 rounded-md">
                          <WrenchIcon className="h-4 w-4 text-red-500" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold">{cert.name}</h3>
                          <p className="text-sm text-gray-400">{cert.issuer} • {cert.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
                
                {/* Availability */}
                <motion.section variants={itemVariants}>
                  <h2 className="text-xl font-bold mb-4">Availability</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {technician?.availability.map((slot, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg flex justify-between items-center ${
                          slot.day === 'Sunday' ? 'bg-gray-800/40' : 'bg-gray-800/70'
                        }`}
                      >
                        <span className="font-medium">{slot.day}</span>
                        <span className={`${slot.day === 'Sunday' ? 'text-gray-500' : 'text-gray-300'}`}>
                          {slot.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.section>
                
                {/* Contact info */}
                <motion.section variants={itemVariants} className="bg-red-900/20 border border-red-900/30 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <PhoneIcon className="h-5 w-5 text-red-500 mt-1" />
                      <div className="ml-3">
                        <h3 className="font-medium">Phone</h3>
                        <p className="text-gray-300">{technician?.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <EnvelopeIcon className="h-5 w-5 text-red-500 mt-1" />
                      <div className="ml-3">
                        <h3 className="font-medium">Email</h3>
                        <p className="text-gray-300">{technician?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-red-500 mt-1" />
                      <div className="ml-3">
                        <h3 className="font-medium">Location</h3>
                        <p className="text-gray-300">{technician?.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={handleContactClick}
                      className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto py-2 px-6 rounded-md font-medium flex items-center justify-center transition-all duration-200"
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                      Contact Now
                    </button>
                  </div>
                </motion.section>
              </motion.div>
            )}
            
            {/* Skills & Experience tab */}
            {activeTab === 'skills' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Skills */}
                <motion.section variants={itemVariants}>
                  <h2 className="text-xl font-bold mb-6">Technical Skills</h2>
                  <div className="space-y-4">
                    {technician?.skills.map((skill, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-sm text-gray-400">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-red-600 h-2.5 rounded-full" 
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
                
                {/* Professional Experience */}
                <motion.section variants={itemVariants}>
                  <h2 className="text-xl font-bold mb-6">Professional Experience</h2>
                  <div className="relative border-l-2 border-gray-700 pl-8 pb-2 space-y-10">
                    {technician?.experience.map((exp, index) => (
                      <div key={index} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-red-600 border-4 border-gray-900"></div>
                        
                        <div>
                          <h3 className="text-lg font-semibold">{exp.role}</h3>
                          <p className="text-red-500 font-medium">{exp.company}</p>
                          <p className="text-gray-400 text-sm mb-2">{exp.period}</p>
                          <p className="text-gray-300">{exp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
                
                {/* Certifications */}
                <motion.section variants={itemVariants}>
                  <h2 className="text-xl font-bold mb-6">Certifications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {technician?.certifications.map((cert, index) => (
                      <div key={index} className="bg-gray-800/70 p-4 rounded-lg">
                        <div className="flex items-start">
                          <div className="bg-red-900/50 p-3 rounded-lg">
                            <WrenchIcon className="h-6 w-6 text-red-500" />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-semibold">{cert.name}</h3>
                            <p className="text-gray-400">{cert.issuer}</p>
                            <p className="text-sm text-gray-500">Acquired in {cert.year}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </motion.div>
            )}
            
            {/* Services tab */}
            {activeTab === 'services' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Services List */}
                <motion.section variants={itemVariants}>
                  <h2 className="text-xl font-bold mb-6">Services Offered</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {technician?.services.map((service, index) => (
                      <div key={index} className="flex items-center bg-gray-800/60 p-4 rounded-lg">
                        <WrenchScrewdriverIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">{service}</span>
                      </div>
                    ))}
                  </div>
                </motion.section>
                
                {/* Rate Information */}
                <motion.section variants={itemVariants} className="bg-gray-800/70 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-4">Rate Information</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="font-medium">Diagnostic Fee</span>
                      <span className="text-red-500 font-semibold">$75 - $120</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="font-medium">Hourly Rate</span>
                      <span className="text-red-500 font-semibold">{technician?.hourlyRate}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="font-medium">Emergency Calls</span>
                      <span className="text-red-500 font-semibold">$150/hour</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Travel Fee</span>
                      <span className="text-red-500 font-semibold">$0.75/mile</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
                    * Rates may vary depending on the complexity of the service and vehicle make/model.
                    A detailed quote will be provided before any work begins.
                  </p>
                </motion.section>
                
                {/* Service Area */}
                <motion.section variants={itemVariants}>
                  <h2 className="text-xl font-bold mb-4">Service Area</h2>
                  <p className="text-gray-300 mb-4">
                    Based in {technician?.location}, I typically service vehicles within a 25-mile radius.
                    For locations outside this area, additional travel fees may apply.
                  </p>
                  <div className="bg-gray-800/60 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Areas Covered</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">San Francisco</span>
                      <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">Oakland</span>
                      <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">Daly City</span>
                      <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">South San Francisco</span>
                      <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">Berkeley</span>
                      <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">Alameda</span>
                      <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">San Mateo</span>
                    </div>
                  </div>
                </motion.section>
                
                {/* CTA */}
                <motion.section variants={itemVariants} className="bg-red-900/20 border border-red-500/20 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-semibold mb-3">Ready to get your vehicle serviced?</h3>
                  <p className="text-gray-300 mb-6">Contact me for a consultation and free quote</p>
                  <button
                    onClick={handleContactClick}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-md font-medium inline-flex items-center transition-all duration-200"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Request a Quote
                  </button>
                </motion.section>
              </motion.div>
            )}
            
            {/* Portfolio tab */}
            {activeTab === 'portfolio' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Photo Gallery */}
                <motion.section variants={itemVariants}>
                  <h2 className="text-xl font-bold mb-6">Work Gallery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {technician?.galleries.map((image, index) => (
                      <div key={index} className="relative overflow-hidden rounded-lg aspect-video">
                        <img 
                          src={image} 
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                </motion.section>
                
                {/* Featured Projects */}
                <motion.section variants={itemVariants}>
                  <h2 className="text-xl font-bold mb-6">Featured Projects</h2>
                  <div className="space-y-6">
                    <div className="bg-gray-800/60 p-5 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Classic Mustang Engine Rebuild</h3>
                      <p className="text-gray-300 mb-4">
                        Complete rebuild of a 1967 Mustang 289 V8 engine. The project involved disassembly,
                        machining, balancing, and reassembly with upgraded components for improved performance.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full text-xs">Engine Rebuild</span>
                        <span className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full text-xs">Classic Car</span>
                        <span className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full text-xs">Performance</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/60 p-5 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Tesla Model S Battery System Repair</h3>
                      <p className="text-gray-300 mb-4">
                        Diagnosed and repaired a fault in a Tesla Model S battery management system that was
                        causing reduced range and performance issues.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full text-xs">Electric Vehicle</span>
                        <span className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full text-xs">Battery Repair</span>
                        <span className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full text-xs">Diagnostics</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/60 p-5 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">BMW M3 Performance Upgrade</h3>
                      <p className="text-gray-300 mb-4">
                        Installation of performance parts including exhaust system, ECU tuning, suspension
                        upgrades, and brake improvements on a 2019 BMW M3.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full text-xs">Performance</span>
                        <span className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full text-xs">Tuning</span>
                        <span className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full text-xs">Suspension</span>
                      </div>
                    </div>
                  </div>
                </motion.section>
              </motion.div>
            )}
            
            {/* Reviews tab */}
            {activeTab === 'reviews' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Review Summary */}
                <motion.section variants={itemVariants}>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3 bg-gray-800/70 p-5 rounded-lg flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold text-white mb-1">{technician?.rating}</div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className={`h-5 w-5 ${i < Math.floor(technician?.rating) ? 'text-yellow-400' : 'text-gray-600'}`} />
                        ))}
                      </div>
                      <div className="text-sm text-gray-400">Based on {technician?.numReviews} reviews</div>
                    </div>
                    
                    <div className="md:w-2/3 space-y-2">
                      {calculateRatingPercentage(technician?.reviews || []).map((percentage, index) => (
                        <div key={5 - index} className="flex items-center">
                          <div className="w-20 text-sm text-gray-400 flex items-center">
                            <span>{5 - index}</span>
                            <StarIcon className="h-3 w-3 text-yellow-400 ml-1" />
                          </div>
                          <div className="flex-1 ml-4">
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-2 bg-yellow-400 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-16 text-right text-sm text-gray-400">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.section>
                
                {/* Reviews List */}
                <motion.section variants={itemVariants}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Customer Reviews</h2>
                  </div>
                  
                  {/* Review items */}
                  <div className="space-y-6">
                    {currentReviews.map((review) => (
                      <div key={review.id} className="bg-gray-800/50 p-5 rounded-lg">
                        <div className="flex items-start">
                          <img 
                            src={review.avatar} 
                            alt={review.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="font-medium">{review.name}</h3>
                              <span className="text-xs text-gray-400 ml-2">• {review.date}</span>
                            </div>
                            <div className="flex items-center mt-1 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`} />
                              ))}
                            </div>
                            <p className="text-gray-300">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {technician?.reviews?.length > itemsPerPage && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                      <button 
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`flex items-center justify-center w-10 h-10 rounded-md ${
                          currentPage === 1 
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      
                      {[...Array(Math.ceil((technician?.reviews?.length || 0) / itemsPerPage))].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => paginate(i + 1)}
                          className={`flex items-center justify-center w-10 h-10 rounded-md ${
                            currentPage === i + 1
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-800 text-white hover:bg-gray-700'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button 
                        onClick={nextPage}
                        disabled={currentPage === Math.ceil((technician?.reviews?.length || 0) / itemsPerPage)}
                        className={`flex items-center justify-center w-10 h-10 rounded-md ${
                          currentPage === Math.ceil((technician?.reviews?.length || 0) / itemsPerPage)
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </motion.section>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TechnicianDetail;