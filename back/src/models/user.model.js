// id
// email
// password
// firstname
// lastname
// phone
// civility
// accessToken (JWT)
// newsletter (boolean)
// isAdmin (boolean)
// isActive (boolean)
// isVerified (boolean)
// emailVerificationToken (code à 6 chiffres)
// emailVerificationTokenExpires (date d'expiration du token (15 minutes))
// isRestricted (boolean)
// passwordResetToken (code à 6 chiffres)
// passwordResetTokenExpires (date d'expiration du token (15 minutes))
// createdAt
// updatedAt

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