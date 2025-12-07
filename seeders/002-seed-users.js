'use strict'

const { encryptPassword } = require('../src/utils/encryptPassword.utils')
const { generateJwt } = require('../src/utils/generateJwt.utils')

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const hashedPassword = await encryptPassword(process.env.PASSWORD)

      const tokenUser = await generateJwt({
        id: 2,
        firstname: 'User',
        email: 'moreaualexandre2002@gmail.com',
        isAdmin: false,
      })

      await queryInterface.bulkInsert('users', [
        {
          firstname: 'Regular',
          lastname: 'User',
          email: 'moreaualexandre2002@gmail.com',
          password: hashedPassword,
          userPhone: '0769666370',
          civility: 'Mr',
          newsletter: true,
          isVerified: true,
          isAdmin: false,
          isActive: true,
          isRestricted: false,
          accessToken: tokenUser,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
    } catch (error) {
      console.error('Erreur lors de l’insertion des utilisateurs :', error)
      throw error
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          'moreaualexandre2002@gmail.com',
        ],
      },
    })
  },
}
