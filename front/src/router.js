import React from 'react'
import { BrowserRouter, Router, Routes, Route } from 'react-router-dom'
import { Home, About, Contact} from './pages/export'

export default function router() {
  return (
    <BrowserRouter> 
        <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/About' element={<About/>} />
            <Route path='/Contact' element={<Contact/>} />
        </Routes>
    </BrowserRouter>
  )
}