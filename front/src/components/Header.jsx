import React from 'react'
import { Link, NavLink } from 'react-router-dom';
import Logo from '../asset/Logo.webp';


export default function Header() {
  return (
    <header className='header'>
      <nav className='headerNav'>
        <NavLink to="/" activeClassName="active"> Actus </NavLink>
        <NavLink to="/Event" activeClassName="active"> Event </NavLink>
        <NavLink to="/Media" activeClassName="active"> Média </NavLink>
        <NavLink to="/About" activeClassName="active"> A propos </NavLink>
        <NavLink to="/Contact" activeClassName="active"> Contact </NavLink>
        <NavLink to="/Profil" activeClassName="active"> Profile </NavLink>
      </nav>
      <Link to="/">
        <img src={Logo} alt="Logo" className='logo' />
      </Link>
    </header>
  )
}
