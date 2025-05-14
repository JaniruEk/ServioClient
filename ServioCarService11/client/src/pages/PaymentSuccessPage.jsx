import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, DocumentTextIcon, HomeIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import Header from '../components/Header';

function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderDetails } = location.state || {};

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

  // Make sure we have order details
  useEffect(() => {
    if (!location.state) {
      navigate('/checkout');
    }
  }, [location.state, navigate]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center mb-10"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-green-600 rounded-full p-3 mb-6"
            >
              <CheckCircleIcon className="h-16 w-16 text-white" />
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl font-bold text-center mb-4 font-[Poppins]"
            >
              Payment Successful!
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-center text-gray-300 font-[Open Sans] max-w-2xl"
            >
              Thank you for your payment. Your transaction has been completed successfully. A confirmation has been sent to your email.
            </motion.p>
          </motion.div>
          
          {orderDetails && (
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
            >
              {/* Order Details */}
              <motion.div 
                variants={itemVariants}
                className="lg:col-span-2"
              >
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-gray-700/50">
                  <h2 className="text-2xl font-semibold mb-6 font-[Raleway] border-b border-gray-500 pb-2">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-6 w-6 mr-2 text-red-500" />
                      <span>Order Details</span>
                    </div>
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 font-[Raleway]">Customer</h3>
                        <p className="font-[Open Sans] text-white">{orderDetails.fullName}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 font-[Raleway]">Email</h3>
                        <p className="font-[Open Sans] text-white">{orderDetails.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 font-[Raleway]">Shipping Address</h3>
                      <p className="font-[Open Sans] text-white">
                        {orderDetails.address}, {orderDetails.city}, {orderDetails.zipCode}, {orderDetails.country}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 font-[Raleway]">Payment Date</h3>
                      <p className="font-[Open Sans] text-white">{formatDate(orderDetails.paymentDate)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Order Summary */}
              <motion.div 
                variants={itemVariants}
                className="lg:col-span-1"
              >
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-gray-700/50">
                  <h2 className="text-2xl font-semibold mb-6 font-[Raleway] border-b border-gray-500 pb-2">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    {orderDetails.items && orderDetails.items.map(item => (
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
                      <span className="font-bold text-xl text-green-500">${orderDetails.total}</span>
                    </div>
                    <p className="text-green-400 text-sm mt-2 font-[Open Sans]">Paid Successfully</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          <motion.div 
            variants={itemVariants}
            className="flex justify-center"
          >
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-all duration-300 font-[Raleway]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Return to Dashboard
            </motion.button>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default PaymentSuccessPage;