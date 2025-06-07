import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return <footer className="w-full bg-white py-0">
      <div className="section-container">
        <div className="border-t border-gray-200 pt-8 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/64f9ad74-6bcc-41ac-85ed-b821343cc480.png" alt="Sweeply Logo" className="h-8" />
              <span className="text-lg font-semibold text-gray-900">Sweeply</span>
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link to="/privacy-policy" className="hover:text-pulse-500 transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-pulse-500 transition-colors">Terms of Service</Link>
              <Link to="/support" className="hover:text-pulse-500 transition-colors">Support</Link>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-500 text-sm">
              © 2024 Sweeply. All rights reserved. Empowering cleaning professionals worldwide.
            </p>
          </div>
        </div>
      </div>
    </footer>;
};

export default Footer;
