const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        // Validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const { username, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ 
            where: { 
                [require('sequelize').Op.or]: [{ email }, { username }] 
            } 
        });

        if (userExists) {
            return res.status(400).json({ 
                success: false,
                message: 'Username atau email sudah terdaftar' 
            });
        }

        // Create user (password will be hashed automatically by model hook)
        const user = await User.create({
            username,
            email,
            password,
            role: role || 'developer'
        });

        // Generate token
        const token = generateToken(user.id, user.role);

        res.status(201).json({
            success: true,
            message: 'User berhasil didaftarkan',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    plan: user.plan
                },
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mendaftar user',
            error: error.message 
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        // Validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const { username, password } = req.body;

        // Find user by username or email
        const user = await User.findOne({ 
            where: { 
                [require('sequelize').Op.or]: [
                    { username },
                    { email: username }
                ]
            } 
        });

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Username atau password salah' 
            });
        }

        // Check if user is blocked
        if (user.status === 'blocked') {
            return res.status(403).json({ 
                success: false,
                message: 'Akun Anda telah diblokir. Hubungi admin.' 
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: 'Username atau password salah' 
            });
        }

        // Generate token
        const token = generateToken(user.id, user.role);

        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    plan: user.plan,
                    status: user.status
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal login',
            error: error.message 
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
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
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil profile',
            error: error.message 
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User tidak ditemukan' 
            });
        }

        // Check if username/email already taken by other user
        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ where: { username } });
            if (usernameExists) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Username sudah digunakan' 
                });
            }
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ where: { email } });
            if (emailExists) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Email sudah digunakan' 
                });
            }
        }

        // Update user
        if (username) user.username = username;
        if (email) user.email = email;
        await user.save();

        res.json({
            success: true,
            message: 'Profile berhasil diupdate',
            data: user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal update profile',
            error: error.message 
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User tidak ditemukan' 
            });
        }

        // Check current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: 'Password lama salah' 
            });
        }

        // Update password (will be hashed by model hook)
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password berhasil diubah'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengubah password',
            error: error.message 
        });
    }
};