'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('album', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        },
      },

      description: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      
      thumbnail: {
        type: Sequelize.STRING,
        allowNull: false
      },

      authorId: {
        type: Sequilize.STRING,
        reference: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }

    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
