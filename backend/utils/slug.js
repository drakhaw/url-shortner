const crypto = require('crypto');

/**
 * Generate a random slug
 * @param {number} length - The length of the slug (default: 6)
 * @returns {string} - The generated slug
 */
function generateSlug(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validate a custom slug
 * @param {string} slug - The slug to validate
 * @returns {boolean} - Whether the slug is valid
 */
function isValidSlug(slug) {
  // Only allow alphanumeric characters, hyphens, and underscores
  // Length between 3-50 characters
  const slugRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return slugRegex.test(slug);
}

/**
 * Hash IP address for privacy
 * @param {string} ip - The IP address to hash
 * @returns {string} - The hashed IP
 */
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex');
}

module.exports = {
  generateSlug,
  isValidSlug,
  hashIP
};