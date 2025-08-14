const rateLimit = require('express-rate-limit');

// Rate limiter for comments
const commentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 comment requests per windowMs
  message: {
    status: 'error',
    message: 'Too many comment attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for posts
const postRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 post requests per windowMs
  message: {
    status: 'error',
    message: 'Too many post attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for general API requests
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  commentRateLimiter,
  postRateLimiter,
  generalRateLimiter
};




