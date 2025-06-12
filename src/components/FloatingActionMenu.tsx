import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Download, 
  FileText, 
  Clipboard, 
  FileEdit, 
  Briefcase,
  User,
  X,
  DollarSign
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from "react-router-dom";

const FloatingActionMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.floating-menu-container') && !target.closest('.fab-button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Menu items with custom colors (reversed order)
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

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button - positioned in center of navbar */}
      <button
        className={`fab-button fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-[#1a2e35] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 ${isOpen ? 'rotate-45' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Create new"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Menu Overlay with Blur */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div 
          className="floating-menu-container fixed left-1/2 transform -translate-x-1/2 bottom-40 z-50 flex flex-col-reverse items-end space-y-reverse space-y-3 pb-16"
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item, index) => (
            <div 
              key={item.id}
              className={`flex items-center justify-between bg-white rounded-full shadow-md cursor-pointer transform transition-all duration-300 hover:scale-105 w-auto min-w-[160px] ${
                isOpen 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10 pointer-events-none'
              }`}
              style={{ 
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                pointerEvents: isOpen ? 'auto' : 'none'
              }}
              onClick={() => {
                item.action();
                setIsOpen(false);
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
    </>
  );
};

export default FloatingActionMenu; 