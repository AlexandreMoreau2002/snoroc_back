"use strict";

const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Centralize public base URL for images
      // Explicit behavior per environment: in production use BASE_URL, else use localhost
      const ENV = process.env.ENV || 'dev'
      let BASE_URL
      if (ENV === 'production') {
        BASE_URL = process.env.BASE_URL
      } else {
        BASE_URL = `http://localhost:${process.env.PORT || 3030}`
      }

      // Insertion des actualités
      await queryInterface.bulkInsert('news', [
        {
          title: 'Actualité 1',
          content: "Ceci est le contenu de l'actualité 1.",
          thumbnail: `${BASE_URL}/uploads/seed/seed1.jpg`,
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 2',
          content: "Ceci est le contenu de l'actualité 2.",
          thumbnail: `${BASE_URL}/uploads/seed/seed2.jpg`,
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 3',
          content: "Ceci est le contenu de l'actualité 3.",
          thumbnail: `${BASE_URL}/uploads/seed/seed3.jpg`,
          authorId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 4',
          content: "Ceci est le contenu de l'actualité 4.",
          thumbnail: `${BASE_URL}/uploads/seed/seed4.jpg`,
          authorId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 5',
          content: "Ceci est le contenu de l'actualité 5.",
          thumbnail: `${BASE_URL}/uploads/seed/seed5.jpg`,
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 6',
          content: "Ceci est le contenu de l'actualité 6.",
          thumbnail: `${BASE_URL}/uploads/seed/seed6.jpg`,
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 7',
          content: "Ceci est le contenu de l'actualité 7.",
          thumbnail: `${BASE_URL}/uploads/seed/seed7.jpg`,
          authorId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 8',
          content: "Ceci est le contenu de l'actualité 8.",
          thumbnail: `${BASE_URL}/uploads/seed/seed8.jpg`,
          authorId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 9',
          content: "Ceci est le contenu de l'actualité 9.",
          thumbnail: `${BASE_URL}/uploads/seed/seed9.jpg`,
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 10',
          content: "Ceci est le contenu de l'actualité 10.",
          thumbnail: `${BASE_URL}/uploads/seed/seed10.jpg`,
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      console.log('Les actualités ont été insérées avec succès.')
    } catch (error) {
      console.error('Erreur lors de l’insertion des actualités :', error)
      throw error
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('news', null, {})
  },
}
