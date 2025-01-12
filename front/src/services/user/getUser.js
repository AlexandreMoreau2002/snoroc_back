// src/services/user/getUser.js
import axiosInstance from '../axiosConfig'
import UserInterface from '../../interface/userInterface'

const getUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/user/id=${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_JWT_TOKEN}`,
      },
    })

    // Extraire les données utilisateur (imbriquées dans response.data.data)
    const userData = response.data.data

    // Transformer les données avec UserInterface
    return new UserInterface(userData)
  } catch (error) {
    console.error('Erreur lors de la récupération de l’utilisateur :', error)
    throw error
  }
}

export default getUser
