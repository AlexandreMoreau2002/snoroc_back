import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className='home'>

      <div className="mainActu">
        <img src="" alt="img" />
        <h2>Titre </h2>
        <p> Desc </p>
        <time dateTime='2023-01-01'> 01/01/2023 </time>
      </div>

      <div className='carousel'>
        <div className="actu2">
          <img src="/Users/alexandremoreau/Desktop/snoroc/front/src/asset/actus.jpg" alt="actus2img" />
        </div>
        <div className="actu3"></div>
        <div className="actu4"></div>
        <div className="actu5"></div>
        <nav>
          <button> &lt; </button>

          <button className="1">1</button>
          <button className="2">2</button>
          <button className="3">3</button>

          <button> &gt; </button>
        </nav>

        <Link to="/Home/Gallery">Tout voir</Link>
      </div>

    </section>
  )
}
