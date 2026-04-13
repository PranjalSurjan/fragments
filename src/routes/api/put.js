// src/routes/api/put.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  // 1. Check if the body was correctly parsed by the raw-body middleware
  // If req.body is not a Buffer, express.raw() might have failed or type was invalid
  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  try {
    const { id } = req.params;
    const ownerId = req.user;

    logger.debug({ ownerId, id }, 'PUT /v1/fragments/:id');

    // 2. Find the existing fragment by ID
    const fragment = await Fragment.byId(ownerId, id);

    // 3. Check that the content-type matches the fragment's existing type
    // You cannot change the type of an existing fragment
    const incomingType = req.headers['content-type'].split(';')[0].trim();
    const existingType = fragment.type.split(';')[0].trim();

    if (incomingType !== existingType) {
      return res.status(400).json(
        createErrorResponse(400, `Cannot change fragment type from ${fragment.type} to ${req.headers['content-type']}`)
      );
    }

    // 4. Update the fragment data
    await fragment.setData(req.body);

    // 5. Success! Return 200 with updated fragment metadata
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, 'Error updating fragment');
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
