const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Akses ditolak. Token tidak ditemukan.' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Token tidak valid' 
            });
        }

        // Check if user is blocked
        if (user.status === 'blocked') {
            return res.status(403).json({ 
                success: false,
                message: 'Akun Anda telah diblokir' 
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token tidak valid' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token telah expired' 
            });
        }

        return res.status(500).json({ 
            success: false,
            message: 'Error autentikasi',
            error: error.message 
        });
    }
};

module.exports = authenticateToken;