// src/routes/api/getById.js
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    // 1. Find the fragment metadata
    const fragment = await Fragment.byId(req.user, req.params.id);

    // 2. Get the actual binary data
    const data = await fragment.getData();

    // 3. Send the data with the correct Content-Type header
    res.status(200)
      .set('Content-Type', fragment.type)
      .send(data);
  } catch (err) {
    // If Fragment.byId throws because it's not found, return 404
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
