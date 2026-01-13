const rateLimit = require('express-rate-limit');

// General API rate limiter (prevents abuse even without API key)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth endpoints rate limiter (stricter for login/register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// API key generation limiter
const apiKeyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 API key generations per hour
    message: {
        success: false,
        message: 'Too many API key generation requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    apiKeyLimiter
};