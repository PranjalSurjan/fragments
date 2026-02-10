const crypto = require('crypto');

/**
 * Creates a SHA-256 hash of the provided email string.
 * @param {string} email - The email to hash.
 * @returns {string} - The hex-encoded hash.
 */
module.exports = (email) => crypto.createHash('sha256').update(email).digest('hex');
