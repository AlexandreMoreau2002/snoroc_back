const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database.config");

class News extends Model { };
News.init({
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
    tableName: 'news', // Le nom de la table dans la BDD
    modelName: 'News', // Le nom du modèle créé ci-dessus
    timestamps: true, // Active automatiquement createdAt et updatedAt

});
module.exports = News;
