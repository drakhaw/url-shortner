const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Hash a password
 * @param {string} password - The plain text password
 * @returns {Promise<string>} - The hashed password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with its hash
 * @param {string} password - The plain text password
 * @param {string} hash - The hashed password
 * @returns {Promise<boolean>} - Whether the password matches
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  comparePassword
};