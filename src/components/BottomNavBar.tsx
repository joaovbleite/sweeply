import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home,
  LayoutGrid,
  BarChart3,
  User,
  MoreHorizontal,
  Calendar,
  DollarSign
} from "lucide-react";
import { useTranslation } from "react-i18next";

const BottomNavBar: React.FC = () => {
  const { t } = useTranslation(['navigation', 'common']);
  const location = useLocation();

  // Define the navigation items based on the image
  // Home, Schedule, Finance, Jobs, More, Profile
  const navItems = [
    { id: "home", icon: Home, path: "/dashboard" },
    { id: "schedule", icon: Calendar, path: "/schedule" },
    { id: "finance", icon: DollarSign, path: "/finance" },
    { id: "more", icon: MoreHorizontal, path: "/more" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto px-4 z-50 lg:hidden pb-safe">
      <nav className="bg-[#121212] text-white rounded-full flex items-center justify-between px-6 py-3.5 max-w-md mx-auto shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center justify-center w-9 h-9 transition-all duration-200 ease-in-out ${
                isActive 
                  ? "text-white scale-110" 
                  : "text-gray-400 hover:text-white hover:scale-105"
              }`}
              aria-label={item.id}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
            </Link>
          );
        })}
        
        {/* Profile button - special styling to match the image */}
        <Link
          to="/profile"
          className={`flex items-center justify-center w-11 h-11 bg-white rounded-full shadow-sm transition-all duration-200 ease-in-out hover:scale-105 ${
            location.pathname === "/profile" 
              ? "ring-2 ring-white" 
              : ""
          }`}
          aria-label="profile"
        >
          <User className="w-5 h-5 text-black" strokeWidth={2} />
        </Link>
      </nav>
    </div>
  );
};

export default BottomNavBar; 