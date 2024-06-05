import React, { useState } from 'react'
import {
    Link,
  } from "react-router-dom";

const Header = ({searchValue, setSearchValue}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };    
      return (
            <div className='navbar'>
                <div className="container">
                    <div className='align-items-center flex'>
                        <a href='/' className='logo-main'>
                            <svg width="93" height="42" viewBox="0 0 93 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M39.121 20.9251H35.1188V32.2386H32.2673V20.9251H28.2651V18.3721H39.121V20.9251ZM69.6374 25.1802L70.1376 32.2386H72.739L71.8386 20.2743H71.7385H69.2372L65.285 29.3351L61.433 20.2743H58.9316H58.8316L57.9311 32.2386H60.5325L61.0328 25.2803L63.9843 32.2386H66.4857L69.6374 25.1802ZM50.4271 20.1242C47.4254 20.1242 44.9241 22.2767 44.3738 25.0801H43.0731V20.2243H40.2216V32.1885H43.0731V27.6331H44.4238C45.0241 30.3864 47.4755 32.4388 50.4271 32.4388C53.8289 32.4388 56.5804 29.6855 56.5804 26.2815C56.5804 22.8774 53.8289 20.1242 50.4271 20.1242ZM50.4271 22.7273C52.3781 22.7273 53.979 24.3292 53.979 26.2815C53.979 28.2338 52.3781 29.8357 50.4271 29.8357C48.476 29.8357 46.8751 28.2338 46.8751 26.2815C46.8751 24.3292 48.426 22.7273 50.4271 22.7273ZM82.8445 18.3721L86.6966 27.6331L86.3464 28.5842C86.0462 29.3351 85.8461 30.2362 84.1452 30.2362V32.7892C87.0968 32.7892 87.9472 31.2374 88.9978 28.5842L92.9999 18.3721H90.0984L88.0473 24.7296L85.7961 18.3721H82.8445ZM77.5416 20.9251V32.2386H74.6901V18.4221H82.2942V20.9752H77.5416V20.9251Z" fill="white"></path>
                                <path fillRule="evenodd" clipRule="evenodd" d="M26.4142 3.80453L19.8107 0L0 11.4636V19.0727L6.60355 22.8772V15.2682L26.4142 3.80453Z" fill="white"></path>
                                <path fillRule="evenodd" clipRule="evenodd" d="M13.2071 42V19.0728L6.60358 22.8773V38.1455L13.2071 42Z" fill="white"></path>
                            </svg>
                        </a>
                        <nav>
                            <div className="nav-elements menu">
                                <div className='mobile_menu_button' onClick={toggleMenu}>
                                    <div className='burger'>
                                        <span></span>
                                    </div>
                                </div>
                                <ul className={`flex menu-list ${isOpen ? 'active' : ''}`}>
                                    <li>
                                        <Link to='/projects'>Проекты</Link>
                                    </li>
                                    <li>
                                        <Link to='/students'>Студенты</Link>
                                    </li>
                                    <li>
                                        <Link to='discipline'>Успеваемость</Link>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                    <div className='dop-button'>
                        <a data-fancybox="" data-src="#auth" href="/search-team" className="btn-team js-btn-auth">Сформировать команду</a>
                        <a data-fancybox="" data-src="#auth" href="/login" className="btn btn-blue js-btn-auth">Личный&nbsp;кабинет
                            <span className="bg-white-person "></span>
                        </a>
                    </div>
                </div>
            </div>
        );
  };

export default Header;