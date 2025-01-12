// front/src/Router.js
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Home, HomeGallery, HomeDisplay, Event, EventGallery, EventDisplay, Media, MediaGallery, MediaDisplay, About, Contact, Profile} from './pages/visitor/export'
import { LegalNotice, TermsOfService} from './pages/visitor/export'

import { Header, Footer} from './components/export'


export default function Router() {
  return (
    <BrowserRouter>
        <Header />
          <Routes>

            {/* Home */}
            <Route path="/" element={<Home />} /> 
            <Route path="/Home/Gallery" element={<HomeGallery />} />
            <Route path="/Home/Gallery/Display" element={<HomeDisplay />} />

            {/* Event */}
            <Route path="/Evenement" element={<Event />} />
            <Route path="/Evenement/Gallery" element={<EventGallery />} />
            <Route path="/Evenement/Gallery/Display" element={<EventDisplay />} />
            
            {/* Media */}
            <Route path="/Media" element={<Media />} />
            <Route path="/Media/Gallery" element={<MediaGallery />} />
            <Route path="/Media/Gallery/Display" element={<MediaDisplay />} />

            {/* other */}
            <Route path="/A propos" element={<About />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/Profil" element={<Profile />} />

            {/* footer nav */}
            <Route path="/Mentions légales" element={<LegalNotice/>} />
            <Route path="/CGU" element={<TermsOfService/>} />

            {/* Error 404 */}
            {/* ajouter par la suite une page 404 avec bouton de redirection vers la home */}
            <Route path="/*" element={<Home />} />

          </Routes>
        <Footer />
    </BrowserRouter>
  )
}