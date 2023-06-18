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

      username: {
        type: Sequelize.STRING,
        unique: true,
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

      createdAt: {
        type: Sequelize.DATE
      },

      updatedAt: {
        type: Sequelize.DATE
      },

    });
  },

  async down(queryInterface, Sequelize) {
  }
};
