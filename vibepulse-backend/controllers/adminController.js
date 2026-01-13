const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const ApiUsage = require('../models/ApiUsage');
const Song = require('../models/Song');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role, status } = req.query;
        const offset = (page - 1) * limit;

        // Build query conditions
        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }
        if (role) whereClause.role = role;
        if (status) whereClause.status = status;

        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            include: [{
                model: ApiKey,
                attributes: ['id', 'status', 'totalRequests']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil daftar users',
            error: error.message 
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: ApiKey,
                attributes: ['id', 'key', 'name', 'status', 'totalRequests', 'createdAt']
            }]
        });

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil user',
            error: error.message 
        });
    }
};

// @desc    Block user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
exports.blockUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User tidak ditemukan' 
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ 
                success: false,
                message: 'Tidak bisa memblokir admin' 
            });
        }

        user.status = 'blocked';
        await user.save();

        // Also revoke all active API keys
        await ApiKey.update(
            { status: 'revoked' },
            { where: { UserId: user.id, status: 'active' } }
        );

        res.json({
            success: true,
            message: 'User berhasil diblokir',
            data: user
        });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal memblokir user',
            error: error.message 
        });
    }
};

// @desc    Unblock user
// @route   PUT /api/admin/users/:id/unblock
// @access  Private/Admin
exports.unblockUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User tidak ditemukan' 
            });
        }

        user.status = 'active';
        await user.save();

        res.json({
            success: true,
            message: 'User berhasil di-unblock',
            data: user
        });
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal unblock user',
            error: error.message 
        });
    }
};

// @desc    Update user plan
// @route   PUT /api/admin/users/:id/plan
// @access  Private/Admin
exports.updateUserPlan = async (req, res) => {
    try {
        const { plan } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User tidak ditemukan' 
            });
        }

        if (!['free', 'pro', 'enterprise'].includes(plan)) {
            return res.status(400).json({ 
                success: false,
                message: 'Plan tidak valid' 
            });
        }

        user.plan = plan;
        await user.save();

        // Update quota for all active keys
        const quotas = { free: 100, pro: 10000, enterprise: 999999 };
        await ApiKey.update(
            { dailyQuota: quotas[plan] },
            { where: { UserId: user.id, status: 'active' } }
        );

        res.json({
            success: true,
            message: 'Plan user berhasil diupdate',
            data: user
        });
    } catch (error) {
        console.error('Update user plan error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal update plan user',
            error: error.message 
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User tidak ditemukan' 
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ 
                success: false,
                message: 'Tidak bisa menghapus admin' 
            });
        }

        // Delete related data first
        await ApiUsage.destroy({ where: { UserId: user.id } });
        await ApiKey.destroy({ where: { UserId: user.id } });
        await user.destroy();

        res.json({
            success: true,
            message: 'User berhasil dihapus'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal menghapus user',
            error: error.message 
        });
    }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
    try {
        // Total counts
        const totalUsers = await User.count();
        const totalDevelopers = await User.count({ where: { role: 'developer' } });
        const totalApiKeys = await ApiKey.count();
        const activeApiKeys = await ApiKey.count({ where: { status: 'active' } });
        const totalSongs = await Song.count();

        // API Usage stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayRequests = await ApiUsage.count({
            where: {
                createdAt: { [Op.gte]: today }
            }
        });

        const totalRequests = await ApiUsage.count();

        // Average response time
        const avgResponseTime = await ApiUsage.findOne({
            attributes: [[sequelize.fn('AVG', sequelize.col('responseTime')), 'avgTime']],
            where: {
                createdAt: { [Op.gte]: today }
            },
            raw: true
        });

        // Success rate (status code 2xx)
        const successRequests = await ApiUsage.count({
            where: {
                createdAt: { [Op.gte]: today },
                statusCode: { [Op.between]: [200, 299] }
            }
        });
        const successRate = todayRequests > 0 ? ((successRequests / todayRequests) * 100).toFixed(2) : 0;

        // Top users by API calls
        const topUsers = await ApiUsage.findAll({
        attributes: [
            'UserId',
            // GANTI BARIS DI BAWAH INI:
            [sequelize.fn('COUNT', sequelize.col('ApiUsage.id')), 'requestCount'] 
        ],
        include: [{
            model: User,
            attributes: ['username', 'email', 'plan']
        }],
        group: ['UserId', 'User.id', 'User.username', 'User.email', 'User.plan'], // Pastikan group juga lengkap
        order: [[sequelize.col('requestCount'), 'DESC']],
        limit: 5
        });

        // Popular endpoints
        const popularEndpoints = await ApiUsage.findAll({
            attributes: [
                'endpoint',
                'method',
                [sequelize.fn('COUNT', sequelize.col('id')), 'hitCount']
            ],
            where: {
                createdAt: { [Op.gte]: today }
            },
            group: ['endpoint', 'method'],
            order: [[sequelize.literal('hitCount'), 'DESC']],
            limit: 5,
            raw: true
        });

        // Recent API calls
        const recentCalls = await ApiUsage.findAll({
            include: [{
                model: User,
                attributes: ['username']
            }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalDevelopers,
                    totalApiKeys,
                    activeApiKeys,
                    totalSongs,
                    totalRequests,
                    todayRequests,
                    avgResponseTime: Math.round(avgResponseTime?.avgTime || 0),
                    successRate: parseFloat(successRate)
                },
                topUsers,
                popularEndpoints,
                recentCalls
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil analytics',
            error: error.message 
        });
    }
};

// @desc    Get API usage logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getApiLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, userId, endpoint, statusCode } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (userId) whereClause.UserId = userId;
        if (endpoint) whereClause.endpoint = { [Op.like]: `%${endpoint}%` };
        if (statusCode) whereClause.statusCode = statusCode;

        const { count, rows: logs } = await ApiUsage.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                attributes: ['username', 'email']
            }, {
                model: ApiKey,
                attributes: ['key', 'name']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get API logs error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil logs',
            error: error.message 
        });
    }
};