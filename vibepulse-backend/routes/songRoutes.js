const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const authenticateApiKey = require('../middlewares/authApiKey');

// All song endpoints require API key
router.use(authenticateApiKey);

/**
 * @swagger
 * /api/songs:
 *   get:
 *     summary: Get all active songs with filters
 *     tags: [Songs API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: mood
 *         schema:
 *           type: string
 *         description: Filter by mood (focus, energetic, chill, etc)
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or artist
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of songs
 *       401:
 *         description: API Key tidak ditemukan
 *       403:
 *         description: API Key tidak valid
 *       429:
 *         description: Quota exceeded
 */
router.get('/', songController.getAllSongs);

/**
 * @swagger
 * /api/songs/random:
 *   get:
 *     summary: Get random songs
 *     tags: [Songs API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *       - in: query
 *         name: mood
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Random songs
 */
router.get('/random', songController.getRandomSongs);

/**
 * @swagger
 * /api/songs/moods:
 *   get:
 *     summary: Get list of available moods
 *     tags: [Songs API]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of available moods
 */
router.get('/moods', songController.getMoods);

/**
 * @swagger
 * /api/songs/mood/{mood}:
 *   get:
 *     summary: Get songs by mood
 *     tags: [Songs API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: mood
 *         required: true
 *         schema:
 *           type: string
 *           enum: [focus, energetic, chill, motivation, sad, happy]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Songs by mood
 */
router.get('/mood/:mood', songController.getSongsByMood);

/**
 * @swagger
 * /api/songs/{id}:
 *   get:
 *     summary: Get song by ID
 *     tags: [Songs API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Song detail
 *       404:
 *         description: Song not found
 */
router.get('/:id', songController.getSongById);

module.exports = router;