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
  const [previousTab, setPreviousTab] = useState<string>("");
  const [direction, setDirection] = useState<number>(0);
  
  // Define the navigation items with the Plus button in the middle (3rd position)
  const navItems = [
    { id: "home", icon: Home, path: "/dashboard" },
    { id: "schedule", icon: Calendar, path: "/schedule" },
    { id: "add", icon: isMenuOpen ? X : Plus, path: "#", isAction: true },
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
      // Determine direction of navigation
      if (previousTab) {
        const prevIndex = navItems.findIndex(item => item.id === previousTab);
        const currentIndex = navItems.findIndex(item => item.id === activeItem.id);
        
        // Skip the action button in the middle when calculating direction
        const adjustedPrevIndex = prevIndex > 2 ? prevIndex - 1 : prevIndex;
        const adjustedCurrentIndex = currentIndex > 2 ? currentIndex - 1 : currentIndex;
        
        setDirection(adjustedCurrentIndex - adjustedPrevIndex);
      }
      
      setPreviousTab(activeTab);
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
    <>
      {/* Floating Action Menu - Centered and appears on top of other elements */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className="floating-menu-container fixed left-1/2 -translate-x-1/2 bottom-28 z-50 flex flex-col-reverse items-center space-y-reverse space-y-3 pb-2"
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
      
      {/* Bottom Nav Bar - Always visible */}
      <nav 
        ref={navRef}
        className="bg-black text-white rounded-full flex items-center justify-between px-5 py-3 max-w-md mx-auto shadow-xl relative overflow-hidden"
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 48px)',
          maxWidth: '360px',
          zIndex: 100,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          isolation: 'isolate',
          transformStyle: 'preserve-3d'
        }}
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
                  className={`fab-button relative flex items-center justify-center z-10 bg-[#1a2e35] w-11 h-11 rounded-full shadow-lg ${isMenuOpen ? 'rotate-45' : ''}`}
                  aria-label="Create new"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <Icon className="w-5 h-5 text-white" />
                </button>
              );
            }
          
          return (
            <Link
              key={item.id}
              to={item.path}
              data-id={item.id}
              className="relative flex items-center justify-center z-10 w-9 h-9"
              aria-label={item.id}
              onClick={() => {
                setPreviousTab(activeTab);
                setActiveTab(item.id);
              }}
            >
              <Icon 
                className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/60'}`} 
              />
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default BottomNavBar; 