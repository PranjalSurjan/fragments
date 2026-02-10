//src/routes/v1/index.js

const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

const router = express.Router();

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // Parse the content type to check if it's supported before parsing the body
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// POST /v1/fragments - Use the raw body parser for this route
router.post('/fragments', rawBody(), require('./post'));

// GET /v1/fragments - To return list of authenticated user's fragment IDs
router.get('/fragments', require('./get'));

module.exports = router;
