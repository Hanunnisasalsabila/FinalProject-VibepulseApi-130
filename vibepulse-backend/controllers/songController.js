const Song = require('../models/Song');
const { Op } = require('sequelize');
const fs = require('fs');   // 👈 TAMBAH INI
const path = require('path'); // 👈 TAMBAH INI

// @desc    Get all songs with filters (PUBLIC API - requires API key)
// @route   GET /api/songs
// @access  Public with API Key
exports.getAllSongs = async (req, res) => {
    try {
        const { mood, genre, page = 1, limit = 20, search } = req.query;
        const offset = (page - 1) * limit;

        // Build query conditions
        const whereClause = { isActive: true };
        if (mood) whereClause.mood = mood;
        if (genre) whereClause.genre = { [Op.like]: `%${genre}%` };
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { artist: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: songs } = await Song.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: songs.length,
            total: count,
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit)
            },
            data: songs
        });
    } catch (error) {
        console.error('Get all songs error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil daftar lagu',
            error: error.message 
        });
    }
};

// @desc    Get song by ID (PUBLIC API - requires API key)
// @route   GET /api/songs/:id
// @access  Public with API Key
exports.getSongById = async (req, res) => {
    try {
        const song = await Song.findOne({
            where: { 
                id: req.params.id,
                isActive: true 
            }
        });

        if (!song) {
            return res.status(404).json({ 
                success: false,
                message: 'Lagu tidak ditemukan' 
            });
        }

        // Increment play count
        song.playCount += 1;
        await song.save();

        res.json({
            success: true,
            data: song
        });
    } catch (error) {
        console.error('Get song error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil lagu',
            error: error.message 
        });
    }
};

// @desc    Get songs by mood (PUBLIC API - requires API key)
// @route   GET /api/songs/mood/:mood
// @access  Public with API Key
exports.getSongsByMood = async (req, res) => {
    try {
        const { mood } = req.params;
        const { limit = 10 } = req.query;

        const songs = await Song.findAll({
            where: { 
                mood,
                isActive: true 
            },
            limit: parseInt(limit),
            order: [['playCount', 'DESC']]
        });

        res.json({
            success: true,
            mood,
            count: songs.length,
            data: songs
        });
    } catch (error) {
        console.error('Get songs by mood error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil lagu berdasarkan mood',
            error: error.message 
        });
    }
};

// @desc    Get random songs (PUBLIC API - requires API key)
// @route   GET /api/songs/random
// @access  Public with API Key
exports.getRandomSongs = async (req, res) => {
    try {
        const { limit = 5, mood } = req.query;
        const whereClause = { isActive: true };
        if (mood) whereClause.mood = mood;

        const songs = await Song.findAll({
            where: whereClause,
            order: require('sequelize').literal('RAND()'),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            count: songs.length,
            data: songs
        });
    } catch (error) {
        console.error('Get random songs error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil random lagu',
            error: error.message 
        });
    }
};

// @desc    Get list of available moods (PUBLIC API)
// @route   GET /api/songs/moods
// @access  Public
exports.getMoods = async (req, res) => {
    try {
        const moods = [
            { id: 'focus', label: 'Focus', description: 'Deep work & concentration' },
            { id: 'energetic', label: 'Energetic', description: 'High energy vibes' },
            { id: 'chill', label: 'Chill', description: 'Relax & unwind' },
            { id: 'motivation', label: 'Motivation', description: 'Push your limits' }
        ];

        res.json({
            success: true,
            count: moods.length,
            data: moods
        });
    } catch (error) {
        console.error('Get moods error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil mood' });
    }
};

// ============ ADMIN ONLY ENDPOINTS ============

// @desc    Create song (Admin only)
// @route   POST /api/admin/songs
// @access  Private/Admin
exports.createSong = async (req, res) => {
    try {
        const { title, artist, album, mood, genre, duration, lyrics } = req.body;
        
        let file_url = null;
        let cover_url = null;

        // Handle file uploads
        if (req.files) {
            if (req.files.music) {
                file_url = req.files.music[0].filename;
            }
            if (req.files.cover) {
                cover_url = req.files.cover[0].filename;
            }
        }

        if (!file_url) {
            return res.status(400).json({ 
                success: false,
                message: 'File musik wajib diupload' 
            });
        }

        const song = await Song.create({
            title,
            artist,
            album,
            mood,
            genre,
            duration: parseInt(duration) || null,
            file_url,
            cover_url,
            lyrics
        });

        res.status(201).json({
            success: true,
            message: 'Lagu berhasil ditambahkan',
            data: song
        });
    } catch (error) {
        console.error('Create song error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal menambahkan lagu',
            error: error.message 
        });
    }
};

// @desc    Update song (Admin only)
// @route   PUT /api/admin/songs/:id
// @access  Private/Admin
// @desc    Update song (Termasuk Status Active/Inactive & Hapus file lama)
exports.updateSong = async (req, res) => {
    try {
        const song = await Song.findByPk(req.params.id);

        if (!song) {
            return res.status(404).json({ success: false, message: 'Lagu tidak ditemukan' });
        }

        const { title, artist, album, mood, genre, duration, lyrics, isActive } = req.body;

        // Update data text
        if (title) song.title = title;
        if (artist) song.artist = artist;
        if (album) song.album = album;
        if (mood) song.mood = mood;
        if (genre) song.genre = genre;
        if (duration) song.duration = parseInt(duration);
        if (lyrics !== undefined) song.lyrics = lyrics;
        
        // 🟢 UPDATE STATUS (Active/Inactive)
        if (isActive !== undefined) {
            // Konversi string "true"/"false" dari FormData jadi Boolean
            song.isActive = (isActive === 'true' || isActive === true);
        }

        // Handle file updates (Hapus file lama kalau ada file baru)
        if (req.files) {
            if (req.files.music) {
                // Hapus file lama jika ada
                if (song.file_url) {
                    const oldPath = path.join(__dirname, '../uploads/songs', song.file_url);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                song.file_url = req.files.music[0].filename;
            }
            if (req.files.cover) {
                // Hapus cover lama jika ada
                if (song.cover_url) {
                    const oldPath = path.join(__dirname, '../uploads/covers', song.cover_url);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                song.cover_url = req.files.cover[0].filename;
            }
        }

        await song.save();

        res.json({ success: true, message: 'Lagu berhasil diupdate', data: song });
    } catch (error) {
        console.error('Update song error:', error);
        res.status(500).json({ success: false, message: 'Gagal update lagu', error: error.message });
    }
};

// @desc    Delete song (Admin only)
// @route   DELETE /api/admin/songs/:id
// @access  Private/Admin
exports.deleteSong = async (req, res) => {
    try {
        const song = await Song.findByPk(req.params.id);

        if (!song) {
            return res.status(404).json({ success: false, message: 'Lagu tidak ditemukan' });
        }

        // 🟢 1. Hapus File Musik Fisik
        if (song.file_url) {
            const musicPath = path.join(__dirname, '../uploads/songs', song.file_url);
            if (fs.existsSync(musicPath)) {
                fs.unlinkSync(musicPath); 
            }
        }

        // 🟢 2. Hapus File Cover Fisik
        if (song.cover_url) {
            const coverPath = path.join(__dirname, '../uploads/covers', song.cover_url);
            if (fs.existsSync(coverPath)) {
                fs.unlinkSync(coverPath); 
            }
        }

        // 🟢 3. Hapus Record Database Permanen
        await song.destroy();

        res.json({ success: true, message: 'Lagu dan file berhasil dihapus permanen' });
    } catch (error) {
        console.error('Delete song error:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus lagu', error: error.message });
    }
};

// @desc    Get all songs including inactive (Admin only)
// @route   GET /api/admin/songs
// @access  Private/Admin
exports.getAllSongsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, mood, isActive } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (mood) whereClause.mood = mood;
        if (isActive !== undefined) whereClause.isActive = isActive === 'true';
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { artist: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: songs } = await Song.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                songs,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all songs admin error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil daftar lagu',
            error: error.message 
        });
    }
};