import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  WrenchScrewdriverIcon,
  PhoneIcon,
  CalendarIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';
import Header from '../components/Header';
import Footer from '../components/Footer';

import HeroBg from '../assets/images/hero-bg.jpg';
import OfferNetwork from '../assets/images/offer-network.jpg';
import Gallery3 from '../assets/images/gallery-3.jpg';
import YellowLambo from '../assets/images/YellowLambo.webp';
import CarParts from '../assets/images/CarParts.webp';
import Electrical from '../assets/images/Electrical.jpg';
import Air from '../assets/images/Air.jpeg';
import Interior from '../assets/images/Interior.webp';

function GuestHome() {
  const navigate = useNavigate();

  // Animation Variants from AboutUs.jsx
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative h-[700px] bg-cover bg-center flex items-center justify-center overflow-hidden"
          style={{ backgroundImage: `url(${HeroBg})`, backgroundAttachment: 'fixed' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent"></div>
          <motion.div variants={itemVariants} className="relative z-10 text-center px-4">
            <motion.div variants={itemVariants} className="flex justify-center mb-4">
              <div className="w-24 h-1 bg-red-500 rounded-full"></div>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-extrabold mb-4 font-[Poppins] tracking-tight drop-shadow-lg"
            >
              SERVIO
            </motion.h1>
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-5xl font-light mb-6 font-[Raleway] drop-shadow-md"
            >
              Mastering the Art of Auto Repair
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl mb-8 max-w-3xl mx-auto font-[Open Sans] leading-relaxed text-gray-300"
            >
              Servio revolutionizes car service and repair management by connecting vehicle owners, technicians, and service centers in one seamless platform. Whether you need to schedule a tune-up, find a skilled mechanic, or manage your repair shop’s bookings, Servio has you covered.
            </motion.p>
            <motion.button
              variants={itemVariants}
              whileHover="hover"
              onClick={() => navigate('/contact')}
              className="bg-red-600 text-white px-10 py-4 rounded-full font-medium text-lg hover:bg-red-700 transition-all duration-300 font-[Raleway]"
            >
              Contact Us
            </motion.button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700/50"
          >
            <motion.div variants={containerVariants} className="grid grid-cols-2 gap-6">
              {[
                { value: '20K', label: 'Satisfied Clients', icon: UserGroupIcon },
                { value: '500+', label: 'Team Members', icon: UserGroupIcon },
                { value: '150', label: 'Winning Awards', icon: WrenchScrewdriverIcon },
                { value: '7K', label: 'Charity Causes', icon: CalendarIcon },
              ].map((stat, index) => (
                <motion.div key={index} variants={itemVariants} className="flex items-center space-x-3">
                  <stat.icon className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-300">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
          >
            <ChevronDownIcon className="h-10 w-10 text-white opacity-70 hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        </motion.section>

        {/* What We Offer Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-center mb-12 font-[Poppins] bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700"
          >
            What We Offer
          </motion.h2>
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CalendarIcon,
                title: 'Easy Scheduling',
                desc: 'Book appointments instantly with real-time availability from top service centers and technicians.',
                img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
              },
              {
                icon: DocumentTextIcon,
                title: 'Service History',
                desc: 'Keep a detailed log of all repairs and maintenance for your vehicle, accessible anytime.',
                img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
              },
              {
                icon: UserGroupIcon,
                title: 'Expert Network',
                desc: 'Connect with verified technicians and service centers tailored to your car’s needs.',
                img: OfferNetwork,
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover="hover"
                className="bg-white/10 backdrop-blur-md shadow-lg rounded-lg overflow-hidden border border-gray-700/50"
              >
                <img src={item.img} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-6 text-center">
                  <item.icon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 font-[Raleway]">{item.title}</h3>
                  <p className="text-gray-300 font-[Open Sans]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Driving Confidence Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 bg-gray-800"
        >
          <motion.div
            variants={itemVariants}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center"
          >
            <motion.div variants={itemVariants} className="md:w-1/2">
              <img
                src={YellowLambo}
                alt="Car Repair"
                className="w-full h-96 object-cover rounded-lg"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="md:w-1/2 md:pl-10 mt-8 md:mt-0">
              <motion.h2
                variants={itemVariants}
                className="text-4xl font-bold mb-4 font-[Poppins] bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700"
              >
                Driving Confidence, One Repair at a Time
              </motion.h2>
              <motion.p variants={itemVariants} className="text-gray-300 mb-6 font-[Open Sans]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </motion.p>
              <motion.ul variants={containerVariants} className="space-y-4">
                {[
                  { icon: WrenchScrewdriverIcon, title: 'Air Conditioning Maintenance', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
                  { icon: CalendarIcon, title: 'Oil Change & Filter Replacement', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
                ].map((item, index) => (
                  <motion.li key={index} variants={itemVariants} className="flex items-start">
                    <item.icon className="h-6 w-6 text-red-500 mr-2" />
                    <div>
                      <h3 className="text-lg font-semibold font-[Raleway]">{item.title}</h3>
                      <p className="text-gray-300 font-[Open Sans]">{item.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Gallery Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-center mb-12 font-[Poppins] bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700"
          >
            Your Road to Reliable Repairs
          </motion.h2>
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              CarParts,
              'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60',
              Gallery3,
              'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60',
            ].map((img, index) => (
              <motion.img
                key={index}
                variants={itemVariants}
                src={img}
                alt={`Gallery ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </motion.div>
          <motion.div variants={containerVariants} className="flex justify-center mt-8 space-x-4">
            {['All', 'Project', 'Car', 'Carbon', 'Break'].map((filter) => (
              <motion.button
                key={filter}
                variants={itemVariants}
                whileHover="hover"
                className="px-4 py-2 rounded-full border border-gray-700 hover:bg-red-600 hover:text-white transition-all duration-300 font-[Open Sans]"
              >
                {filter}
              </motion.button>
            ))}
          </motion.div>
        </motion.section>

        {/* Pricing Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 bg-gray-800"
        >
          <motion.div variants={itemVariants} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={containerVariants} className="flex justify-center space-x-8 mb-12">
              {['Service', 'Electrical System Repair', 'Suspension'].map((title, index) => (
                <motion.div
                  key={title}
                  variants={itemVariants}
                  className="text-red-500 text-2xl font-bold font-[Raleway]"
                >
                  {title}
                </motion.div>
              ))}
            </motion.div>
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md shadow-lg rounded-lg p-6 border border-gray-700/50"
              >
                <h3 className="text-xl font-semibold mb-4 font-[Raleway] text-white">Precision in Every Engine Piston</h3>
                <p className="text-gray-300 mb-4 font-[Open Sans]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                </p>
              </motion.div>
              {[
                { title: 'Quick Fix', price: '$19', items: ['Engine Tune-up', 'Oil Change', 'Brake Inspection', 'Tire Rotation'] },
                { title: 'Master Mech', price: '$29', items: ['Engine Tune-up', 'Oil Change', 'Brake Inspection', 'Tire Rotation'] },
              ].map((plan, index) => (
                <motion.div
                  key={plan.title}
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-red-600 text-white rounded-lg p-6 text-center border border-red-500"
                >
                  <h3 className="text-2xl font-bold mb-4 font-[Raleway]">{plan.title}</h3>
                  <p className="text-4xl font-bold mb-4">{plan.price}</p>
                  <ul className="space-y-2 mb-6 font-[Open Sans]">
                    {plan.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <button className="bg-white text-red-600 px-6 py-2 rounded-full font-medium hover:bg-gray-100 font-[Raleway]">
                    Know More
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-center mb-12 font-[Poppins] bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700"
          >
            Performance That Speaks Volumes
          </motion.h2>
          <motion.div variants={itemVariants} className="relative">
            <motion.div variants={containerVariants} className="flex space-x-8 overflow-x-auto">
              {[
                {
                  name: 'Brook Simmons',
                  quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                  img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=60',
                },
                {
                  name: 'Jane Doe',
                  quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                  img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=60',
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  variants={itemVariants}
                  className="bg-white/10 backdrop-blur-md shadow-lg rounded-lg p-6 flex items-center space-x-4 border border-gray-700/50"
                >
                  <img src={testimonial.img} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <p className="text-gray-300 mb-2 font-[Open Sans]">{testimonial.quote}</p>
                    <p className="text-red-500 font-semibold font-[Raleway]">{testimonial.name}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.button
              variants={itemVariants}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </motion.button>
            <motion.button
              variants={itemVariants}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Quality Counts Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 bg-gray-800"
        >
          <motion.div variants={itemVariants} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold text-center mb-12 font-[Poppins] bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700"
            >
              When Quality Counts, Count on Us
            </motion.h2>
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: WrenchScrewdriverIcon, title: 'Wheel Alignment', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
                { icon: CalendarIcon, title: 'Filter Replacement', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
                { icon: UserGroupIcon, title: 'System Upgrades', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
              ].map((item, index) => (
                <motion.div key={item.title} variants={itemVariants} className="text-center">
                  <item.icon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 font-[Raleway]">{item.title}</h3>
                  <p className="text-gray-300 font-[Open Sans]">{item.desc}</p>
                  <button className="text-red-500 mt-2 hover:underline font-[Open Sans]">Know More</button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Bring Your Drive Back Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center"
        >
          <motion.div variants={itemVariants} className="md:w-1/2">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold mb-4 font-[Poppins] bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700"
            >
              Bring Your Drive Back to Life
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-300 mb-6 font-[Open Sans]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </motion.p>
            <motion.button
              variants={itemVariants}
              whileHover="hover"
              onClick={() => navigate('/contact')}
              className="bg-red-600 text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-all duration-300 font-[Raleway]"
            >
              Contact Us
            </motion.button>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="md:w-1/2 md:pl-10 mt-8 md:mt-0 bg-white/10 backdrop-blur-md p-6 rounded-lg border border-gray-700/50"
          >
            {[
              { q: 'How Often Should I Get My Car Serviced?', a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
              { q: 'What Do I Do If the Check Engine Light Comes On?', a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
              { q: 'How Long Does a Typical Car Repair Take?', a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
            ].map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-4 font-[Raleway]">{faq.q}</h3>
                <p className="mb-4 font-[Open Sans] text-gray-300">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Blog Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold text-center mb-12 font-[Poppins] bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700"
            >
              Unleashing the Power of Precision
            </motion.h2>
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
            title: 'Electrical System Repair',
            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            img: Electrical,
                },
                {
            title: 'Air Conditioning Maintenance',
            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            img: Air,
                },
                {
            title: 'Interior Detailing & Upholstery',
            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            img: Interior,
                },
              ].map((post, index) => (
                <motion.div
            key={post.title}
            variants={itemVariants}
            whileHover="hover"
            className="bg-white/10 backdrop-blur-md shadow-lg rounded-lg overflow-hidden border border-gray-700/50"
                >
            <img src={post.img} alt={post.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 font-[Raleway]">{post.title}</h3>
              <p className="text-gray-300 mb-4 font-[Open Sans]">{post.desc}</p>
              <button className="text-red-500 hover:underline font-[Open Sans]">Read More</button>
            </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Newsletter Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 bg-red-600 text-white text-center"
        >
          <motion.div variants={itemVariants} className="flex justify-center">
            {/* Placeholder for newsletter content if needed */}
            <p className="text-lg font-[Open Sans]">Stay tuned for updates!</p>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default GuestHome;