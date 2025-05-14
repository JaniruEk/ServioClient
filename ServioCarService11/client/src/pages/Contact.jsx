import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { auth } from '../firebase';
import { UserIcon, EnvelopeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

function Contact({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 3000);
  };

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
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center bg-no-repeat bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70')]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Header */}
      <Header user={user} />

      {/* Main Content with Sidebar */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-1 pt-20 relative z-10"
      >
        {/* Sidebar - Only show if user is logged in */}
        {user && (
          <motion.aside
            variants={sectionVariants}
            className="w-64 bg-gray-800 text-white p-6 hidden md:block shadow-lg"
          >
            <motion.ul variants={containerVariants} className="space-y-3">
              {[
                { text: 'Home', path: '/dashboard' },
                { text: 'Book Service', path: '/book-service' },
                { text: 'Service History', path: '/service-history' },
                { text: 'Profile', path: '/profile' },
                { text: 'Contact Us', path: '/contact', active: true },
                { text: 'About Us', path: '/about-us' },
                { text: 'Logout', path: '/logout' },
              ].map((item) => (
                <motion.li
                  key={item.text}
                  variants={itemVariants}
                  className="border-b border-gray-700/50"
                >
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.text === 'Logout') {
                        auth.signOut();
                        navigate('/');
                      } else {
                        navigate(item.path);
                      }
                    }}
                    className={`block py-3 px-4 rounded-md hover:bg-gray-700 hover:text-red-500 transition-all duration-300 font-[Open Sans] text-sm tracking-wide ${
                      item.active ? 'bg-gray-700 font-bold text-red-500 shadow-inner' : ''
                    }`}
                  >
                    {item.text}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.aside>
        )}

        {/* Main Content */}
        <motion.main
          className={`flex-1 p-6 md:p-10 ${user ? '' : 'max-w-5xl mx-auto'}`}
        >
          <motion.header
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/10 backdrop-blur-md p-6 text-center rounded-xl mb-8 shadow-2xl border border-gray-700/50"
          >
            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-5xl font-extrabold font-[Poppins] bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700 tracking-tight"
            >
              Contact Us
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-gray-300 mt-2 font-[Open Sans] text-sm md:text-base"
            >
              We’re here to assist you with all your car care needs.
            </motion.p>
          </motion.header>

          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-8"
          >
            {/* Success Message */}
            {isSubmitted && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-green-600/20 text-green-300 p-4 rounded-xl shadow-md text-center font-[Open Sans] max-w-2xl mx-auto border border-green-500/50"
              >
                <span className="font-semibold">Success!</span> Your message has been sent.
              </motion.div>
            )}

            <motion.div
              variants={containerVariants}
              className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto"
            >
              {/* Contact Form */}
              <motion.div
                variants={sectionVariants}
                whileHover="hover"
                className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl flex-2 border border-gray-700/50"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-2xl md:text-3xl font-bold mb-6 font-[Raleway] bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700"
                >
                  Get in Touch
                </motion.h2>
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                  <motion.div variants={itemVariants} className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-12 p-4 border border-gray-700 rounded-lg text-base font-[Open Sans] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 w-full bg-gray-800 text-white hover:bg-gray-700 hover:border-red-500"
                      required
                    />
                  </motion.div>
                  <motion.div variants={itemVariants} className="relative group">
                    <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-12 p-4 border border-gray-700 rounded-lg text-base font-[Open Sans] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 w-full bg-gray-800 text-white hover:bg-gray-700 hover:border-red-500"
                      required
                    />
                  </motion.div>
                  <motion.div variants={itemVariants} className="relative group">
                    <ChatBubbleLeftIcon className="absolute left-4 top-5 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
                    <textarea
                      name="message"
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={handleChange}
                      className="pl-12 p-4 border border-gray-700 rounded-lg text-base font-[Open Sans] h-36 resize-y focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 w-full bg-gray-800 text-white hover:bg-gray-700 hover:border-red-500"
                      required
                    />
                  </motion.div>
                  <motion.button
                    variants={itemVariants}
                    whileHover="hover"
                    type="submit"
                    className="bg-red-600 text-white p-4 rounded-full font-semibold text-lg hover:bg-red-700 transition-all duration-300 font-[Raleway] shadow-md"
                  >
                    Send Message
                  </motion.button>
                </form>
              </motion.div>

              {/* Contact Info with Map */}
              <motion.div
                variants={sectionVariants}
                whileHover="hover"
                className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl flex-1 border border-gray-700/50"
              >
                <motion.h3
                  variants={itemVariants}
                  className="text-2xl md:text-3xl font-bold mb-6 font-[Raleway] bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700"
                >
                  Contact Information
                </motion.h3>
                <motion.div variants={containerVariants} className="text-gray-300 font-[Open Sans] space-y-4 text-sm md:text-base">
                  <motion.p variants={itemVariants} className="flex items-center gap-2">
                    <span className="text-red-500">📞</span>
                    <strong className="font-semibold">Phone:</strong> +94 70 123 4567
                  </motion.p>
                  <motion.p variants={itemVariants} className="flex items-center gap-2">
                    <span className="text-red-500">✉️</span>
                    <strong className="font-semibold">Email:</strong> support@servio.com
                  </motion.p>
                  <motion.p variants={itemVariants} className="flex items-center gap-2">
                    <span className="text-red-500">📍</span>
                    <strong className="font-semibold">Address:</strong> 123, Kengolla, Kundasale, Kandy, Sri Lanka
                  </motion.p>
                </motion.div>
                <motion.div variants={itemVariants} className="mt-6">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.555555555556!2d80.68333331405862!3d7.28333331405862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae368e4e2c7e8b5%3A0x5e5e5e5e5e5e5e5e!2sKengolla%2C%20Kundasale%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1630000000000"
                    width="100%"
                    height="250"
                    style={{ border: 0, borderRadius: '0.75rem' }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Servio Location Map"
                    className="shadow-md"
                  ></iframe>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.section>
        </motion.main>
      </motion.div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Contact;