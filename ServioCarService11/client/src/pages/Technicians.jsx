import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  WrenchScrewdriverIcon,
  UserIcon
} from '@heroicons/react/24/solid';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';
import OwnerSidebar from '../components/OwnerSidebar';

function Technicians({ user }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [error, setError] = useState(null);

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
    hover: { scale: 1.03, transition: { duration: 0.3 } }
  };

  // Available filter options
  const specialtiesOptions = [
    'All Specialties',
    'Engine Repair',
    'Electrical Systems',
    'Diagnostics',
    'Computer Diagnostics',
    'Hybrid Systems',
    'Preventative Maintenance',
    'Performance Tuning',
    'Custom Modifications',
    'Race Preparation'
  ];
  // Function to fetch technicians from Firebase
  const fetchTechnicians = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Create a query against the users collection where category = "technician"
      const q = query(collection(db, "users"), where("category", "==", "technician"));
      
      // Execute the query
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Transform Firebase data to match our frontend structure
        const formattedData = querySnapshot.docs.map(doc => {
          const techData = doc.data();
          return {
            id: doc.id,
            name: techData.name || 'Unknown',
            title: techData.specialization || 'Automotive Technician',
            rating: techData.averageRating || 4.5,
            phone: techData.contactNumber || 'N/A',
            email: techData.email || 'N/A',
            image: techData.profileImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
            specialties: techData.specialization ? [techData.specialization] : ['General Maintenance'],
            description: `Experienced automotive technician specializing in ${techData.specialization || 'general automotive repairs'}.`,
            experience: `${techData.jobsCompleted || 0} jobs completed`,
            reviews: techData.ratings ? techData.ratings.length : 0
          };
        });
        
        console.log("Fetched technicians from Firebase:", formattedData);
        setTechnicians(formattedData);
      } else {
        console.error('No technicians found in the database');
        setError('No technicians found in the database');
        // Fall back to sample data if no technicians found
        setSampleTechnicians();
      }
    } catch (error) {
      console.error('Error fetching technicians from Firebase:', error);
      setError('Error connecting to the database: ' + error.message);
      // Fall back to sample data if API call fails
      setSampleTechnicians();
    } finally {
      setIsLoading(false);
    }
  };

  // Function to set sample data as fallback
  const setSampleTechnicians = () => {
    const technicianData = [
      {
        id: 1,
        name: 'Alex Rodriguez',
        title: 'Senior Automotive Technician',
        rating: 4.8,
        phone: '+1 (555) 123-4567',
        email: 'alex.rodriguez@servio.com',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        specialties: ['Engine Repair', 'Electrical Systems', 'Diagnostics'],
        description: 'With over 10 years of experience in automotive repair, Alex specializes in complex engine problems and electrical diagnostics.',
        experience: '10+ years',
        reviews: 42
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        title: 'Automotive Diagnostics Specialist',
        rating: 4.7,
        phone: '+1 (555) 234-5678',
        email: 'sarah.johnson@servio.com',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        specialties: ['Computer Diagnostics', 'Hybrid Systems', 'Preventative Maintenance'],
        description: 'Sarah specializes in advanced automotive diagnostics and hybrid vehicle systems with 8 years of experience.',
        experience: '8 years',
        reviews: 36
      },
      {
        id: 3,
        name: 'Michael Chen',
        title: 'Performance Tuning Expert',
        rating: 4.9,
        phone: '+1 (555) 345-6789',
        email: 'michael.chen@servio.com',
        image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        specialties: ['Performance Tuning', 'Custom Modifications', 'Race Preparation'],
        description: 'Michael specializes in high-performance vehicle tuning and custom modifications with motorsport experience.',
        experience: '12 years',
        reviews: 51
      },
      {
        id: 4,
        name: 'Emily Roberts',
        title: 'European Vehicle Specialist',
        rating: 4.6,
        phone: '+1 (555) 456-7890',
        email: 'emily.roberts@servio.com',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        specialties: ['European Vehicles', 'Engine Repair', 'Electrical Diagnostics'],
        description: 'Emily specializes in European luxury vehicles with manufacturer-specific training and certification.',
        experience: '9 years',
        reviews: 28
      },
      {
        id: 5,
        name: 'David Kim',
        title: 'Transmission & Drivetrain Expert',
        rating: 4.8,
        phone: '+1 (555) 567-8901',
        email: 'david.kim@servio.com',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        specialties: ['Transmission Repair', 'Drivetrain', 'Clutch Systems'],
        description: 'David is a drivetrain specialist with expertise in manual and automatic transmission systems.',
        experience: '15 years',
        reviews: 47
      },
      {
        id: 6,
        name: 'Jessica Martinez',
        title: 'EV & Hybrid Technician',
        rating: 4.9,
        phone: '+1 (555) 678-9012',
        email: 'jessica.martinez@servio.com',
        image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        specialties: ['Electric Vehicles', 'Hybrid Systems', 'Battery Technology'],
        description: 'Jessica specializes in electric and hybrid vehicles with advanced training in battery management systems.',
        experience: '7 years',
        reviews: 31
      }
    ];
    
    setTechnicians(technicianData);
    setIsLoading(false);
  };

  // Stars rendering function
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-4 w-4 text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <StarIcon className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;  };

  // Call fetchTechnicians when component mounts
  useEffect(() => {
    fetchTechnicians();
  }, []);

  // Filter technicians based on search query and specialty
  const filteredTechnicians = technicians.filter((technician) => {
    const matchesSearch = technician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          technician.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          technician.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = filterSpecialty === '' || 
                             filterSpecialty === 'All Specialties' ||
                             technician.specialties.some(spec => spec.toLowerCase() === filterSpecialty.toLowerCase());
    
    return matchesSearch && matchesSpecialty;
  });  
  
  const handleTechnicianClick = (technician) => {
    navigate(`/technician/${technician.id}`);
  };
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-xl font-[Open Sans] text-gray-300">Loading technicians...</p>
        </div>
      </div>
    );
  }
  
  // Show error message if there's an error
  if (error && technicians.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans justify-center items-center">
        <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold font-[Poppins] mb-4">Error Loading Technicians</h2>
          <p className="text-gray-300 font-[Open Sans] mb-6">{error}</p>
          <button 
            onClick={fetchTechnicians}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 font-[Open Sans]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>

      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <OwnerSidebar activePath="/technicians" />

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight mb-2">Our Expert Technicians</h1>
                <p className="text-sm font-[Open Sans] text-gray-300">
                  Connect with certified automotive professionals for your vehicle needs
                </p>
              </div>
              <div className="flex space-x-2">
                <Link
                  to="/book-service-center"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 font-[Open Sans]"
                >
                  Book a Service
                </Link>
              </div>
            </div>
          </header>

          {/* Search and Filter Section */}
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
                  placeholder="Search technicians by name, specialty, or expertise..."
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

          {/* Technicians Grid */}
          {filteredTechnicians.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTechnicians.map((technician) => (
                <motion.div
                  key={technician.id}
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300"
                  onClick={() => handleTechnicianClick(technician)}
                >
                  <div className="relative">
                    <img
                      src={technician.image}
                      alt={technician.name}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center">
                        <div className="flex mr-2">{renderStars(technician.rating)}</div>
                        <span className="text-white text-sm">({technician.rating})</span>
                        <span className="text-gray-300 text-sm ml-1">({technician.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-bold font-[Poppins] mb-1">{technician.name}</h2>
                    <p className="text-red-400 text-sm mb-3 font-[Open Sans]">{technician.title}</p>
                    <p className="text-gray-300 text-sm mb-4 font-[Open Sans] line-clamp-2">{technician.description}</p>
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-300 font-[Open Sans] mb-1">
                        <WrenchScrewdriverIcon className="h-4 w-4 text-red-500 mr-2" />
                        <span>Experience: {technician.experience}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300 font-[Open Sans]">
                        <UserIcon className="h-4 w-4 text-red-500 mr-2" />
                        <span>Specialties: {technician.specialties.join(', ')}</span>
                      </div>
                    </div>                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent div's onClick
                        handleTechnicianClick(technician);
                      }}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 font-[Open Sans] font-medium"
                    >
                      View Profile
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg text-center shadow-lg">
              <h3 className="text-xl font-semibold mb-2 font-[Raleway]">No Technicians Found</h3>
              <p className="text-gray-300 font-[Open Sans]">
                Try changing your search criteria or filters.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Technicians;