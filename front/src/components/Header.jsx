import React from 'react'
import { Link, NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Logo from '../asset/Logo.webp';


export default function Header() {
  return (
    <header className='header'>

      <Helmet>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </Helmet>
      
      <span className="header__menu material-symbols-outlined"> menu </span>
      <span className="header__close material-symbols-outlined"> close </span>


      <nav className='header__nav'>
        <NavLink to="/" activeClassName="header__nav__link--active active" className='header__nav__link' > Actus </NavLink>
        <NavLink to="/Event" activeClassName="header__nav__link--active active" className='header__nav__link' > Event </NavLink>
        <NavLink to="/Media" activeClassName="header__nav__link--active active" className='header__nav__link' > Média </NavLink>
        <NavLink to="/A propos" activeClassName="header__nav__link--active active" className='header__nav__link' > A propos </NavLink>
        <NavLink to="/Contact" activeClassName="header__nav__link--active active" className='header__nav__link' > Contact </NavLink>
        <NavLink to="/Profil" activeClassName="header__nav__link--active active" className='header__nav__link' > Profil </NavLink>
      </nav>
      <Link to="/">
        <img src={Logo} alt="Logo" className='header__nav__link__logo' />
      </Link>
    </header>
  )
}


