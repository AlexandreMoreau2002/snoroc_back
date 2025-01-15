// src/pages/visitor/User/UserProfile.jsx
import React, { useEffect } from 'react'
import getUser from '../../services/user/getUser'
import { Login } from '../../components/login'

export default function UserProfile() {
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = 1
        const userData = await getUser(userId)
        console.log('Données utilisateur récupérées :', userData)
      } catch (error) {
        console.error(
          'Erreur lors de la récupération de l’utilisateur :',
          error
        )
      }
    }

    fetchUser()
  }, [])

  return (
    <div>
      <h1>Profil utilisateur</h1>
      <p>Regarde la console pour les données utilisateur.</p>
      <div>
        <h2>Composant login</h2>
        <Login />
      </div>
    </div>
  )
}
