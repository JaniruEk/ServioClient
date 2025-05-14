import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import Header from '../components/Header';

function CheckoutPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    items: [
      { id: 1, name: 'Regular Service Package', price: 249.99, quantity: 1 },
      { id: 2, name: 'Oil Change', price: 39.99, quantity: 1 }
    ]
  });

  // Animation variants
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save checkout data and redirect to payment page
    navigate('/payment', { 
      state: { 
        checkoutData: formData, 
        total: calculateTotal() 
      } 
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 pt-20">
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl font-bold text-center mb-12 font-[Poppins] bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700"
          >
            Checkout
          </motion.h1>
          
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Order Summary */}
            <motion.div 
              variants={itemVariants} 
              className="lg:col-span-1"
            >
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-gray-700/50">
                <h2 className="text-2xl font-semibold mb-6 font-[Raleway] border-b border-gray-500 pb-2">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {formData.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-[Open Sans] text-gray-300">{item.name}</span>
                        <span className="text-sm text-gray-400 block">x{item.quantity}</span>
                      </div>
                      <span className="font-[Raleway] text-white">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold font-[Raleway]">Total:</span>
                    <span className="font-bold text-xl text-red-500">${calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Checkout Form */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-2"
            >
              <form 
                onSubmit={handleSubmit} 
                className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-gray-700/50"
              >
                <h2 className="text-2xl font-semibold mb-6 font-[Raleway] border-b border-gray-500 pb-2">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="fullName" className="block mb-1 text-gray-300 font-[Open Sans]">Full Name</label>
                    <input 
                      type="text" 
                      id="fullName" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., John Doe"
                      required 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block mb-1 text-gray-300 font-[Open Sans]">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., john.doe@example.com"
                      required 
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="address" className="block mb-1 text-gray-300 font-[Open Sans]">Address</label>
                  <input 
                    type="text" 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., 123 Main Street"
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label htmlFor="city" className="block mb-1 text-gray-300 font-[Open Sans]">City</label>
                    <input 
                      type="text" 
                      id="city" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., New York"
                      required 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="zipCode" className="block mb-1 text-gray-300 font-[Open Sans]">ZIP Code</label>
                    <input 
                      type="text" 
                      id="zipCode" 
                      name="zipCode" 
                      value={formData.zipCode} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., 10001"
                      required 
                    />
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="country" className="block mb-1 text-gray-300 font-[Open Sans]">Country</label>
                    <select 
                      id="country" 
                      name="country" 
                      value={formData.country} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="SL">Sri Lanka</option>
                    </select>
                  </div>
                </div>
                
                <motion.button 
                  type="submit"
                  className="px-8 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-all duration-300 font-[Raleway] w-full md:w-auto float-right"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Proceed to Payment
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Navigation Indicator */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-12"
        >
          <ChevronDownIcon className="h-10 w-10 text-red-500 animate-bounce" />
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default CheckoutPage;