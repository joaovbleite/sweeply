import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home,
  Users,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Plus,
  Download, 
  FileText, 
  Clipboard, 
  FileEdit, 
  Briefcase,
  User,
  X,
  Search
} from "lucide-react";

const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navRef = useRef<HTMLElement>(null);

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard" },
    { id: "schedule", label: "Schedule", icon: Calendar, path: "/schedule" },
    { id: "add", label: "Add", icon: Plus, isAction: true },
    { id: "search", label: "Search", icon: Search, path: "/search" },
    { id: "more", label: "More", icon: MoreHorizontal, path: "/more" }
  ];

  const menuItems = [
    { id: "job", label: "Job", icon: Briefcase, action: () => navigate("/jobs/new") },
    { id: "client", label: "Client", icon: User, action: () => navigate("/clients/new") },
    { id: "quote", label: "Quote", icon: FileEdit, action: () => navigate("/quotes/new") },
    { id: "invoice", label: "Invoice", icon: FileText, action: () => navigate("/invoices/new") },
    { id: "expense", label: "Expense", icon: DollarSign, action: () => navigate("/expenses/new") },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.floating-menu-container') && !target.closest('.fab-button')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  return (
    <>
      {/* Floating Action Menu */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className="floating-menu-container fixed left-1/2 -translate-x-1/2 bottom-24 z-50 flex flex-col-reverse items-center space-y-reverse space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item, index) => (
            <div 
              key={item.id}
              className={`flex items-center bg-white rounded-full shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: isMenuOpen ? `${index * 40}ms` : '0ms' }}
              onClick={() => { item.action(); setIsMenuOpen(false); }}
            >
              <span className="text-gray-800 font-semibold text-lg px-6 py-3">{item.label}</span>
              <div className="bg-gray-100 rounded-full p-3 mr-2">
                <item.icon className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Black Rounded Bottom Nav Bar */}
      <nav 
        ref={navRef}
        className="bg-black text-white rounded-full flex items-center justify-between px-5 py-3 max-w-md mx-auto shadow-xl relative overflow-hidden"
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 64px)',
          maxWidth: '360px',
          zIndex: 100,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          isolation: 'isolate',
          transformStyle: 'preserve-3d'
        }}
      >
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path || '___');
          
          if (item.isAction) {
            return (
              <button
                key={item.id}
                className="fab-button w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-lg transform transition-transform duration-300 hover:scale-110"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Icon className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : ''}`} />
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path || '#'}
              className={`flex flex-col items-center justify-center transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default BottomNavBar; 