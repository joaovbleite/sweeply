import React from "react";
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

const BottomNavBar: React.FC = () => {
  const { t } = useTranslation(['navigation', 'common']);
  const location = useLocation();

  // Define the navigation items based on the image
  // Home, Schedule, Finance, More
  const navItems = [
    { id: "home", icon: Home, path: "/dashboard" },
    { id: "schedule", icon: Calendar, path: "/schedule" },
    { id: "finance", icon: DollarSign, path: "/finance" },
    { id: "more", icon: MoreHorizontal, path: "/more" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto px-4 z-50 lg:hidden pb-safe">
      <nav className="bg-white text-[#121212] rounded-full flex items-center justify-between px-6 py-3.5 max-w-md mx-auto shadow-lg border border-gray-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center justify-center w-9 h-9 transition-all duration-200 ease-in-out ${
                isActive 
                  ? "text-green-600 scale-110" 
                  : "text-gray-600 hover:text-green-600 hover:scale-105"
              }`}
              aria-label={item.id}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
            </Link>
          );
        })}
        
        {/* Clients button - replacing the Profile button */}
        <Link
          to="/clients"
          className={`flex items-center justify-center w-11 h-11 bg-[#307842] text-white rounded-full shadow-sm transition-all duration-200 ease-in-out hover:scale-105 ${
            location.pathname === "/clients" || location.pathname.includes("/client") 
              ? "ring-2 ring-green-300" 
              : ""
          }`}
          aria-label="clients"
        >
          <Users className="w-5 h-5" strokeWidth={2} />
        </Link>
      </nav>
    </div>
  );
};

export default BottomNavBar; 