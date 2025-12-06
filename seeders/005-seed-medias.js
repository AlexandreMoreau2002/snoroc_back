"use strict";

const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkInsert("medias", [
        {
          title: "Session live au studio",
          description:
            "Un aperçu des répétitions filmées au studio avec un arrangement acoustique.",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          albumId: null,
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Clip officiel",
          description:
            "Clip vidéo officiel publié sur notre chaîne YouTube pour le single phare.",
          url: "https://youtu.be/3JZ_D3ELwOQ",
          albumId: null,
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Interview backstage",
          description:
            "Interview tournée en coulisses juste avant le concert de fin de tournée.",
          url: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
          albumId: null,
          authorId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Live session plein air",
          description:
            "Performance enregistrée en extérieur avec une captation multi-caméras.",
          url: "https://youtu.be/l482T0yNkeo",
          albumId: null,
          authorId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Tutoriel guitare",
          description:
            "Explications détaillées pour rejouer les riffs principaux du dernier single.",
          url: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
          albumId: null,
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      console.log("Les médias ont été insérés avec succès.");
    } catch (error) {
      console.error("Erreur lors de l’insertion des médias :", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("medias", null, {});
  },
};
