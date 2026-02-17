// src/routes/api/index.js

const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

const router = express.Router();

// Support sending various Content-Types on the body up to 5M in size.
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',


    type: (req) => {
      // Defensive parsing to prevent synchronous crashes
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch {
        // If the header is missing or invalid, we return false
        // stops the parser, keeps the server alive
        return false;
      }
    },
  });

// GET /v1/fragments
router.get('/fragments', require('./get'));

// POST /v1/fragments - Use raw body parser 
router.post('/fragments', rawBody(), require('./post'));

module.exports = router;
