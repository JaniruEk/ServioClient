// src/pages/ServiceCenters.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, StarIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';
import OwnerSidebar from '../components/OwnerSidebar'; // Import OwnerSidebar component

function ServiceCenters({ user }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [serviceCentersData, setServiceCentersData] = useState([]);
  const [error, setError] = useState(null);  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');

  // Available filter options
  const specialtiesOptions = [
    'All Services',
    'Brake Service',
    'Engine Repair',
    'Transmission',
    'Electric Vehicles',
    'Hybrid Service',
    'Diagnostics',
    'Performance Tuning',
    'Body Work',
    'Custom Modifications'
  ];
  
  // Function to fetch service centers from Firebase
  const fetchServiceCenters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Create a query against the users collection where category = "service-center"
      const q = query(collection(db, "users"), where("category", "==", "service-center"));
      
      // Execute the query
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Transform Firebase data to match our frontend structure
        const formattedData = querySnapshot.docs.map((doc, index) => {
          const centerData = doc.data();
          return {
            id: doc.id,
            name: centerData.name || `Service Center ${index + 1}`,
            rating: centerData.averageRating || 4.5,
            address: centerData.address || 'Address not provided',
            phone: centerData.contactNumber || 'Phone not provided',
            image: centerData.profileImage || 'https://images.unsplash.com/photo-1577301403002-07f807025d12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
            specialties: centerData.services || ['General Service', 'Repairs'],
            description: centerData.description || `Professional automotive service center providing quality repairs and maintenance.`,
            hours: centerData.hours || 'Hours not specified',
            facilities: centerData.facilities || ['Customer Waiting Area'],
            reviews: centerData.reviews || Math.floor(Math.random() * 100) + 10
          };
        });
        
        console.log("Fetched service centers from Firebase:", formattedData);
        setServiceCentersData(formattedData);
      } else {
        console.error('No service centers found in the database');
        setError('No service centers found in the database');
        // Fall back to sample data
        setSampleServiceCenters();
      }
    } catch (error) {
      console.error('Error fetching service centers from Firebase:', error);
      setError('Error connecting to the database: ' + error.message);
      // Fall back to sample data if API call fails
      setSampleServiceCenters();
    } finally {
      setIsLoading(false);
    }
  };
  // Function to set sample data as fallback
  const setSampleServiceCenters = () => {
    const sampleData = [
      {
        id: "sc1",
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
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
        ],
        reviews: 128
      },
      {
        id: "sc2",
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
          'https://images.unsplash.com/photo-1550039575-34131c9dc352?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
        ],
        reviews: 97
      },
      {
        id: "sc3",
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
          'https://images.unsplash.com/photo-1565689157206-0fddef7589a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
        ],
        reviews: 65
      }
    ];
    
    setServiceCentersData(sampleData);
  };

  // useEffect to fetch service centers when component mounts
  useEffect(() => {
    fetchServiceCenters();
  }, []);

  // Animation Variants
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
    hover: { scale: 1.03, transition: { duration: 0.3 } },
  };

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
  // Filter service centers based on search query and specialty
  const filteredServiceCenters = serviceCentersData.filter((center) => {
    const matchesSearch = (
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.specialties.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    const matchesSpecialty = 
      filterSpecialty === '' || 
      filterSpecialty === 'All Services' || 
      center.specialties.some(spec => spec.toLowerCase() === filterSpecialty.toLowerCase());
    
    return matchesSearch && matchesSpecialty;
  });

  // Handle navigation to detail page
  const handleViewDetails = (centerId) => {
    navigate(`/service-center/${centerId}`, { state: { serviceCenter: serviceCentersData.find(center => center.id === centerId) } });
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
        {/* Using the OwnerSidebar component */}
        <OwnerSidebar activePath="/service-centers" />

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">Service Centers</h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">Find the perfect service center for your vehicle</p>
            </div>
          </header>          {/* Search and Filter Section */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors font-[Open Sans]"
                  placeholder="Search service centers by name, address, or services..."
                />
              </div>
              
              {/* Filter by Specialty */}
              <div className="relative min-w-[200px]">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filterSpecialty}
                  onChange={(e) => setFilterSpecialty(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors font-[Open Sans] appearance-none"
                >
                  {specialtiesOptions.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          )}

          {/* Error Message */}
          {error && !isLoading && (
            <div className="bg-red-900/50 text-white p-6 rounded-lg mb-6">
              <p className="text-center">{error}</p>
              <p className="text-center mt-2">Showing sample service centers instead.</p>
            </div>
          )}

          {/* Service Centers List */}
          {!isLoading && (
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6"
            >
              {filteredServiceCenters.length > 0 ? (
                filteredServiceCenters.map((center) => (
              <motion.div
                key={center.id}
                variants={itemVariants}
                whileHover="hover"
                className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden shadow-lg border border-gray-700/50 hover:border-red-500 transition-all duration-300 h-full flex flex-col"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={center.image}
                    alt={center.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2 font-[Raleway]">{center.name}</h3>
                  <div className="flex items-center mb-3">
                    {renderStars(center.rating)}
                    <span className="ml-2 text-gray-300">({center.rating})</span>
                    <span className="ml-2 text-gray-400 text-sm">({center.reviews} reviews)</span>
                  </div>
                  <div className="flex items-start gap-2 mb-2 text-gray-300 font-[Open Sans]">
                    <MapPinIcon className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                    <span>{center.address}</span>
                  </div>
                  <p className="text-gray-300 mb-4 font-[Open Sans]">{center.phone}</p>
                  <div className="mb-4 mt-auto">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2 font-[Raleway]">Specialties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {center.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-600/80 text-white text-xs rounded-full font-[Open Sans]"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out transform font-[Open Sans]"
                    onClick={() => handleViewDetails(center.id)}
                  >
                    View Details
                  </button>
                </div>
              </motion.div>                ))
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white/10 backdrop-blur-md p-8 rounded-lg text-center shadow-lg">
                  <h3 className="text-xl font-semibold mb-2 font-[Raleway]">No Service Centers Found</h3>
                  <p className="text-gray-300 font-[Open Sans]">
                    Try changing your search criteria.
                  </p>
                </div>
              )}
            </motion.section>
          )}
        </main>
      </div>

      {/* Footer - Full Width */}
      <Footer />
    </div>
  );
}

export default ServiceCenters;