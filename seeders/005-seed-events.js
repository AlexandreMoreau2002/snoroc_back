"use strict";

const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const ENV = process.env.ENV || "dev";
      let BASE_URL;
      if (ENV === "production") {
        BASE_URL = process.env.BASE_URL;
      } else {
        BASE_URL = `http://localhost:${process.env.PORT || 3030}`;
      }

      await queryInterface.bulkInsert("events", [
        {
          title: "Événement 1",
          content: "Ceci est le contenu de l'événement 1.",
          thumbnail: `${BASE_URL}/uploads/seed/seed1.jpg`,
          address: "123 Rue Principale, Paris",
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Événement 2",
          content: "Ceci est le contenu de l'événement 2.",
          thumbnail: `${BASE_URL}/uploads/seed/seed2.jpg`,
          address: "456 Avenue de la République, Lyon",
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Événement 3",
          content: "Ceci est le contenu de l'événement 3.",
          thumbnail: `${BASE_URL}/uploads/seed/seed3.jpg`,
          address: "789 Boulevard du Midi, Marseille",
          authorId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Événement 4",
          content: "Ceci est le contenu de l'événement 4.",
          thumbnail: `${BASE_URL}/uploads/seed/seed4.jpg`,
          address: "12 Chemin des Lilas, Toulouse",
          authorId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Événement 5",
          content: "Ceci est le contenu de l'événement 5.",
          thumbnail: `${BASE_URL}/uploads/seed/seed5.jpg`,
          address: "34 Route du Lac, Bordeaux",
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      console.log("Les événements ont été insérés avec succès.");
    } catch (error) {
      console.error("Erreur lors de l’insertion des événements :", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("events", null, {});
  },
};
