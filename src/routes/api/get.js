// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragment ids (or objects if expand=1) for the current user.
 */
module.exports = async (req, res) => {
  // Check if the query parameter 'expand' is set to '1'
  const expand = req.query.expand === '1';

  const fragments = await Fragment.byUser(req.user, expand);

  res.status(200).json(
    createSuccessResponse({
      fragments: fragments,
    })
  );
};
