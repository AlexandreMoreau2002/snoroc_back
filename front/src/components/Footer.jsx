import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Helmet } from 'react-helmet';
import Logo from '../asset/Logo.webp';


export default function Footer() {
  return (
    <footer className="footer">
      <Helmet>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css" integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
      </Helmet>

      <nav className="footer__nav">

        <i className="footer__nav__logo--fb fa-brands fa-square-facebook">
          {/* <a href="#"></a> */}
        </i>

        <i className="footer__nav__logo--insta fa-brands fa-square-instagram">
          {/* <a href="#"></a> */}
        </i>

        <i className="footer__nav__logo--twitter fa-brands fa-square-twitter">
          {/* <a href="#"></a> */}
        </i>

        <NavLink to='/LegalNotice' className='footer__nav__link' >Mentions légales</NavLink>
        <NavLink to='/TermsOfService' className='footer__nav__link' >Cgu</NavLink>

        <p>
          Copyright © 2023 Snoroc. Tous droits réservés. Tous les enregistrements musicaux
          sont protégés par le droit d'auteur.
        </p>

        <Link to='/'>
          {/* <img src={Logo} alt="img logo" /> */}

        </Link>
      </nav>

    </footer>
  )
}
