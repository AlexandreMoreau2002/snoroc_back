'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('medias', 'thumbnail', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('medias', 'thumbnail')
  }
}
