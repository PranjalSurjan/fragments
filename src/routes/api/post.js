// src/routes/api/post.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  // 1. Check if the body was correctly parsed by the raw-body middleware
  // If req.body is not a Buffer, express.raw() might have failed or type was invalid
  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  try {
    // 2. Create a new Fragment metadata object
    const fragment = new Fragment({
      ownerId: req.user,
      type: req.headers['content-type'],
    });

    // 3. Save the actual fragment data (req.body is the Buffer)
    await fragment.save();
    await fragment.setData(req.body);

    // 4. Build the Location URL for the new fragment
    // API_URL should be in your .env (e.g., http://98.81.60.232:8080)
    const url = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const location = `${url}/v1/fragments/${fragment.id}`;

    // 5. Success! Return 201 with metadata and Location header
    res.status(201)
      .set('Location', location)
      .json(createSuccessResponse({ fragment }));

  } catch (err) {
    res.status(500).json(createErrorResponse(500, err.message));
  }
};
