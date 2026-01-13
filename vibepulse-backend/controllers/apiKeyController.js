const ApiKey = require('../models/ApiKey');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Helper: Bikin random string untuk API Key
const generateKeyString = () => {
    const prefix = 'VIBEPULSE';
    const random = crypto.randomBytes(12).toString('hex').toUpperCase();
    // Hasil: VIBEPULSE-4A2B...
    return `${prefix}-${random.substring(0, 4)}-${random.substring(4, 8)}-${random.substring(8, 12)}`;
};

// @desc    Generate New API Key
// @route   POST /api/keys/generate
exports.createApiKey = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. CEK DULU: Apakah user sudah punya key?
        const existingKey = await ApiKey.findOne({ 
            where: { UserId: userId } 
        });

        // 2. JIKA SUDAH PUNYA -> TOLAK (User cuma boleh punya 1)
        if (existingKey) {
            return res.status(400).json({
                success: false,
                message: 'Anda sudah memiliki API Key. Gunakan tombol Regenerate jika ingin menggantinya.'
            });
        }

        // 3. JIKA BELUM PUNYA -> BUAT BARU (CREATE)
        const newKey = await ApiKey.create({
            key: generateKeyString(),
            name: req.body.name || 'My API Key',
            UserId: userId,
            dailyQuota: 100, // Default quota
            status: 'active'
        });

        res.status(201).json({
            success: true,
            data: newKey,
            message: 'API Key berhasil dibuat'
        });

    } catch (error) {
        console.error('Create API Key Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat API Key',
            error: error.message
        });
    }
};

// @desc    Regenerate API Key (Ganti kode lama dengan baru)
// @route   PUT /api/keys/:id/regenerate
exports.regenerateApiKey = async (req, res) => {
    try {
        const userId = req.user.id;
        const keyId = req.params.id;

        // 1. CARI KEY YANG MAU DI-REGENERATE
        const apiKey = await ApiKey.findOne({
            where: { 
                id: keyId,
                UserId: userId 
            }
        });

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                message: 'API Key tidak ditemukan'
            });
        }

        // 2. UPDATE STRING KEY-NYA SAJA (JANGAN CREATE BARU)
        apiKey.key = generateKeyString();
        apiKey.status = 'active'; // Pastikan aktif lagi kalau tadinya revoked
        
        // 3. SIMPAN PERUBAHAN (UPDATE)
        await apiKey.save(); 

        res.json({
            success: true,
            data: apiKey,
            message: 'API Key berhasil diperbarui (Regenerated)'
        });

    } catch (error) {
        console.error('Regenerate API Key Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui API Key',
            error: error.message
        });
    }
};

// @desc    Get User API Keys
// @route   GET /api/keys
exports.getMyApiKeys = async (req, res) => {
    try {
        const apiKeys = await ApiKey.findAll({
            where: { UserId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: apiKeys.length,
            data: apiKeys
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data API Key',
            error: error.message
        });
    }
};

// @desc    Get Single API Key by ID
// @route   GET /api/keys/:id
exports.getKeyById = async (req, res) => {
    try {
        const apiKey = await ApiKey.findOne({
            where: { 
                id: req.params.id,
                UserId: req.user.id
            }
        });

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                message: 'API Key tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: apiKey
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail API Key',
            error: error.message
        });
    }
};

// @desc    Update API Key Name
// @route   PUT /api/keys/:id
exports.updateApiKeyName = async (req, res) => {
    try {
        const apiKey = await ApiKey.findOne({
            where: { 
                id: req.params.id,
                UserId: req.user.id
            }
        });

        if (!apiKey) {
            return res.status(404).json({ success: false, message: 'Key not found' });
        }

        apiKey.name = req.body.name || apiKey.name;
        await apiKey.save();

        res.json({ success: true, message: 'Nama API Key berhasil diupdate', data: apiKey });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Revoke/Delete API Key
// @route   DELETE /api/keys/:id
exports.revokeApiKey = async (req, res) => {
    try {
        const apiKey = await ApiKey.findOne({
            where: { 
                id: req.params.id,
                UserId: req.user.id
            }
        });

        if (!apiKey) {
            return res.status(404).json({ success: false, message: 'Key not found' });
        }

        // Opsi A: Hapus Permanen
        await apiKey.destroy();
        
        // Opsi B: Cuma Non-aktifkan (Uncomment kalau mau soft delete)
        // apiKey.status = 'revoked';
        // await apiKey.save();

        res.json({ success: true, message: 'API Key berhasil dihapus' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};