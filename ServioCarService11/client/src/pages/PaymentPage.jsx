import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract checkout data and ensure total is properly formatted
  const { checkoutData = {} } = location.state || {};
  
  // Calculate the total based on service type: $75 for technician requests, $100 for service center requests
  let total = '0.00';
  if (location.state) {
    if (checkoutData.serviceType === 'Technician Visit' || 
        (location.state.checkoutData && location.state.checkoutData.serviceType === 'Technician Visit') ||
        checkoutData.technicianName || 
        (location.state.checkoutData && location.state.checkoutData.technicianName)) {
      console.log('Charging fixed rate for technician service: $75.00');
      total = '75.00';
    } else {
      // Default to service center rate
      console.log('Charging fixed rate for service center service: $100.00');
      total = '100.00';
    }
  }
  
  // Log values for debugging
  console.log('Location state:', location.state);
  console.log('Checkout data:', checkoutData);
  console.log('Total:', total);
  console.log('Hourly rate from checkoutData:', checkoutData.hourlyRate);
  console.log('Hourly rate from location.state.checkoutData:', 
    location.state && location.state.checkoutData ? location.state.checkoutData.hourlyRate : 'Not available');
  console.log('Total from location.state:', location.state ? location.state.total : 'Not available');
  
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvc: ''
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
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setCardDetails(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      const formatted = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .substr(0, 5);
      setCardDetails(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const processPayment = async (e) => {
    e.preventDefault();
    
    if (paymentStatus === 'loading') return;
    
    try {
      setPaymentStatus('loading');
      
      // Ensure total is a valid number
      const validTotal = isNaN(parseFloat(total)) ? 0 : parseFloat(total);
      console.log(`Processing payment for amount: $${validTotal}`);
      
      // Normally we would use Stripe Elements here
      // This is a simplified mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Call our payment service
      const paymentData = {
        amount: validTotal * 100, // Convert to cents for Stripe
        email: checkoutData.email || 'customer@example.com',
        description: 'Servio Car Service Payment',
        metadata: { 
          customer: checkoutData.fullName || 'Customer',
          address: checkoutData.address || 'N/A'
        }
      };
      
      // In a real implementation, we would use Stripe's Elements or PaymentIntents API
      // const response = await PaymentService.createPaymentIntent(paymentData);
      
      setPaymentStatus('success');
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate('/payment-success', { 
          state: { 
            orderDetails: {
              ...checkoutData,
              total,
              paymentDate: new Date().toISOString(),
              paymentMethod: "Credit Card",
              paymentStatus: "Completed"
            }
          }
        });
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'An error occurred processing your payment');
      setPaymentStatus('error');
    }
  };

  // Make sure we have checkout data
  useEffect(() => {
    if (!location.state) {
      navigate('/checkout');
    }
  }, [location.state, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
      {/* Main Content */}
      <main className="flex-1 pt-8">
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
            Payment
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
                  {checkoutData.items && checkoutData.items.map(item => (
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
                  {checkoutData.serviceType && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-[Open Sans] text-gray-300">Service Type:</span>
                      <span className="font-[Raleway] text-white">{checkoutData.serviceType}</span>
                    </div>
                  )}
                  {checkoutData.serviceDate && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-[Open Sans] text-gray-300">Service Date:</span>
                      <span className="font-[Raleway] text-white">{checkoutData.serviceDate}</span>
                    </div>
                  )}
                  {checkoutData.serviceTime && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-[Open Sans] text-gray-300">Service Time:</span>
                      <span className="font-[Raleway] text-white">{checkoutData.serviceTime}</span>
                    </div>
                  )}
                  {checkoutData.serviceCenterName && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-[Open Sans] text-gray-300">Service Center:</span>
                      <span className="font-[Raleway] text-white">{checkoutData.serviceCenterName}</span>
                    </div>
                  )}
                  {checkoutData.technicianName && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-[Open Sans] text-gray-300">Technician:</span>
                      <span className="font-[Raleway] text-white">{checkoutData.technicianName}</span>
                    </div>
                  )}
                  {checkoutData.hourlyRate && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-[Open Sans] text-gray-300">Hourly Rate:</span>
                      <span className="font-[Raleway] text-white">${checkoutData.hourlyRate}/hour</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-4 border-t border-gray-700 pt-4">
                    <span className="font-semibold font-[Raleway]">Total (8 hours):</span>
                    <span className="font-bold text-xl text-red-500">${total}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 italic">
                    *Daily rate calculated as 8 hours at the hourly rate.
                  </div>
                </div>
                
                <div className="mt-8 bg-gray-800/70 p-3 rounded-lg">
                  <div className="flex items-center">
                    <LockClosedIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-300 font-[Open Sans]">Secure Payment Processing</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Payment Form */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-2"
            >
              <form 
                onSubmit={processPayment} 
                className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-gray-700/50"
              >
                <h2 className="text-2xl font-semibold mb-6 font-[Raleway] border-b border-gray-500 pb-2">
                  <div className="flex items-center">
                    <CreditCardIcon className="h-6 w-6 mr-2 text-red-500" />
                    <span>Payment Details</span>
                  </div>
                </h2>
                
                <div className="mb-6">
                  <label htmlFor="cardNumber" className="block mb-1 text-gray-300 font-[Open Sans]">Card Number</label>
                  <input 
                    type="text" 
                    id="cardNumber" 
                    name="cardNumber" 
                    value={cardDetails.cardNumber} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required 
                    disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="cardHolder" className="block mb-1 text-gray-300 font-[Open Sans]">Card Holder Name</label>
                  <input 
                    type="text" 
                    id="cardHolder" 
                    name="cardHolder" 
                    value={cardDetails.cardHolder} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="John Doe"
                    required 
                    disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="expiryDate" className="block mb-1 text-gray-300 font-[Open Sans]">Expiry Date</label>
                    <input 
                      type="text" 
                      id="expiryDate" 
                      name="expiryDate" 
                      value={cardDetails.expiryDate} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="MM/YY"
                      maxLength="5"
                      required 
                      disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cvc" className="block mb-1 text-gray-300 font-[Open Sans]">CVC</label>
                    <input 
                      type="text" 
                      id="cvc" 
                      name="cvc" 
                      value={cardDetails.cvc} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="123"
                      maxLength="4"
                      required 
                      disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                    />
                  </div>
                </div>
                
                {paymentStatus === 'error' && (
                  <div className="mb-6 p-3 bg-red-900/50 border border-red-700 rounded-lg text-white">
                    <p className="font-[Open Sans]">{errorMessage || 'An error occurred processing your payment. Please try again.'}</p>
                  </div>
                )}
                
                {paymentStatus === 'success' && (
                  <div className="mb-6 p-3 bg-green-900/50 border border-green-700 rounded-lg text-white">
                    <p className="font-[Open Sans]">Payment successful! Redirecting to confirmation page...</p>
                  </div>
                )}
                
                <motion.button 
                  type="submit"
                  className={`px-8 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-all duration-300 font-[Raleway] w-full ${
                    paymentStatus === 'loading' ? 'opacity-70 cursor-not-allowed' : ''
                  } ${
                    paymentStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                  whileHover={paymentStatus === 'idle' ? { scale: 1.05 } : {}}
                  whileTap={paymentStatus === 'idle' ? { scale: 0.95 } : {}}
                  disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                >
                  {paymentStatus === 'loading' ? 'Processing...' : 
                   paymentStatus === 'success' ? 'Payment Successful!' :
                   `Pay $${total}`}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}

export default PaymentPage;