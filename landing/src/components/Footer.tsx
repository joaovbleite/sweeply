import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Zap } from 'lucide-react'; // Added Zap for Sweeply logo

const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <Link to={to} className="text-gray-500 hover:text-sweeply transition-colors duration-200">
    {children}
  </Link>
);

const SocialLink = ({ href, icon: Icon }: { href: string, icon: React.ElementType }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-sweeply transition-colors duration-200">
    <Icon className="w-6 h-6" />
  </a>
);

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          {/* Sweeply Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-6 lg:mb-0">
            <Link to="/" className="flex items-center text-2xl font-bold text-sweeply-dark mb-3">
              <Zap className="w-8 h-8 mr-2 text-sweeply" />
              Sweeply
            </Link>
            <p className="text-gray-600 text-sm max-w-xs">
              The ultimate tool to manage & grow your cleaning business.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-3">
              <li><FooterLink to="/features">Features</FooterLink></li>
              <li><FooterLink to="/pricing">Pricing</FooterLink></li>
              <li><FooterLink to="/integrations">Integrations</FooterLink></li>
              <li><FooterLink to="/request-demo">Request a Demo</FooterLink></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li><FooterLink to="/about-us">About Us</FooterLink></li>
              <li><FooterLink to="/careers">Careers</FooterLink></li>
              <li><FooterLink to="/contact">Contact</FooterLink></li>
              <li><FooterLink to="/blog">Blog</FooterLink></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><FooterLink to="/support">Support Center</FooterLink></li>
              <li><FooterLink to="/faq">FAQ</FooterLink></li>
              <li><FooterLink to="/api-docs">API Documentation</FooterLink></li>
              <li><FooterLink to="/case-studies">Case Studies</FooterLink></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink to="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink to="/cookie-policy">Cookie Policy</FooterLink></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 sm:mb-0">
            &copy; {new Date().getFullYear()} Sweeply. All rights reserved.
          </p>
          <div className="flex space-x-5">
            <SocialLink href="https://facebook.com/sweeply" icon={Facebook} />
            <SocialLink href="https://instagram.com/sweeply" icon={Instagram} />
            <SocialLink href="https://twitter.com/sweeply" icon={Twitter} />
            <SocialLink href="https://linkedin.com/company/sweeply" icon={Linkedin} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
