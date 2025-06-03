import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import Link, useNavigate and useLocation

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Get current location
  
  // Check if we're in the app (post-login pages)
  const isInApp = location.pathname.includes('/dashboard') || 
                  location.pathname.includes('/jobs') || 
                  location.pathname.includes('/clients') || 
                  location.pathname.includes('/reports') ||
                  location.pathname.includes('/mobile-settings') ||
                  location.pathname.includes('/profile');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };
  const handleNavigate = (path: string, hash?: string) => {
    if (isMenuOpen) {
      toggleMenu(); // Close menu if open
    }
    if (path === window.location.pathname && !hash) {
      // If already on the page and no hash, scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else if (hash) {
      navigate(path); // Navigate first
      setTimeout(() => {
        // Then scroll to hash
        const element = document.getElementById(hash.substring(1));
        if (element) {
          const offset = window.innerWidth < 768 ? 100 : 80;
          window.scrollTo({
            top: element.offsetTop - offset,
            behavior: 'smooth'
          });
        }
      }, 0);
    } else {
      navigate(path);
    }
  };
  const NavLink: React.FC<{
    to: string;
    hash?: string;
    children: React.ReactNode;
  }> = ({ to, hash, children }) => (
    <a 
      href={hash ? `${to}${hash}` : to} 
      className="nav-link" 
      onClick={(e) => {
        e.preventDefault();
        handleNavigate(to, hash);
      }}
    >
      {children}
    </a>
  );
  const MobileNavLink: React.FC<{
    to: string;
    hash?: string;
    children: React.ReactNode;
  }> = ({ to, hash, children }) => (
    <a 
      href={hash ? `${to}${hash}` : to} 
      className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
      onClick={(e) => {
        e.preventDefault();
        handleNavigate(to, hash);
      }}
    >
      {children}
    </a>
  );
  return <header className={cn(
    "fixed top-0 left-0 right-0 z-50 mt-0 py-0 transition-all duration-300", 
    isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent",
    isInApp ? "hidden" : "" // Hide navbar completely in app pages
  )}>
      <div className="container flex items-center justify-between sm:px-6 lg:px-8 px-3 py-3 my-0 rounded-none">
        <a href="/" className="flex items-center space-x-1 sm:space-x-1" onClick={e => {
        e.preventDefault();
        handleNavigate("/");
      }} aria-label="Sweeply">
          <img src="/logo.png" alt="Sweeply Logo" className="h-10 xs:h-12 sm:h-14 md:h-16 lg:h-20" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink> {/* Updated Link */}
          <NavLink to="/" hash="#details">Contact</NavLink> {/* Assuming contact is on home page */}
          
          {/* Auth buttons */}
          <button 
            onClick={() => handleNavigate("/login")} 
            className="text-gray-700 hover:text-gray-900"
          >
            Login
          </button>
          <button 
            onClick={() => handleNavigate("/signup")} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Sign up
          </button>
        </nav>

        {/* Mobile menu button - increased touch target - hidden in app */}
        <button 
          className="md:hidden text-gray-700 p-1.5 focus:outline-none" 
          onClick={toggleMenu} 
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Navigation - improved for better touch experience */}
      <div className={cn("fixed inset-0 z-40 bg-white flex flex-col pt-16 px-6 md:hidden transition-all duration-300 ease-in-out", isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none")}>
        <nav className="flex flex-col space-y-8 items-center mt-8">
          <MobileNavLink to="/">Home</MobileNavLink>
          <MobileNavLink to="/about">About</MobileNavLink> {/* Updated Link */}
          <MobileNavLink to="/" hash="#details">Contact</MobileNavLink> {/* Assuming contact is on home page */}
          
          {/* Auth buttons for mobile */}
          <div className="flex flex-col w-full space-y-4 mt-4">
            <button 
              onClick={() => handleNavigate("/login")} 
              className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100"
            >
              Login
            </button>
            <button 
              onClick={() => handleNavigate("/signup")} 
              className="text-xl font-medium py-3 px-6 w-full text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign up
            </button>
          </div>
        </nav>
      </div>
    </header>;
};
export default Navbar;