// notifications.js - Utility for showing notifications
import { toast } from 'react-toastify';

/**
 * Show a success notification
 * @param {string} message - The message to display
 * @param {Object} options - Optional toast configuration options
 */
export const showSuccess = (message, options = {}) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  });
};

/**
 * Show an error notification
 * @param {string} message - The message to display
 * @param {Object} options - Optional toast configuration options
 */
export const showError = (message, options = {}) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  });
};

/**
 * Show an info notification
 * @param {string} message - The message to display
 * @param {Object} options - Optional toast configuration options 
 */
export const showInfo = (message, options = {}) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  });
};

/**
 * Show a warning notification
 * @param {string} message - The message to display
 * @param {Object} options - Optional toast configuration options
 */
export const showWarning = (message, options = {}) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  });
};

export default {
  showSuccess,
  showError,
  showInfo,
  showWarning
};
