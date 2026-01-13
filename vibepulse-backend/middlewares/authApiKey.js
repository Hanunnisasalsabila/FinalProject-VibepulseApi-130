const ApiKey = require('../models/ApiKey');
const ApiUsage = require('../models/ApiUsage');

const authenticateApiKey = async (req, res, next) => {
    const startTime = Date.now();
    
    try {
        const userKey = req.header('x-api-key');

        if (!userKey) {
            return res.status(401).json({ 
                success: false,
                message: 'Akses ditolak. API Key tidak ditemukan di header.' 
            });
        }

        // Find API key
        const apiKey = await ApiKey.findOne({ 
            where: { 
                key: userKey,
                status: 'active'
            }
        });

        if (!apiKey) {
            return res.status(403).json({ 
                success: false,
                message: 'API Key tidak valid atau telah direvoke.' 
            });
        }

        // Check if key has expired
        if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
            return res.status(403).json({ 
                success: false,
                message: 'API Key telah expired.' 
            });
        }

        // Check daily quota
        if (apiKey.usedToday >= apiKey.dailyQuota) {
            return res.status(429).json({ 
                success: false,
                message: `Daily quota exceeded. Your limit is ${apiKey.dailyQuota} requests per day.`,
                quota: {
                    limit: apiKey.dailyQuota,
                    used: apiKey.usedToday,
                    remaining: 0
                }
            });
        }

        // Update usage
        apiKey.usedToday += 1;
        apiKey.totalRequests += 1;
        apiKey.lastUsedAt = new Date();
        await apiKey.save();

        // Attach API key info to request
        req.apiKey = apiKey;

        // Store original res.json to wrap response
        const originalJson = res.json.bind(res);
        
        // Wrap res.json to log after response
        res.json = function(data) {
            const responseTime = Date.now() - startTime;
            
            // Log API usage asynchronously (don't wait)
            ApiUsage.create({
                ApiKeyId: apiKey.id,
                UserId: apiKey.UserId,
                endpoint: req.originalUrl,
                method: req.method,
                statusCode: res.statusCode,
                responseTime,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent')
            }).catch(err => console.error('Failed to log API usage:', err));

            // Call original json method
            return originalJson(data);
        };

        next();
    } catch (error) {
        console.error('API Key authentication error:', error);
        const responseTime = Date.now() - startTime;
        
        // Log failed attempt
        if (req.apiKey) {
            ApiUsage.create({
                ApiKeyId: req.apiKey.id,
                UserId: req.apiKey.UserId,
                endpoint: req.originalUrl,
                method: req.method,
                statusCode: 500,
                responseTime,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent')
            }).catch(err => console.error('Failed to log API usage:', err));
        }

        return res.status(500).json({ 
            success: false,
            message: 'Error validasi API Key',
            error: error.message 
        });
    }
};

module.exports = authenticateApiKey;