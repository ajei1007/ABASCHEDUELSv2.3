import axios from "axios";

export const openCustomerPortal = async () => {
  try {
    // Dynamically get the current origin (frontend URL)
    const returnUrl = window.location.origin; 

    // Pass the `return_url` to the backend as a query parameter or body
    const response = await axios.get(`${import.meta.env.REACT_APP_BACKEND_URL}/create-portal-session`, {
      params: {
        return_url: returnUrl, // Add the return URL 
      },
    });

    const { url } = response.data;
    window.location.href = url; // Redirect to the Stripe Customer Portal
  } catch (error) {
    console.error('Error opening customer portal:', error);
  }
};
