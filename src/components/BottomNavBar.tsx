import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const [activeTab, setActiveTab] = useState<string>("");
  const navRef = useRef<HTMLDivElement>(null);
  
  // Define the navigation items with the Plus button in the middle (3rd position)
  const navItems = [
    { id: "home", icon: Home, path: "/dashboard" },
    { id: "schedule", icon: Calendar, path: "/schedule" },
    // Third position is reserved for the floating action button
    { id: "clients", icon: Users, path: "/clients" },
    { id: "more", icon: MoreHorizontal, path: "/more" }
  ];

  // Update active tab based on location
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = navItems.find(
      item => currentPath === item.path || 
      (item.id === "clients" && currentPath.includes("/client"))
    );
    
    if (activeItem) {
      setActiveTab(activeItem.id);
    }
  }, [location.pathname]);

  return (
    <div className="fixed bottom-24 left-0 right-0 mx-auto px-4 z-50 lg:hidden">
      <nav 
        ref={navRef}
        className="bg-black text-white rounded-full flex items-center justify-between px-6 py-3.5 max-w-md mx-auto shadow-xl relative"
      >
        {/* First two nav items */}
        {navItems.slice(0, 2).map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.id === "clients" && location.pathname.includes("/client"));
          
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
        
        {/* Middle slot - FloatingActionMenu placeholder */}
        <div className="relative flex items-center justify-center z-10 w-10 h-10">
          <Plus className="opacity-0 w-5 h-5" strokeWidth={2} />
        </div>
        
        {/* Last two nav items */}
        {navItems.slice(2, 4).map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.id === "clients" && location.pathname.includes("/client"));
          
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
    </div>
  );
};

export default BottomNavBar; 