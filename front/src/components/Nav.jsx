import React from 'react'
import { Link } from 'react-router-dom'


export default function Nav() {
    return (
        <nav>
            <Link to="/"> Actus </Link>
            <Link to="/Event"> Event </Link>
            <Link to="/Media"> Média </Link>
            <Link to="/About"> A propos </Link>
            <Link to="/Contact"> Contact </Link>
            <Link to="/Profil"> Profile </Link>
            

            
        </nav>
    )
}
