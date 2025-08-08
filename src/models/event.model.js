const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database.config");

class Event extends Model { };
Event.init({
    /** TABLE DE DONNÉES */
    
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },

    thumbnail: {
        type: DataTypes.STRING,
        allowNull: false
    },

    address: {
        type: DataTypes.STRING,
        allowNull: true
    },

    authorId: {
        type: DataTypes.INTEGER,
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },

    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }

}, {
    sequelize,
    tableName: 'events', // Le nom de la table dans la BDD
    modelName: 'Event' // Le nom du modèle créé ci-dessus
});
module.exports = Event;
