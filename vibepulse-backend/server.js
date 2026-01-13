const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ============ DATABASE & MODELS ============
const { connectDB, sequelize } = require('./config/db');
const User = require('./models/User');
const Song = require('./models/Song');
const ApiKey = require('./models/ApiKey');
const ApiUsage = require('./models/ApiUsage');

// ============ ROUTES ============
const authRoutes = require('./routes/authRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const songRoutes = require('./routes/songRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ============ SWAGGER DOCUMENTATION ============
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// ============ MIDDLEWARE ============
const { generalLimiter } = require('./middlewares/rateLimiter');

// CORS Configuration
const corsOptions = {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply general rate limiter
app.use(generalLimiter);

// ============ SWAGGER CONFIGURATION ============
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '🎵 VibePulse Open API',
            version: '1.0.0',
            description: 'Music API for Developers - Curated indie music untuk nemenin coding & study sessions',
            contact: {
                name: 'VibePulse Team',
                email: 'support@vibepulse.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Development Server'
            }
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                    description: 'Masukkan API Key kamu. Dapatkan di dashboard setelah register.'
                },
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token dari login. Format: Bearer {token}'
                }
            }
        },
        tags: [
            { name: 'Authentication', description: 'Register, login, dan profile management' },
            { name: 'API Keys', description: 'Generate dan manage API keys' },
            { name: 'Songs API', description: 'Public API endpoints (requires API key)' },
            { name: 'Admin', description: 'Admin only endpoints untuk user management' },
            { name: 'Admin - Songs', description: 'Admin only endpoints untuk song management' }
        ]
    },
    apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Swagger UI customization
const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'VibePulse API Docs',
    customfavIcon: '/favicon.ico'
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));

// ============ API ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/admin', adminRoutes);

// ============ ROOT ENDPOINT ============
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to VibePulse Open API! 🎵',
        version: '1.0.0',
        documentation: `http://localhost:${process.env.PORT || 5000}/api-docs`,
        endpoints: {
            auth: '/api/auth',
            apiKeys: '/api/keys',
            songs: '/api/songs',
            admin: '/api/admin'
        },
        howToStart: {
            step1: 'Register akun di /api/auth/register',
            step2: 'Login di /api/auth/login untuk dapat JWT token',
            step3: 'Generate API key di /api/keys/generate (gunakan JWT token)',
            step4: 'Gunakan API key untuk akses /api/songs endpoints',
            step5: 'Baca dokumentasi lengkap di /api-docs'
        }
    });
});

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: 'File upload error',
            error: err.message
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// ============ DATABASE RELATIONSHIPS ============
const setupAssociations = () => {
    // User has many ApiKeys
    User.hasMany(ApiKey, { foreignKey: 'UserId', onDelete: 'CASCADE' });
    ApiKey.belongsTo(User, { foreignKey: 'UserId' });

    // ApiKey has many ApiUsage logs
    ApiKey.hasMany(ApiUsage, { foreignKey: 'ApiKeyId', onDelete: 'CASCADE' });
    ApiUsage.belongsTo(ApiKey, { foreignKey: 'ApiKeyId' });

    // User has many ApiUsage logs
    User.hasMany(ApiUsage, { foreignKey: 'UserId', onDelete: 'CASCADE' });
    ApiUsage.belongsTo(User, { foreignKey: 'UserId' });

    console.log('✅ Database associations configured');
};

// ============ CREATE DEFAULT ADMIN ============
const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ where: { role: 'admin' } });
        
        if (!adminExists) {
            await User.create({
                username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
                email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@vibepulse.com',
                password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
                role: 'admin',
                plan: 'enterprise'
            });
            console.log('✅ Default admin account created');
            console.log(`   Username: ${process.env.DEFAULT_ADMIN_USERNAME || 'admin'}`);
            console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`);
            console.log('   ⚠️  GANTI PASSWORD SETELAH FIRST LOGIN!');
        }
    } catch (error) {
        console.error('❌ Error creating default admin:', error);
    }
};

// ============ CREATE UPLOAD DIRECTORIES ============
const fs = require('fs');
const createUploadDirs = () => {
    const dirs = [
        'uploads',
        'uploads/songs',
        'uploads/covers'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }
    });
};

// ============ DAILY RESET JOB (Reset API usage) ============
const resetDailyUsage = async () => {
    try {
        await ApiKey.update(
            { usedToday: 0 },
            { where: { status: 'active' } }
        );
        console.log('✅ Daily API usage reset completed');
    } catch (error) {
        console.error('❌ Error resetting daily usage:', error);
    }
};

// Run daily reset at midnight (00:00)
const scheduleDailyReset = () => {
    const now = new Date();
    const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // Tomorrow
        0, 0, 0 // 00:00:00
    );
    const msToMidnight = night.getTime() - now.getTime();

    setTimeout(() => {
        resetDailyUsage();
        // Repeat every 24 hours
        setInterval(resetDailyUsage, 24 * 60 * 60 * 1000);
    }, msToMidnight);

    console.log('✅ Daily reset scheduler activated');
};

// ============ SERVER STARTUP ============
const startServer = async () => {
    try {
        // 1. Connect to database
        await connectDB();

        // 2. Setup model associations
        setupAssociations();

        // 3. Sync database (create tables if not exist)
        await sequelize.sync({ alter: true });
        console.log('✅ Database tables synchronized');

        // 4. Create upload directories
        createUploadDirs();

        // 5. Create default admin
        await createDefaultAdmin();

        // 6. Schedule daily reset
        scheduleDailyReset();

        // 7. Start server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log('\n========================================');
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
            console.log(`🎵 VibePulse Open API v1.0.0`);
            console.log('========================================\n');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// ============ GRACEFUL SHUTDOWN ============
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

// Start the server
startServer();