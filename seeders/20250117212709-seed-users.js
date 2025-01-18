'use strict'

const { encryptPassword } = require('../src/utils/encryptPassword.utils')
const { generateJwt } = require('../src/utils/generateJwt.utils')

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const hashedPassword = await encryptPassword('Password123')

      const tokenAdmin = await generateJwt({
        id: 1,
        firstname: 'Admin',
        email: 'pricedelu@gmail.com',
        isAdmin: true,
      })

      const tokenUser = await generateJwt({
        id: 2,
        firstname: 'User',
        email: 'moreaualexandre2002@gmail.com',
        isAdmin: false,
      })

      await queryInterface.bulkInsert('users', [
        {
          firstname: 'Admin',
          lastname: 'User',
          email: 'pricedelu@gmail.com',
          password: hashedPassword,
          userPhone: '0769666370',
          civility: 'Mr',
          isVerified: true,
          isAdmin: true,
          isActive: true,
          isRestricted: false,
          accessToken: tokenAdmin,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          firstname: 'Regular',
          lastname: 'User',
          email: 'moreaualexandre2002@gmail.com',
          password: hashedPassword,
          userPhone: '0769666370',
          civility: 'Mr',
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
          'pricedelu@gmail.com',
          'moreaualexandre2002@gmail.com',
        ],
      },
    })
  },
}
