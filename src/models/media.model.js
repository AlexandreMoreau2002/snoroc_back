const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database.config");

class Media extends Model { };
Media.init({
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
    
      description: {
        type: DataTypes.TEXT('long'),
        allowNull: true
      },
    
      url: {
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
    tableName: 'medias', // Le nom de la table dans la BDD
    modelName: 'Media' // Le nom du modèle créé ci-dessus
});
module.exports = Media;
