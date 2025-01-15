const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database.config");

class Album extends Model { };
Album.init({
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
        validate: {
          notEmpty: true
        },
      },
    
      description: {
        type: DataTypes.TEXT('long'),
        allowNull: false
      },
      
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: false
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
    tableName: 'albums', // Le nom de la table dans la BDD
    modelName: 'Album' // Le nom du modèle créé ci-dessus
});
module.exports = Album;
