const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
// Kita tetap pakai middleware auth & limiter dari file lama kamu
const authenticateToken = require('../middlewares/authJWT'); 
const { apiKeyLimiter } = require('../middlewares/rateLimiter');

// @route   POST /api/keys/generate
// @desc    Create new API Key (Hanya boleh 1 per user)
// Menggunakan 'createApiKey' (sesuai controller baru)
router.post('/generate', authenticateToken, apiKeyLimiter, apiKeyController.createApiKey);

// @route   GET /api/keys
// @desc    Get user API Keys
// Menggunakan 'getMyApiKeys' (sesuai controller baru)
router.get('/', authenticateToken, apiKeyController.getMyApiKeys);

// @route   GET /api/keys/:id
// @desc    Get user API Keys by id
router.get('/:id', authenticateToken, apiKeyController.getKeyById);

// @route   GET /api/keys/:id
// @desc    Update name user API Keys by id
router.put('/:id', authenticateToken, apiKeyController.updateApiKeyName);

// @route   PUT /api/keys/:id/regenerate
// @desc    Regenerate API Key (Update string key lama)
router.put('/:id/regenerate', authenticateToken, apiKeyController.regenerateApiKey);

// @route   DELETE /api/keys/:id
// @desc    Revoke/Delete API Key
router.delete('/:id', authenticateToken, apiKeyController.revokeApiKey);

module.exports = router;