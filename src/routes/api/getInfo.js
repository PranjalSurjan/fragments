// src/routes/api/getInfo.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get the metadata for a specific fragment by ID
 */
module.exports = async (req, res) => {
  try {
    // Use the static Fragment.byId method to fetch real metadata
    // req.user is the ownerId, req.params.id is the :id from the URL
    const fragment = await Fragment.byId(req.user, req.params.id);

    res.status(200).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (err) {
    // If Fragment.byId throws because the ID doesn't exist, return 404
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
