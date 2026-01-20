// src/routes/api/get.js

/**
 * Get a list of fragments for the current user.
 * This is currently a placeholder that returns an empty list.
 */
module.exports = (req, res) => {
  // Return a 200 'OK' response with a placeholder empty fragments array
  res.status(200).json({
    status: 'ok',
    fragments: [],
  });
};
