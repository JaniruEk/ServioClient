const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Health check route
router.get('/health', (req, res) => {
  res.send('Payment service is running');
});

// Create a payment intent
router.post('/create-intent', async (req, res) => {
  try {
    // Get amount from request body or use default
    const { amount = 1000, email, description, metadata = {} } = req.body;

    // Create a PaymentIntent with the amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount in cents
      currency: 'usd',
      receipt_email: email,
      description,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        integration_check: 'payment_intent_client_secret_demo'
      }
    });

    // Return the client secret to the client
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: error.message,
      statusCode: error.statusCode || 500
    });
  }
});

// Get payment details by ID
router.get('/details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    res.status(200).json(paymentIntent);
  } catch (error) {
    console.error('Error retrieving payment:', error);
    res.status(404).json({ error: 'Payment not found' });
  }
});

// Webhook to handle Stripe events
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    // Verify the webhook signature
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log(`Payment failed: ${failedPayment.id}`);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;