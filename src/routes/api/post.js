// src/routes/api/post.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  // 1. Validate that we actually received a Buffer from the raw body parser
  if (!Buffer.isBuffer(req.body)) {
    logger.warn('POST /fragments received non-buffer data or unsupported type');
    return res.status(415).json(createErrorResponse(415, 'Unsupported Content-Type'));
  }

  try {
    // 2. Create a new Fragment instance using the hashed user ID
    const fragment = new Fragment({
      ownerId: req.user, // The hashed email from our auth-middleware
      type: req.headers['content-type'],
    });

    // 3. Save the fragment metadata and the actual data buffer
    await fragment.save();
    await fragment.setData(req.body);

    logger.info({ fragmentId: fragment.id }, 'Fragment created and data saved');

    // 4. Construct the full URL for the Location header
    // We use the API_URL env var if it exists, otherwise fall back to the host header
    const api_url = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const location = `${api_url}/v1/fragments/${fragment.id}`;

    // 5. Send the 201 Created response with the required headers and JSON
    res.setHeader('Location', location);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, 'Error in POST /fragments');
    res.status(500).json(createErrorResponse(500, 'Unable to create fragment'));
  }
};
