
import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-white py-8"> {/* Adjusted padding for consistency */}
      <div className="section-container">
        <p className="text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} Sweeply. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
