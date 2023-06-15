import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, Gallery, Display, Event, EventGallery, EventDisplay, Media, MediaGallery, MediaDisplay, About, Contact, Profile} from './pages/visitor/export'

import { Header, Footer} from './components/export'

export default function Router() {
  return (
    <BrowserRouter>
        <Header />
          <Routes>

            {/* Home */}
            <Route path="/" element={<Home />} /> 
            <Route path="/Home/Gallery" element={<Gallery />} />
            <Route path="/Home/Gallery/Display" element={<Display />} />

            {/* Event */}
            <Route path="/Evenement" element={<Event />} />
            <Route path="/Evenement/Gallery" element={<EventGallery />} />
            <Route path="/Evenement/Gallery/Display" element={<EventDisplay />} />
            
            {/* Media */}
            <Route path="/Media" element={<Media />} />
            <Route path="/Media/Gallery" element={<MediaGallery />} />
            <Route path="/Media/Gallery/Display" element={<MediaDisplay />} />

            <Route path="/A propos" element={<About />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/Profil" element={<Profile />} />
          </Routes>
        <Footer />
    </BrowserRouter>
  )
}
