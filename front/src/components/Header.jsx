import React from 'react'
import { Link } from 'react-router-dom';
import Nav from './Nav'
import Logo from '../asset/Logo.webp';


export default function Header() {
  return (
    <header className='header'>
        <Nav/>
        <Link to="/">
          <img src={Logo} alt="Logo"  />
        </Link>

    </header>
  )
}
