import { FunctionComponent, ReactElement, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { 
  FiMenu, 
  FiX, 
  FiSun, 
  FiMoon, 
  FiGrid 
} from 'react-icons/fi';

import { Button } from './Button';

const TitleBar: FunctionComponent = (): ReactElement => {
    const [isMenuClosed, setMenu] = useState<boolean>(true);
    const { toggleTheme, isDark } = useTheme();
    
    return (
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-zinc-900 shadow-sm">    
            <nav className="container flex items-center justify-between py-2">
                {/* Logo */}
                <div className="flex items-center gap-1.5 text-md text-zinc-800 dark:text-zinc-100 font-['Montserrat']">
                    <FiGrid className="text-lg text-zinc-600 dark:text-zinc-300" /> 
                    <span>DataView</span>
                </div>
                
                {/* Mobile Menu Button */}
                <Button 
                    variant="icon"
                    className="md:hidden" 
                    onClick={() => setMenu(!isMenuClosed)}
                    aria-label="Toggle menu"
                    size="small"
                >
                    {isMenuClosed ? 
                        <FiMenu className="text-lg text-zinc-800 dark:text-zinc-300" /> : 
                        <FiX className="text-lg text-zinc-800 dark:text-zinc-300" />
                    }
                </Button>
                
                {/* Navigation Links */}
                <ul className={`${isMenuClosed ? 'hidden' : 'flex'} md:flex flex-col md:flex-row absolute md:static left-0 top-12 md:top-auto w-full md:w-auto bg-white dark:bg-zinc-900 md:bg-transparent p-3 md:p-0 shadow-md md:shadow-none gap-3 md:items-center font-mono`}>
                    <li>
                        <a 
                            href={import.meta.env.VITE_PROFILE_PAGE} 
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                        >
                            About Author
                        </a>
                    </li>
                    <li>
                        <a 
                            href="#project" 
                            className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                        >
                            Contact
                        </a>
                    </li>
                    <li>
                        <Button 
                            variant="icon"
                            size="small"
                            className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" 
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {isDark ? 
                                <FiSun className="text-base" /> : 
                                <FiMoon className="text-base" />
                            }
                            <span className="text-sm md:hidden">Toggle Theme</span>
                        </Button>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default TitleBar;