const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database.config");
class User extends Model {}
User.init(
  {
    /** TABLE DE DONNÉES */

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    userPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    civility: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Not Specified',
    },

    password: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },

    newsletter: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    accessToken: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },

    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    emailVerificationTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    isRestricted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    passwordResetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE,
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users', // Le nom de la table dans la BDD
    modelName: 'User', // Le nom du modèle créé ci-dessus
  }
)
module.exports = User;
