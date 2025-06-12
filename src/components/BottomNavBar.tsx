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
  Plus
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
  
  // Handle the floating action button click
  const handleActionClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
            // Floating action button in the middle
            return (
              <button
                key={item.id}
                className="relative flex items-center justify-center z-10 bg-[#1a2e35] w-12 h-12 rounded-full shadow-lg transform transition-all duration-300 border-2 border-black hover:scale-105"
                aria-label="Create new"
                onClick={handleActionClick}
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
      
      {/* Floating Action Menu (shown when the + button is clicked) */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="fixed left-1/2 transform -translate-x-1/2 bottom-40 z-50 flex flex-col items-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick action buttons */}
            <div className="flex flex-col space-y-3">
              <button 
                className="flex items-center bg-white rounded-full shadow-md p-3 min-w-[160px]"
                onClick={() => {
                  navigate("/clients/new");
                  setIsMenuOpen(false);
                }}
              >
                <span className="flex-1 text-center font-medium">New Client</span>
              </button>
              <button 
                className="flex items-center bg-white rounded-full shadow-md p-3 min-w-[160px]"
                onClick={() => {
                  navigate("/jobs/new");
                  setIsMenuOpen(false);
                }}
              >
                <span className="flex-1 text-center font-medium">New Job</span>
              </button>
              <button 
                className="flex items-center bg-white rounded-full shadow-md p-3 min-w-[160px]"
                onClick={() => {
                  navigate("/quotes/new");
                  setIsMenuOpen(false);
                }}
              >
                <span className="flex-1 text-center font-medium">New Quote</span>
              </button>
              <button 
                className="flex items-center bg-white rounded-full shadow-md p-3 min-w-[160px]"
                onClick={() => {
                  navigate("/invoices/new");
                  setIsMenuOpen(false);
                }}
              >
                <span className="flex-1 text-center font-medium">New Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomNavBar; 