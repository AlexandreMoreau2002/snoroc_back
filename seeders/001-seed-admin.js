'use strict'

const { encryptPassword } = require('../src/utils/encryptPassword.utils')
const { generateJwt } = require('../src/utils/generateJwt.utils')

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const hashedPassword = await encryptPassword(process.env.PASSWORD)

      const tokenAdmin = await generateJwt({
        id: 1,
        firstname: 'Admin',
        email: 'pricedelu@gmail.com',
        isAdmin: true,
      })

      await queryInterface.bulkInsert('users', [
        {
          firstname: 'Admin',
          lastname: 'User',
          email: 'pricedelu@gmail.com',
          password: hashedPassword,
          userPhone: '0769666370',
          civility: 'Mr',
          newsletter: false,
          isVerified: true,
          isAdmin: true,
          isActive: true,
          isRestricted: false,
          accessToken: tokenAdmin,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
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
        ],
      },
    })
  },
}
