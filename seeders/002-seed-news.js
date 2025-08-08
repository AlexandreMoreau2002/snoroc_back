'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Insertion des actualités
      await queryInterface.bulkInsert('news', [
        {
          title: 'Actualité 1',
          content: "Ceci est le contenu de l'actualité 1.",
          thumbnail: 'http://localhost:3030/uploads/seed/seed1.jpg',
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 2',
          content: "Ceci est le contenu de l'actualité 2.",
          thumbnail: 'http://localhost:3030/uploads/seed/seed2.jpg',
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 3',
          content: "Ceci est le contenu de l'actualité 3.",
          thumbnail: 'http://localhost:3030/uploads/seed/seed3.jpg',
          authorId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 4',
          content: "Ceci est le contenu de l'actualité 4.",
          thumbnail: 'http://localhost:3030/uploads/seed/seed4.jpg',
          authorId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 5',
          content: "Ceci est le contenu de l'actualité 5.",
          thumbnail: 'http://localhost:3030/uploads/seed/seed5.jpg',
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 6',
          content: "Ceci est le contenu de l'actualité 6.",
          thumbnail: 'http://localhost:3030/uploads/seed/seed6.jpg',
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 7',
          content: "Ceci est le contenu de l'actualité 7.",
          thumbnail: 'http://localhost:3030/uploads/seed/seed7.jpg',
          authorId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 8',
          content: "Ceci est le contenu de l'actualité 8.",
          thumbnail: 'http://localhost:3030/uploads/seed/seed8.jpg',
          authorId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 9',
          content: "Ceci est le contenu de l'actualité 9.",
          thumbnail: 'http://localhost:3030/uploads/seed/seed9.jpg',
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Actualité 10',
          content: "Ceci est le contenu de l'actualité 10.",
          thumbnail: 'http://localhost:3030/uploads/seed/seed10.jpg',
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
