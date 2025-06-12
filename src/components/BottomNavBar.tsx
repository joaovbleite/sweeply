import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home,
  LayoutGrid,
  BarChart3,
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
  X
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";

const BottomNavBar: React.FC = () => {
  const { t } = useTranslation(['navigation', 'common']);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("");
  const navRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  // Define the navigation items with the Plus button in the middle (3rd position)
  const navItems = [
    { id: "home", icon: Home, path: "/dashboard" },
    { id: "schedule", icon: Calendar, path: "/schedule" },
    { id: "add", icon: Plus, path: "#", isAction: true },
    { id: "clients", icon: Users, path: "/clients" },
    { id: "more", icon: MoreHorizontal, path: "/more" }
  ];

  // Original FloatingActionMenu items
  const menuItems = [
    { 
      id: "client", 
      label: "Client", 
      icon: User, 
      action: () => navigate("/clients/new"),
      color: "bg-slate-50",
      iconColor: "text-slate-600"
    },
    { 
      id: "job", 
      label: "Job", 
      icon: Briefcase, 
      action: () => navigate("/jobs/new"),
      color: "bg-green-50",
      iconColor: "text-green-600"
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

  // Update active tab based on location
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = navItems.find(
      item => !item.isAction && (currentPath === item.path || 
      (item.id === "clients" && currentPath.includes("/client")))
    );
    
    if (activeItem) {
      setActiveTab(activeItem.id);
    }
  }, [location.pathname]);
  
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
    <div className="fixed bottom-24 left-0 right-0 mx-auto px-4 z-50 lg:hidden">
      <nav 
        ref={navRef}
        className="bg-black text-white rounded-full flex items-center justify-between px-6 py-3.5 max-w-md mx-auto shadow-xl relative"
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = !item.isAction && (location.pathname === item.path || 
                          (item.id === "clients" && location.pathname.includes("/client")));
          
          if (item.isAction) {
            // Floating action button in the middle - preserving original styles and appearance
            return (
              <button
                key={item.id}
                className={`fab-button relative flex items-center justify-center z-10 bg-[#1a2e35] w-12 h-12 rounded-full shadow-lg transform transition-all duration-300 ${isMenuOpen ? 'rotate-45' : ''}`}
                aria-label="Create new"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            );
          }
          
          return (
            <Link
              key={item.id}
              to={item.path}
              data-id={item.id}
              className="relative flex items-center justify-center z-10 transition-all duration-200 ease-in-out w-10 h-10"
              aria-label={item.id}
              onClick={() => setActiveTab(item.id)}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-white rounded-full"
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative z-10 ${isActive ? "text-black" : "text-white hover:text-gray-300"}`}>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* Floating Action Menu - Preserving original menu appearance and functionality */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className="floating-menu-container fixed right-6 bottom-[calc(theme(spacing.24)+theme(spacing.5))] z-50 flex flex-col-reverse items-end space-y-reverse space-y-3 pb-16"
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item, index) => (
            <div 
              key={item.id}
              className={`flex items-center justify-between bg-white rounded-full shadow-md cursor-pointer transform transition-all duration-300 hover:scale-105 w-auto min-w-[160px] ${
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
              <span className="text-[#1a2e35] font-medium px-4 py-3">{item.label}</span>
              <div className={`${item.color} rounded-full p-3 ml-1`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNavBar; 