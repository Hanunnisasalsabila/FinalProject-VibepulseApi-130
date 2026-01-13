const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Song = sequelize.define('Song', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    artist: {
        type: DataTypes.STRING,
        allowNull: false
    },
    album: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mood: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['focus', 'energetic', 'chill', 'motivation', 'sad', 'happy']]
        }
    },
    genre: {
        type: DataTypes.STRING,
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER, // in seconds
        allowNull: true
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cover_url: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    lyrics: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    playCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = Song;