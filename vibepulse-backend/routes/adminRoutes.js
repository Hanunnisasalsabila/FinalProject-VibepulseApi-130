const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const songController = require('../controllers/songController');
const authenticateToken = require('../middlewares/authJWT');
const { adminOnly } = require('../middlewares/checkRole');
const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'music') {
            cb(null, 'uploads/songs/');
        } else if (file.fieldname === 'cover') {
            cb(null, 'uploads/covers/');
        } else {
            cb(null, 'uploads/');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'music') {
            if (!file.mimetype.startsWith('audio/')) {
                return cb(new Error('File harus berupa audio'));
            }
        } else if (file.fieldname === 'cover') {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Cover harus berupa gambar'));
            }
        }
        cb(null, true);
    }
});

// All admin routes require authentication and admin role
router.use(authenticateToken, adminOnly);

// ============ USER MANAGEMENT ============

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user detail (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User detail
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   put:
 *     summary: Block user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User blocked
 */
router.put('/users/:id/block', adminController.blockUser);

/**
 * @swagger
 * /api/admin/users/{id}/unblock:
 *   put:
 *     summary: Unblock user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User unblocked
 */
router.put('/users/:id/unblock', adminController.unblockUser);

/**
 * @swagger
 * /api/admin/users/{id}/plan:
 *   put:
 *     summary: Update user plan (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [free, pro, enterprise]
 *     responses:
 *       200:
 *         description: User plan updated
 */
router.put('/users/:id/plan', adminController.updateUserPlan);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/users/:id', adminController.deleteUser);

// ============ ANALYTICS ============

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get system analytics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System analytics
 */
router.get('/analytics', adminController.getAnalytics);

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     summary: Get API usage logs (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: API logs
 */
router.get('/logs', adminController.getApiLogs);

// ============ SONG MANAGEMENT ============

/**
 * @swagger
 * /api/admin/songs:
 *   get:
 *     summary: Get all songs including inactive (Admin only)
 *     tags: [Admin - Songs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All songs
 */
router.get('/songs', songController.getAllSongsAdmin);

/**
 * @swagger
 * /api/admin/songs:
 *   post:
 *     summary: Create new song (Admin only)
 *     tags: [Admin - Songs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - artist
 *               - mood
 *               - music
 *             properties:
 *               title:
 *                 type: string
 *               artist:
 *                 type: string
 *               album:
 *                 type: string
 *               mood:
 *                 type: string
 *               genre:
 *                 type: string
 *               duration:
 *                 type: integer
 *               lyrics:
 *                 type: string
 *               music:
 *                 type: string
 *                 format: binary
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Song created
 */
router.post('/songs', upload.fields([
    { name: 'music', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), songController.createSong);

/**
 * @swagger
 * /api/admin/songs/{id}:
 *   put:
 *     summary: Update song (Admin only)
 *     tags: [Admin - Songs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Song updated
 */
router.put('/songs/:id', upload.fields([
    { name: 'music', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), songController.updateSong);

/**
 * @swagger
 * /api/admin/songs/{id}:
 *   delete:
 *     summary: Delete song (Admin only)
 *     tags: [Admin - Songs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Song deleted
 */
router.delete('/songs/:id', songController.deleteSong);

module.exports = router;