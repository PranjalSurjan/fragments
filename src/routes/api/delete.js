// src/routes/api/delete.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user;
    logger.debug({ ownerId, id }, 'DELETE /v1/fragments/:id');
    await Fragment.delete(ownerId, id);
    res.status(200).json(createSuccessResponse());
  } catch (err) {
    logger.error({ err }, 'Error deleting fragment');
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
