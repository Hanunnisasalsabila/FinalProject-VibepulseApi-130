const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const ApiKey = sequelize.define('ApiKey', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => {
            // Generate format: VIBEPULSE-XXXX-XXXX-XXXX
            const uuid = uuidv4().replace(/-/g, '').toUpperCase();
            return `VIBEPULSE-${uuid.substring(0, 4)}-${uuid.substring(4, 8)}-${uuid.substring(8, 12)}`;
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'My API Key'
    },
    status: {
        type: DataTypes.ENUM('active', 'revoked'),
        defaultValue: 'active'
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    // Quota settings based on plan
    dailyQuota: {
        type: DataTypes.INTEGER,
        defaultValue: 100 // Free plan default
    },
    usedToday: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalRequests: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true // null = tidak expired
    }
}, {
    timestamps: true
});

module.exports = ApiKey;