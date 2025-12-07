const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database.config");

class About extends Model { };

About.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    tableName: 'about',
    modelName: 'About',
    timestamps: true,
});

module.exports = About;
