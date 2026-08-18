const stripe = require('stripe')
const express = require('express');
const CompaniesDBAPI = require('../../db/api/companies');
const router = express.Router();
const config = require('../../config');
// Middleware
router.use(express.json()); // Parse JSON bodies

// Endpoint to create Customer Portal session
router.get('/', async (req, res) => {
  let stripeClient = null
  if (config.stripe.secretKey) {
    stripeClient = stripe(config.stripe.secretKey)
  }
  if (!stripeClient) res.status(500).json({ error: 'Stripe API Key is not defined!' });
  try {
    const { roles } = req.user;
    const managePayments = roles[0]?.managePayments;
    const viewPayments = roles[0]?.viewPayments;

    // Ensure the user has at least one of the required permissions
    if (!managePayments && !viewPayments) {
      return res.status(403).json({ error: 'Permission denied: You do not have access to payments' });
    }

    const { return_url } = req.query;

    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const company = await CompaniesDBAPI.findBy({ id: companyId });

    if (!company || !company.stripeId) {
      return res.status(404).json({ error: 'Stripe ID not found for the company' });
    }

    const stripeId = company.stripeId;

    // Change portal config based on permissions
    let session;
    switch (true) {
      case managePayments:
        // Default portal configuration for managing payments
        session = await stripe.billingPortal.sessions.create({
          customer: stripeId,
          return_url: return_url,
        });
        break;

      case viewPayments:
        // Custom portal configuration for viewing invoice history
        const configuration = await stripe.billingPortal.configurations.create({
          features: {
            invoice_history: {
              enabled: true, // Only show invoice history
            },
          },
        });

        session = await stripe.billingPortal.sessions.create({
          customer: stripeId,
          return_url: return_url,
          configuration: configuration.id, // Use the created configuration
        });
        break;

      default:
        return res.status(403).json({ error: 'Permission denied: Invalid permissions' });
    }

    res.json({ url: session.url }); // Send the portal URL to the frontend
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
