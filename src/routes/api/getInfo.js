//src/routes/api/getInfo.js


const { createSuccessResponse } = require('../../response');

module.exports = (req, res) => {
  res.status(200).json(
    createSuccessResponse({
      fragment: {
        id: req.params.id,
        ownerId: req.user,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        type: 'text/plain',
        size: 0,
      },
    })
  );
};
