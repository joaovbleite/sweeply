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
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";

const BottomNavBar: React.FC = () => {
  const { t } = useTranslation(['navigation', 'common']);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  // Define the navigation items
  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard" },
    { id: "schedule", label: "Schedule", icon: Calendar, path: "/schedule" },
    { id: "add", label: "", icon: Plus, path: "#", action: () => setIsMenuOpen(!isMenuOpen) },
    { id: "clients", label: "Clients", icon: User, path: "/clients" },
    { id: "more", label: "More", icon: MoreHorizontal, path: "/more" }
  ];

  // Original FloatingActionMenu items
  const menuItems = [
    { 
      id: "job", 
      label: "Job", 
      icon: Briefcase, 
      action: () => navigate("/jobs/new"),
      color: "bg-green-50",
      iconColor: "text-green-600"
    },
    { 
      id: "client", 
      label: "Client", 
      icon: User, 
      action: () => navigate("/clients/new"),
      color: "bg-slate-50",
      iconColor: "text-slate-600"
    },
    { 
      id: "quote", 
      label: "Quote", 
      icon: FileEdit, 
      action: () => navigate("/quotes/new"),
      color: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    { 
      id: "invoice", 
      label: "Invoice", 
      icon: FileText, 
      action: () => navigate("/invoices/new"),
      color: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    { 
      id: "expense", 
      label: "Expense", 
      icon: DollarSign, 
      action: () => navigate("/expenses/new"),
      color: "bg-green-50",
      iconColor: "text-green-600"
    },
    { 
      id: "task", 
      label: "Task", 
      icon: Clipboard, 
      action: () => navigate("/add-task"),
      color: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    { 
      id: "request", 
      label: "Request", 
      icon: Download, 
      action: () => navigate("/requests/new"),
      color: "bg-amber-50",
      iconColor: "text-amber-600"
    }
  ];

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.floating-menu-container') && !target.closest('.fab-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Floating Action Menu - Centered and appears on top of other elements */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className="floating-menu-container fixed left-1/2 -translate-x-1/2 bottom-36 z-50 flex flex-col-reverse items-center space-y-reverse space-y-3 pb-2"
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item, index) => (
            <div 
              key={item.id}
              className={`flex items-center justify-between bg-white rounded-full shadow-md cursor-pointer transform transition-all duration-300 hover:scale-105 w-auto min-w-[180px] ${
                isMenuOpen 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10 pointer-events-none'
              }`}
              style={{ 
                transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                pointerEvents: isMenuOpen ? 'auto' : 'none'
              }}
              onClick={() => {
                item.action();
                setIsMenuOpen(false);
              }}
            >
              <span className="text-[#1a2e35] font-medium text-base px-5 py-3.5">{item.label}</span>
              <div className={`${item.color} rounded-full p-3.5 ml-2`}>
                <item.icon className={`w-5.5 h-5.5 ${item.iconColor}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Floating Action Button - Top Right */}
      <button
        className="fab-button fixed right-4 top-4 z-50 w-16 h-16 bg-[#0F2B28] rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Create new"
      >
        {isMenuOpen ? (
          <X className="w-6 h-6" strokeWidth={2} />
        ) : (
          <Plus className="w-6 h-6" strokeWidth={2} />
        )}
      </button>
      
      {/* Bottom Navigation Bar - Fixed at bottom */}
      <nav 
        className="fixed left-0 right-0 bottom-0 h-[72px] bg-white border-t border-gray-200 flex items-center justify-around px-4 z-30"
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
              to={item.path}
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