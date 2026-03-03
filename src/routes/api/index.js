// src/routes/api/index.js
const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

const router = express.Router();

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch {
        return false;
      }
    },
  });

// Existing routes
router.get('/fragments', require('./get'));
router.post('/fragments', rawBody(), require('./post'));

// Lab 6 Step 21 / Assignment 2 Implementation
router.get('/fragments/:id', require('./getById'));
router.get('/fragments/:id/info', require('./getInfo'));

module.exports = router;
