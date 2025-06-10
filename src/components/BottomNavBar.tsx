import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home,
  LayoutGrid,
  BarChart3,
  Users,
  MoreHorizontal,
  Calendar,
  DollarSign
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";

const BottomNavBar: React.FC = () => {
  const { t } = useTranslation(['navigation', 'common']);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("");
  const navRef = useRef<HTMLDivElement>(null);
  
  // Define the navigation items based on the image
  // Home, Schedule, Finance, Clients, More
  const navItems = [
    { id: "home", icon: Home, path: "/dashboard" },
    { id: "schedule", icon: Calendar, path: "/schedule" },
    { id: "finance", icon: DollarSign, path: "/finance" },
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
    <div className="fixed bottom-0 left-0 right-0 mx-auto px-4 z-50 lg:hidden pb-safe">
      <nav 
        ref={navRef}
        className="bg-black text-white rounded-full flex items-center justify-between px-6 py-3.5 max-w-md mx-auto shadow-lg relative"
      >
        {/* Animated background that moves between tabs */}
        <AnimatePresence initial={false}>
          {activeTab && (
            <motion.div
              key={activeTab}
              className="absolute w-9 h-9 bg-white rounded-full"
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ 
                scale: 1,
                opacity: 1,
                x: navRef.current 
                  ? Array.from(navRef.current.children)
                      .findIndex(child => child.getAttribute('data-id') === activeTab) * 
                      (navRef.current.offsetWidth - 12 * 2) / (navItems.length - 1) - 
                      9 // Half the width of the indicator to center it
                  : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              exit={{ scale: 0.8, opacity: 0 }}
            />
          )}
        </AnimatePresence>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.id === "clients" && location.pathname.includes("/client"));
          
          return (
            <Link
              key={item.id}
              to={item.path}
              data-id={item.id}
              className={`flex items-center justify-center z-10 transition-all duration-200 ease-in-out w-9 h-9 ${
                isActive 
                  ? "text-black" 
                  : "text-white hover:text-gray-300"
              }`}
              aria-label={item.id}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNavBar; 