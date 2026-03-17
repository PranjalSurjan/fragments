// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user.
 * Supports ?expand=1 to return full metadata objects.
 */
module.exports = async (req, res) => {
  try {
    // 1. Determine if the user wants expanded metadata
    // We check if the query string contains expand=1
    const expand = req.query.expand === '1';

    // 2. Fetch fragments for the authenticated user
    // We pass the expand boolean to our updated Fragment.byUser method
    const fragments = await Fragment.byUser(req.user, expand);

    // 3. Return the results in a success response
    res.status(200).json(
      createSuccessResponse({
        fragments: fragments,
      })
    );
  } catch (err) {
    // While app.js handles global errors, explicit logging or status 500
    // here ensures we follow the API spec for unexpected failures.
    res.status(500).json(createErrorResponse(500, err.message));
  }
};
