const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ApiUsage = sequelize.define('ApiUsage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ApiKeyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ApiKeys',
            key: 'id'
        }
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    endpoint: {
        type: DataTypes.STRING,
        allowNull: false
    },
    method: {
        type: DataTypes.STRING,
        allowNull: false
    },
    statusCode: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    responseTime: {
        type: DataTypes.INTEGER, // milliseconds
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    updatedAt: false // Only need createdAt for logs
});

module.exports = ApiUsage;