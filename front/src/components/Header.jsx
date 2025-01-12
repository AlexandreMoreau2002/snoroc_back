// front/src/components/Header.jsx
import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import Logo from '../asset/Logo.webp'

export default function Header() {
  return (
    <HelmetProvider>
      <header className="header">
        <Helmet>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          />
        </Helmet>

        <button>
          <span id="header__menu" className="material-symbols-outlined">
            menu
          </span>
        </button>
        <button>
          <span id="header__close" className="material-symbols-outlined">
            close
          </span>
        </button>

        <nav className="header__nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'header__nav__link header__nav__link--active'
                : 'header__nav__link'
            }
          >
            Actus
          </NavLink>
          <NavLink
            to="/Event"
            className={({ isActive }) =>
              isActive
                ? 'header__nav__link header__nav__link--active'
                : 'header__nav__link'
            }
          >
            Event
          </NavLink>
          <NavLink
            to="/Media"
            className={({ isActive }) =>
              isActive
                ? 'header__nav__link header__nav__link--active'
                : 'header__nav__link'
            }
          >
            Média
          </NavLink>
          <NavLink
            to="/A propos"
            className={({ isActive }) =>
              isActive
                ? 'header__nav__link header__nav__link--active'
                : 'header__nav__link'
            }
          >
            A propos
          </NavLink>
          <NavLink
            to="/Contact"
            className={({ isActive }) =>
              isActive
                ? 'header__nav__link header__nav__link--active'
                : 'header__nav__link'
            }
          >
            Contact
          </NavLink>
          <NavLink
            to="/Profil"
            className={({ isActive }) =>
              isActive
                ? 'header__nav__link header__nav__link--active'
                : 'header__nav__link'
            }
          >
            Profil
          </NavLink>
        </nav>

        <Link to="/">
          <img src={Logo} alt="Logo" className="header__nav__link__logo" />
        </Link>
      </header>
    </HelmetProvider>
  )
}
