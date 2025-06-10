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
  // Home, Schedule, Finance, Clients, More
  const navItems = [
    { id: "home", icon: Home, path: "/dashboard" },
    { id: "schedule", icon: Calendar, path: "/schedule" },
    { id: "finance", icon: DollarSign, path: "/finance" },
    { id: "clients", icon: Users, path: "/clients" },
    { id: "more", icon: MoreHorizontal, path: "/more" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto px-4 z-50 lg:hidden pb-safe">
      <nav className="bg-black text-white rounded-full flex items-center justify-between px-6 py-3.5 max-w-md mx-auto shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.id === "clients" && location.pathname.includes("/client"));
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center justify-center transition-all duration-200 ease-in-out ${
                isActive 
                  ? "bg-white text-black rounded-full w-9 h-9" 
                  : "text-white hover:text-gray-300 w-9 h-9"
              } ${item.id === "clients" ? "bg-[#3b82f6] text-white hover:scale-105" : ""}`}
              aria-label={item.id}
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