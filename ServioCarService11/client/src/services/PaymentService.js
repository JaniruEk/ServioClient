import axios from 'axios';

const API_URL = 'http://localhost:5000/api/payment';

export const PaymentService = {
  createPaymentIntent: async (paymentData) => {
    try {
      const response = await axios.post(`${API_URL}/create-intent`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },
  
  getPaymentDetails: async (paymentId) => {
    try {
      const response = await axios.get(`${API_URL}/details/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  }
};

export default PaymentService;