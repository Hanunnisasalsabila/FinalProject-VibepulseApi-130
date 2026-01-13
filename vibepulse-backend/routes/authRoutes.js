const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authJWT');
const { authLimiter } = require('../middlewares/rateLimiter');

// Validation rules
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username harus 3-50 karakter'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email tidak valid'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password minimal 6 karakter')
];

const loginValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username/email wajib diisi'),
    body('password')
        .notEmpty()
        .withMessage('Password wajib diisi')
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user baru
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [developer, admin]
 *                 default: developer
 *     responses:
 *       201:
 *         description: User berhasil didaftarkan
 *       400:
 *         description: Validation error atau user sudah ada
 */
router.post('/register', authLimiter, registerValidation, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username atau email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Username atau password salah
 */
router.post('/login', authLimiter, loginValidation, authController.login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', authenticateToken, authController.updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change password
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 */
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;