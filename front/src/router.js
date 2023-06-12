import React from 'react'
import { BrowserRouter, Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

function router() {
  return (
    <BrowserRouter> 
        <Routes>
            <Route path='/' element={<home/>} />
        </Routes>
    </BrowserRouter>
  )
}

export default router