'use strict';

const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const paragraphs = [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras lobortis sapien velit, quis finibus mi dignissim ut. Integer vitae libero ante. Duis ut massa blandit nunc auctor congue.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras lobortis sapien velit, quis finibus mi dignissim ut. Integer vitae libero ante. Duis ut massa blandit nunc auctor congue eu sed elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus placerat, nulla sed mattis posuere, ligula metus rhoncus metus, eu.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras lobortis sapien velit, quis finibus mi dignissim ut. Integer vitae libero ante. Duis ut massa blandit nunc auctor congue eu sed elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus placerat, nulla sed mattis posuere, ligula metus rhoncus metus, eu.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras lobortis sapien velit, quis finibus mi dignissim ut. Integer vitae libero ante. Duis ut massa blandit nunc auctor congue eu sed elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus placerat, nulla sed mattis posuere, ligula metus rhoncus metus, eu.',
        ];

        // Centralize public base URL for images
        const ENV = process.env.ENV || 'dev';
        let BASE_URL;
        if (ENV === 'production') {
            BASE_URL = process.env.BASE_URL;
        } else {
            BASE_URL = `http://localhost:${process.env.PORT || 3030}`;
        }

        await queryInterface.bulkInsert('about', [{
            title: 'Snoroc',
            description: paragraphs.join('\n\n'),
            image: null, // Will use frontend default image (Actus.jpg)
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('about', null, {});
    }
};
