import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home,
  Clock,
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
  
  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard" },
    { id: "schedule", label: "Schedule", icon: Calendar, path: "/schedule" },
    { id: "add", label: "", icon: Plus, path: "#", action: () => setIsMenuOpen(!isMenuOpen) },
    { id: "clients", label: "Hub", icon: User, path: "/clients" },
    { id: "more", label: "More", icon: MoreHorizontal, path: "/more" }
  ];

  const menuItems = [
    { id: "job", label: "Job", icon: Briefcase, action: () => navigate("/jobs/new") },
    { id: "client", label: "Client", icon: User, action: () => navigate("/clients/new") },
    { id: "quote", label: "Quote", icon: FileEdit, action: () => navigate("/quotes/new") },
    { id: "invoice", label: "Invoice", icon: FileText, action: () => navigate("/invoices/new") },
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
          className="floating-menu-container fixed left-1/2 -translate-x-1/2 bottom-36 z-50 flex flex-col-reverse items-center space-y-reverse space-y-3"
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
      
      {/* Enhanced blur effect extending well below the toolbar */}
      <div 
        className="fixed left-0 right-0 bottom-0 z-20"
        style={{
          height: '250px', // Significantly larger to extend well below the toolbar
          background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.85) 30%, white)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          pointerEvents: 'none', // So it doesn't interfere with touch events
        }}
      />
      
      {/* Bottom Navigation Bar - Fixed at bottom with proper padding */}
      <nav 
        className="fixed left-0 right-0 h-[72px] bg-white/70 backdrop-blur-xl border-t border-gray-200 shadow-xl flex items-center justify-around px-4 z-40 mx-2 rounded-2xl"
        style={{
          bottom: '80px', // Position higher above the bottom of the screen
          position: 'fixed', // Ensure it stays fixed
          transform: 'translateZ(0)', // Hardware acceleration for smoother fixed positioning
          willChange: 'transform', // Hint to browser for optimization
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
            
          if (item.id === "add") {
              return (
                <button
                  key={item.id}
                onClick={item.action}
                className="flex flex-col items-center justify-center bg-[#0F2B28] w-12 h-12 rounded-full -mt-4"
                >
                <Icon 
                  className="w-6 h-6 text-white" 
                  strokeWidth={2}
                  fill="none"
                />
                </button>
              );
            }
          
          return (
            <Link
              key={item.id}
              to={item.path || '#'}
              className="flex flex-col items-center justify-center"
            >
              <Icon 
                className={`w-6 h-6 mb-1 ${isActive ? 'text-[#0F2B28]' : 'text-[#4A5D5A]'}`} 
                strokeWidth={2}
                fill="none"
              />
              <span 
                className={`text-xs font-medium ${isActive ? 'text-[#0F2B28]' : 'text-[#4A5D5A]'}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default BottomNavBar; 