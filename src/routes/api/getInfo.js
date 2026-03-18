// src/routes/api/getInfo.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    // 1. Find the fragment metadata
    const fragment = await Fragment.byId(req.user, req.params.id);

    // 2. Return the fragment object inside a success response
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
