import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu } from 'lucide-react';
// Removed Dialog imports as they are no longer needed here
// import {
//   Dialog,
//   DialogContent,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import AuthModal from './AuthModal'; // AuthModal is no longer used

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-background/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
              Sweeply
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/features">Features</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/platform">Platform</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>
            <Button variant="outline" asChild className="border-sweeply text-sweeply hover:bg-sweeply hover:text-white ml-2">
              <Link to="/login">Login</Link>
            </Button>
            <Button 
              className="bg-sweeply hover:bg-sweeply-dark text-white ml-2"
              onClick={() => window.open('https://sweeply.com/demo', '_blank')}
            >
              Request Demo
            </Button>
          </div>
          <div className="md:hidden flex items-center">
            <Button variant="outline" size="sm" asChild className="border-sweeply text-sweeply py-1.5 px-3 text-sm mr-2">
              <Link to="/login">Login</Link>
            </Button>
            <Button 
              className="bg-sweeply hover:bg-sweeply-dark text-white text-sm py-1.5 px-3 mr-2"
              onClick={() => window.open('https://sweeply.com/demo', '_blank')}
            >
              Demo
            </Button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sweeply"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        {isMenuOpen && (
          <div className="md:hidden px-2 pt-2 pb-4 space-y-1 sm:px-3 border-t border-gray-200 bg-white/95">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/platform" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Platform
            </Link>
            <Link 
              to="/pricing" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
