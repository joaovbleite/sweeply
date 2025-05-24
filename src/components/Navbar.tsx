import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

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
  return <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", isScrolled || isMenuOpen ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent")}>
      <div className="container flex items-center justify-between sm:px-6 lg:px-8 px-[31px] rounded-none">
        <a href="/" className="flex items-center space-x-2" onClick={e => {
        e.preventDefault();
        handleNavigate("/");
      }} aria-label="Sweeply">
          <img src="/lovable-uploads/64f9ad74-6bcc-41ac-85ed-b821343cc480.png" alt="Sweeply Logo" className="h-8 sm:h-10" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/" hash="#details">Contact</NavLink>
        </nav>

        {/* Mobile menu button - increased touch target */}
        <button className="md:hidden text-gray-700 p-2 focus:outline-none" onClick={toggleMenu} aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation - improved for better touch experience */}
      <div className={cn("fixed inset-0 z-40 bg-white flex flex-col pt-16 px-6 md:hidden transition-all duration-300 ease-in-out", isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none")}>
        <nav className="flex flex-col space-y-8 items-center mt-8">
          <MobileNavLink to="/">Home</MobileNavLink>
          <MobileNavLink to="/about">About</MobileNavLink>
          <MobileNavLink to="/pricing">Pricing</MobileNavLink>
          <MobileNavLink to="/" hash="#details">Contact</MobileNavLink>
        </nav>
      </div>
    </header>;
};
export default Navbar;
