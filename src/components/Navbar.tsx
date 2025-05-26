import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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

  const handleSignOut = async () => {
    await signOut();
    if (isMenuOpen) {
      toggleMenu();
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
  }) => <a href={hash ? `${to}${hash}` : to} className="nav-link" onClick={e => {
    e.preventDefault();
    handleNavigate(to, hash);
  }}>
      {children}
    </a>;

  const MobileNavLink = ({
    to,
    hash,
    children
  }: {
    to: string;
    hash?: string;
    children: React.ReactNode;
  }) => <a href={hash ? `${to}${hash}` : to} className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" onClick={e => {
    e.preventDefault();
    handleNavigate(to, hash);
  }}>
      {children}
    </a>;

  return <header className={cn("fixed top-0 left-0 right-0 z-50 -mt-8 py-0 transition-all duration-300", isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent")}>
      <div className="container flex items-center justify-between sm:px-6 lg:px-8 px-[31px] py-0 my-0 rounded-none">
        <a href="/" className="flex items-center space-x-2" onClick={e => {
        e.preventDefault();
        handleNavigate("/");
      }} aria-label="Sweeply">
          <img src="/lovable-uploads/64f9ad74-6bcc-41ac-85ed-b821343cc480.png" alt="Sweeply Logo" className="h-30 sm:h-32" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 items-center">
          {user ? (
            // Authenticated user navigation
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/calendar">Calendar</NavLink>
              <NavLink to="/clients">Clients</NavLink>
              <div className="flex items-center gap-4 ml-4">
                <span className="text-sm text-gray-600">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            // Non-authenticated user navigation
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/" hash="#details">Contact</NavLink>
              <div className="flex items-center gap-4 ml-4">
                <NavLink to="/login">Sign In</NavLink>
                <Link to="/signup" className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors">
                  Get Started
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* Mobile menu button - increased touch target */}
        <button className="md:hidden text-gray-700 p-2 focus:outline-none" onClick={toggleMenu} aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation - improved for better touch experience */}
      <div className={cn("fixed inset-0 z-40 bg-white flex flex-col pt-16 px-6 md:hidden transition-all duration-300 ease-in-out", isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none")}>
        <nav className="flex flex-col space-y-8 items-center mt-8">
          {user ? (
            // Authenticated user mobile navigation
            <>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-pulse-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                  {(user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()}
                </div>
                <p className="text-gray-600">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
              </div>
              <MobileNavLink to="/dashboard">Dashboard</MobileNavLink>
              <MobileNavLink to="/calendar">Calendar</MobileNavLink>
              <MobileNavLink to="/clients">Clients</MobileNavLink>
              <MobileNavLink to="/jobs">Jobs</MobileNavLink>
              <MobileNavLink to="/reports">Reports</MobileNavLink>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100 text-red-600"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </>
          ) : (
            // Non-authenticated user mobile navigation
            <>
              <MobileNavLink to="/">Home</MobileNavLink>
              <MobileNavLink to="/about">About</MobileNavLink>
              <MobileNavLink to="/" hash="#details">Contact</MobileNavLink>
              <div className="flex flex-col gap-4 mt-8 w-full">
                <Link 
                  to="/login" 
                  className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg border border-pulse-500 text-pulse-600 hover:bg-pulse-50"
                  onClick={() => toggleMenu()}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg bg-pulse-500 text-white hover:bg-pulse-600"
                  onClick={() => toggleMenu()}
                >
                  Get Started
                </Link>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>;
};

export default Navbar;