/**
 * Utility functions for the Smart Service Flow application
 */

/**
 * Creates a URL for the specified page
 * @param {string} pageName - The name of the page
 * @returns {string} - The URL for the page
 */
export function createPageUrl(pageName) {
  if (!pageName) return '/';
  return `/${pageName}`;
}

/**
 * Formats a price in the appropriate currency format
 * @param {number} price - The price to format
 * @returns {string} - The formatted price
 */
export function formatPrice(price) {
  if (typeof price !== 'number') return '₪0.00';
  return `₪${price.toFixed(2)}`;
}

/**
 * Generates a unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} - A unique ID
 */
export function generateId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Navigate to a role-specific page
 * @param {string} role - The role to navigate to
 */
export function navigateToRolePage(role) {
  if (role === "manager") {
    window.location.assign("/Dashboard");
  } else if (role === "staff") {
    window.location.assign("/ServiceRequests");
  } else {
    window.location.assign("/Customer");
  }
}

// Add default export as an object containing all utility functions
export default {
  createPageUrl,
  formatPrice,
  generateId,
  navigateToRolePage
};