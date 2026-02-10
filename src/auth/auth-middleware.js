//src/auth/auth-middleware.js

const passport = require('passport');
const hash = require('../hash');
const logger = require('../logger');
const { createErrorResponse } = require('../response');

/**
 * Middleware to authenticate a request using a specific passport strategy,
 * then hash the user's email to protect their privacy.
 */
module.exports = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user) => {
      if (err || !user) {
        logger.warn({ err }, 'Authentication failed');
        return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
      }

      // Hash the email (or user ID) and attach it to the request object.
      // Every route after this will use req.user as the HASHED identity.
      req.user = hash(user);
      logger.debug({ user: req.user }, 'User authenticated and ID hashed');
      next();
    })(req, res, next);
  };
};
