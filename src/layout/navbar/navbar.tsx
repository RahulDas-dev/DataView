import { FunctionComponent, ReactElement, useContext, useState } from 'react';
import classNames from 'classnames'
import './navbar.css';
import { DisplayModeContext } from '../../context/display_context';

export interface NavbarProps{
    
}

const Navbar: FunctionComponent<NavbarProps> = ():ReactElement =>{
    const [is_menu_closed, setMenu] = useState<boolean>(true);
    const {display_mode, toggleDisplayMode} = useContext(DisplayModeContext)
    return (
    <header className="nav-header" id='header-top'>    
        <nav className='navbar container'>
            <span className="nav__logo">
                <i className="material-icon text-neutral-600 dark:text-neutral-300">dashboard</i> DataView
            </span>
            <button className="nav__btn" onClick={()=>setMenu(!is_menu_closed)}>
                {
                    is_menu_closed && <i className="material-icon text-neutral-800 dark:text-neutral-300">menu</i>
                }
                {
                    !is_menu_closed && <i className="material-icon text-neutral-800 dark:text-neutral-300">close</i>
                }
            </button>
            <ul className={classNames('nav__menu', { 'hide-menu': is_menu_closed })}>
                <li className="nav__item">
                    <a href={import.meta.env.VITE_PROFILE_PAGE} target='_blank' className="nav__link">
                        <i className="material-icon nav_icon">person</i> About Auther
                    </a>
                </li>
                <li className="nav__item">
                    <a href="#project" className="nav__link">
                        <i className="material-icon nav_icon">alternate_email</i> Contact 
                    </a>
                </li>
                <li className="nav__item">
                    <button className="nav__link" onClick={() => toggleDisplayMode()}>
                        { 
                            (display_mode == 'dark') && <i className="material-icon text-neutral-300">sunny</i>
                        }
                        {    
                            (display_mode != 'dark') && <i className="material-icon text-neutral-300">dark_mode</i>
                        }
                        <span className="md:hidden">Toggle Display Mode</span>
                    </button>
                </li>
            </ul>
        </nav>
    </header>
    )
};

export default Navbar