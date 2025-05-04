import { FunctionComponent, ReactElement, useState, useEffect, useRef } from 'react';
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
    const [isScrollingUp, setIsScrollingUp] = useState<boolean>(true);
    const lastScrollY = useRef<number>(0);
    
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY < lastScrollY.current || currentScrollY <= 0) {
                setIsScrollingUp(true);
            } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsScrollingUp(false);
            }
            
            lastScrollY.current = currentScrollY;
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    return (
        <header className={`fixed top-0 left-0 right-0 w-full z-[100] shadow-md bg-white dark:bg-zinc-900 transition-transform duration-300 ${
            isScrollingUp ? 'translate-y-0' : '-translate-y-full'
        }`}>    
            <div className="w-full">
                <nav className="flex items-center justify-between py-2 px-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2 text-md font-medium text-zinc-800 dark:text-zinc-100 font-['Montserrat']">
                        <FiGrid className="text-lg text-zinc-600 dark:text-zinc-300" /> 
                        <span>DataView</span>
                    </div>
                    
                    {/* Desktop Navigation Links */}
                    <ul className="hidden md:flex items-center space-x-8 font-mono">
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
                                className="flex items-center text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" 
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                            >
                                {isDark ? 
                                    <FiSun className="text-base" /> : 
                                    <FiMoon className="text-base" />
                                }
                            </Button>
                        </li>
                    </ul>
                    
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
                    
                    {/* Mobile Navigation Menu */}
                    {!isMenuClosed && (
                        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-zinc-900 shadow-md z-50">
                            <ul className="flex flex-col p-4 gap-4 font-mono">
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
                                        <span className="text-sm">Toggle Theme</span>
                                    </Button>
                                </li>
                            </ul>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default TitleBar;