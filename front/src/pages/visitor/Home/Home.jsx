// import React, {useEffect, useState} from 'react';
import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
// import SweetPagination from 'sweetpagination'

export default function Home() {

  // const [isLoading, setIsLoading] = useState(true) 
  // const [news, setNews] = useState(null)

  // useEffect(() => {
  //   fetch('http://localhost:3030/news/1',
  //   {
  //     method: "GET",
  //     Headers: {
  //       'Accept' : 'Application/json'
  //     }
  //   })
  //   .then(res => res.json())
  //   .then(res => {
  //     console.log(res)
  //   })
  // })

  return (
    <>
      <Helmet>
        <title>Actus</title>
      </Helmet>
      <div className="actus">
        
        <h1 className="page__title">Actus</h1>  {/* a cacher au format tablette / ordi */}
        <section className="mainActus">
          
          {/* Actus principal */}

          {/* le titre est un liens vers l'id (donc configurer l'id qui s'affiche) de l'actus*/}
          <Link to="/"> {/* {id} */}
            <h3 className="mainActus__titre"> </h3>
          </Link>
          {/* <img src="" alt="img actus principal" className="mainActus__img"></img> api.data.img */}
          <p className="mainActus__summaryDesc"> </p> 
          <time dateTime="2023-01-24" className="mainActus__time"> </time> {/*api.data.time*/}


          <p>haaaaaaaaaaa</p>
          {/* carousel d'actus */}
          
          {/* <SweetPagination
            currentPageData={setCurrentPageData}
            getData={items}
            dataPerPage={10}
            navigation={true}
          /> */}
        </section>
      </div>
    </>

  )
}
