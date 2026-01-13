// Middleware to check if user has required role
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized. Please login first.' 
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: 'Akses ditolak. Anda tidak memiliki permission untuk endpoint ini.' 
            });
        }

        next();
    };
};

// Shorthand middleware for admin only
const adminOnly = checkRole('admin');

// Shorthand middleware for developer only
const developerOnly = checkRole('developer');

module.exports = {
    checkRole,
    adminOnly,
    developerOnly
};