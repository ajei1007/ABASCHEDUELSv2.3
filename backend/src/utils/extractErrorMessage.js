/**
 * Extracts a meaningful error message from various error sources
 * @param {Error|Object} error - Error object from axios or custom error
 * @returns {String} Formatted error message
 */
const extractErrorMessage = (error) => {
  // Handle axios response errors
  if (error.response?.data) {
    return (
      error.response.data.msg ||
      error.response.data.message ||
      `HTTP ${error.response.status}: ${error.response.statusText}`
    );
  }

  // Handle axios request errors
  if (error.request) {
    return 'Network error: Unable to reach TherapyPMS API';
  }

  // Handle custom Error objects
  if (error.message) {
    return error.message;
  }

  // Handle string errors or unknown error types
  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error occurred';
};

module.exports = extractErrorMessage;
