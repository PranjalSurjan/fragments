// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragment ids for the current user.
 */
module.exports = async (req, res) => {
  // No try/catch needed here; app.js handles the failure
  const ids = await Fragment.byUser(req.user);
  res.status(200).json(
    createSuccessResponse({
      fragments: ids,
    })
  );
};
