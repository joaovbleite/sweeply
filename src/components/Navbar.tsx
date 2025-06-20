import React, { useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight } from "lucide-react";
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
  
  // Close menu when route changes
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
  }, [location.pathname]);
  
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
  
  const NavLink = ({
    to,
    hash,
    children
  }: {
    to: string;
    hash?: string;
    children: React.ReactNode;
  }) => {
    const isActive = location.pathname === to;
    
    return (
      <a 
        href={hash ? `${to}${hash}` : to} 
        className={cn(
          "nav-link transition-colors duration-200",
          isActive ? "text-pulse-600 font-medium" : "hover:text-pulse-500"
        )} 
        onClick={e => {
    e.preventDefault();
    handleNavigate(to, hash);
        }}
      >
      {children}
      </a>
    );
  };
  
  const MobileNavLink = ({
    to,
    hash,
    children
  }: {
    to: string;
    hash?: string;
    children: React.ReactNode;
  }) => {
    const isActive = location.pathname === to;
    
    return (
      <a 
        href={hash ? `${to}${hash}` : to} 
        className={cn(
          "text-xl font-medium py-3 px-6 w-full text-center rounded-lg flex items-center justify-center",
          isActive ? "bg-pulse-50 text-pulse-600" : "hover:bg-gray-100"
        )} 
        onClick={e => {
    e.preventDefault();
    handleNavigate(to, hash);
        }}
      >
      {children}
        <ChevronRight className={cn("ml-1 h-4 w-4 transition-transform", isActive ? "text-pulse-600" : "text-gray-400")} />
      </a>
    );
  };
  
  // If in app pages, don't render the navbar at all
  if (isInApp) return null;
  
  return (
    <header className={cn(
    "fixed top-0 left-0 right-0 z-50 mt-0 py-0 transition-all duration-300", 
      isScrolled ? "bg-yellow-400/90 backdrop-blur-md shadow-sm" : "bg-transparent"
  )}>
      <div className="container flex items-center justify-between sm:px-6 lg:px-8 px-3 py-3 my-0 rounded-none">
        <a href="/" className="flex items-center space-x-1 sm:space-x-1" onClick={e => {
        e.preventDefault();
        handleNavigate("/");
      }} aria-label="Sweeply">
          <img src="/logo.png" alt="Sweeply Logo" className="h-10 xs:h-12 sm:h-14 md:h-16 lg:h-20" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/" hash="#details">Contact</NavLink>
          <Link 
            to="/login" 
            className="px-4 py-2 bg-pulse-500 hover:bg-pulse-600 text-white rounded-lg transition-colors duration-200"
          >
            Sign In
          </Link>
        </nav>

        {/* Mobile menu button - increased touch target */}
        <button 
          className="md:hidden text-gray-700 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:ring-opacity-50" 
          onClick={toggleMenu} 
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Navigation - improved for better touch experience */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-white flex flex-col pt-16 px-6 md:hidden transition-all duration-300 ease-in-out",
          isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        )}
      >
        <nav className="flex flex-col space-y-4 items-center mt-8">
          <MobileNavLink to="/">Home</MobileNavLink>
          <MobileNavLink to="/about">About</MobileNavLink>
          <MobileNavLink to="/" hash="#details">Contact</MobileNavLink>
          
          <div className="mt-6 w-full pt-6 border-t border-gray-100">
            <Link 
              to="/login" 
              className="w-full flex items-center justify-center px-4 py-3 bg-pulse-500 hover:bg-pulse-600 text-white rounded-lg transition-colors duration-200 text-lg font-medium"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="w-full flex items-center justify-center px-4 py-3 mt-4 border border-pulse-500 text-pulse-500 hover:bg-pulse-50 rounded-lg transition-colors duration-200 text-lg font-medium"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default memo(Navbar);