import React from 'react'
import { Link, NavLink } from 'react-router-dom';
import Logo from '../asset/Logo.webp';


export default function Header() {
  return (
    <header className='header'>
      <nav className='header__nav'>
        <NavLink to="/" activeClassName="header__nav__link--active active" className='header__nav__link' > Actus </NavLink>
        <NavLink to="/Event" activeClassName="header__nav__link--active active" className='header__nav__link' > Event </NavLink>
        <NavLink to="/Media" activeClassName="header__nav__link--active active" className='header__nav__link' > Média </NavLink>
        <NavLink to="/About" activeClassName="header__nav__link--active active" className='header__nav__link' > A propos </NavLink>
        <NavLink to="/Contact" activeClassName="header__nav__link--active active" className='header__nav__link' > Contact </NavLink>
        <NavLink to="/Profil" activeClassName="header__nav__link--active active" className='header__nav__link' > Profil </NavLink>
      </nav>
      <Link to="/">
        <img src={Logo} alt="Logo" className='header__nav__link__logo' />
      </Link>
    </header>
  )
}


