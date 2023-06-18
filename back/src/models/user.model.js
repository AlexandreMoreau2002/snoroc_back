const { Model, DataTypes } = require("sequelize");

const sequelize = require("../../config/database.config");
class User extends Model { };
User.init({
    /** TABLE DE DONNÉES */

          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
    
          username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
          },
    
          password: {
            type: DataTypes.TEXT('long'),
            allowNull: false
          },
    
          accessToken: {
            type: DataTypes.TEXT('long'),
            allowNull: true
          },
    
          createdAt: {
            type: DataTypes.DATE
          },
    
          updatedAt: {
            type: DataTypes.DATE
          },
    
}, {
    sequelize,
    tableName: 'users', // Le nom de la table dans la BDD
    modelName: 'User' // Le nom du modèle créé ci-dessus
});
module.exports = User;