'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      password: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },

      accessToken: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      
      // add 
      
      email: {
        type: Sequelize.STRING, 
        allowNull: false,
        unique: true
      },
      
      firstname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      
      lastname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      
      phone: {
        type: Sequelize.STRING, 
        allowNull: true
      },
      
      civility: {
        type: Sequelize.STRING,
        allowNull: false
      },
      
      newsletter: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      
      isAdmin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      
      emailVerificationToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      
      emailVerificationTokenExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      
      isRestricted: {
        type: Sequelize.BOOLEAN,
        allowNull:false
      },
      
      passwordResetTokenExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      
      createdAt: {
        type: Sequelize.DATE
      },
      
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }

    });
  },
  
  async down(queryInterface, Sequelize) {
  }
};



