const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database.config");

class Contact extends Model { };
Contact.init({
    /** TABLE DE DONNÉES */

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
    
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
    
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
    
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
    
      subject: {
        type: DataTypes.TEXT('long'),
        allowNull: false
      },
    
      message: {
        type: DataTypes.TEXT('long'),
        allowNull: false
      },
    
      hasBeenRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
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
    tableName: 'contacts', // Le nom de la table dans la BDD
    modelName: 'Contact' // Le nom du modèle créé ci-dessus
});
module.exports = Contact;
