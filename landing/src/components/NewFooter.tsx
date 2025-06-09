import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const NewFooter: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and tagline */}
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center text-2xl font-bold text-gray-900 mb-2">
              <Zap className="w-6 h-6 mr-2 text-blue-600" />
              Sweeply
            </Link>
            <p className="text-gray-600 text-sm">
              The ultimate tool to manage your cleaning business
            </p>
          </div>
          
          {/* Copyright */}
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Sweeply. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter; 