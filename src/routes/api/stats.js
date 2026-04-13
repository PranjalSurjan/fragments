// src/routes/api/stats.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user;

    logger.debug({ ownerId }, 'GET /v1/fragments/stats');

    // Get all fragments with full metadata (expand=true)
    const fragments = await Fragment.byUser(ownerId, true);

    // Calculate total fragments and total size
    const totalFragments = fragments.length;
    const totalSize = fragments.reduce((sum, f) => sum + (f.size || 0), 0);

    // Break down by type
    const byType = fragments.reduce((acc, f) => {
      const type = f.type.split(';')[0].trim();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Find largest and smallest fragments
    const largestFragment = fragments.reduce(
      (max, f) => (f.size > (max?.size || 0) ? f : max),
      null
    );
    const smallestFragment = fragments.reduce(
      (min, f) => (f.size < (min?.size || Infinity) ? f : min),
      null
    );

    res.status(200).json(
      createSuccessResponse({
        stats: {
          totalFragments,
          totalSize,
          byType,
          ...(largestFragment && {
            largestFragment: {
              id: largestFragment.id,
              type: largestFragment.type,
              size: largestFragment.size,
            },
          }),
          ...(smallestFragment && {
            smallestFragment: {
              id: smallestFragment.id,
              type: smallestFragment.type,
              size: smallestFragment.size,
            },
          }),
        },
      })
    );
  } catch (err) {
    logger.error({ err }, 'Error getting fragment stats');
    res.status(500).json(createErrorResponse(500, err.message));
  }
};
