// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression'); // New: Add compression
const passport = require('passport');
const { createErrorResponse } = require('./response');

const authenticate = require('./auth');
const logger = require('./logger');
const pino = require('pino-http')({
  logger,
});

// Create an express app instance
const app = express();

// Use pino logging middleware
app.use(pino);

// Use helmet security middleware
app.use(helmet());

// Use CORS middleware
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// --- PASSPORT CONFIGURATION ---

// Set up our passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Define our routes - this points to src/routes/index.js
app.use('/', require('./routes'));

// --- ERROR HANDLING ---

// Add 404 middleware
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';
  res.status(status).json(createErrorResponse(status, message));
});

module.exports = app;
