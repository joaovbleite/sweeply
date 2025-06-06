import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard,
  Calendar, 
  Users, 
  Briefcase,
  FileText, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X,
  UserCheck,
  BarChart3,
  Calculator,
  Home,
  Clock,
  Quote,
  Globe
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavBar from "./BottomNavBar";
import FloatingActionMenu from "./FloatingActionMenu";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation(['navigation', 'common']);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userProfile } = useProfile();
  const isMobile = useIsMobile();

  // Get user's name from profile or metadata or email
  const userName = userProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('mobile-sidebar');
        const menuButton = document.getElementById('menu-button');
        
        if (sidebar && !sidebar.contains(event.target as Node) && 
            menuButton && !menuButton.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
  };

  const sidebarItems = [
    { id: "home", label: t('navigation:home'), icon: Home, path: "/dashboard" },
    { id: "schedule", label: t('navigation:calendar'), icon: Calendar, path: "/calendar" },
    { id: "clients", label: t('navigation:clients'), icon: Users, path: "/clients" },
    { id: "jobs", label: t('navigation:jobs'), icon: Briefcase, path: "/jobs" },
    { id: "invoices", label: t('navigation:invoices'), icon: FileText, path: "/invoices" },
    { id: "quotes", label: t('navigation:quotes'), icon: Quote, path: "/pricing" },
    { id: "requests", label: t('navigation:requests'), icon: Clock, path: "/reports" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside 
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-[270px] transition-transform duration-300 transform 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:inset-0 lg:w-56 lg:z-0 lg:min-h-screen overflow-y-auto
          ${isMobile ? 'bg-white' : 'bg-[#121212] text-white'}`}
      >
        <div className={`flex items-center justify-between p-3 sm:p-4 sticky top-0 z-10 
          ${isMobile ? 'border-b bg-white' : 'bg-[#121212] border-b border-gray-800'}`}>
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
            <img src="/sweeply-favicon.png" alt="Sweeply" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-6 lg:h-6" />
            <span className={`text-base sm:text-lg font-bold 
              ${isMobile ? 'bg-gradient-to-r from-pulse-500 to-pulse-600 bg-clip-text text-transparent' : 'text-white'}`}>
              {isMobile ? 'Sweeply' : 'Accessible Health Care'}
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Create button - Desktop only */}
        {!isMobile && (
          <div className="px-4 py-3">
            <button className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
              <Menu className="w-5 h-5" />
              <span className="text-sm font-medium">Create</span>
            </button>
          </div>
        )}

        <nav className={`p-2 sm:p-3 ${isMobile ? 'md:p-4' : 'p-2'}`}>
          <ul className={`${isMobile ? 'space-y-0.5 sm:space-y-1 md:space-y-2' : 'space-y-1'}`}>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                      isMobile 
                        ? isActive
                          ? 'bg-pulse-50 text-pulse-600'
                          : 'text-gray-700 hover:bg-gray-100'
                        : isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className={`${isMobile ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-4 h-4'} flex-shrink-0`} />
                    <span className={`font-medium ${isMobile ? 'text-xs sm:text-sm md:text-base' : 'text-sm'} truncate`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {!isMobile && (
          <div className="px-4 py-3 mt-auto">
            <Link
              to="/settings"
              className="w-full flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-sm truncate">Settings</span>
            </Link>
            
            <Link
              to="/profile"
              className="w-full flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors mt-1"
            >
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-3 h-3 text-black" />
              </div>
              <span className="font-medium text-sm truncate">Profile</span>
            </Link>
            
            <a
              href="https://sweeplypro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors mt-1"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://sweeplypro.com', '_blank');
              }}
            >
              <Globe className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-sm truncate">Visit Website</span>
            </a>

            <a
              href="https://sweeplypro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors mt-1"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://sweeplypro.com', '_blank');
              }}
            >
              <Globe className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-sm truncate">Visit Website</span>
            </a>
          </div>
        )}

        {isMobile && (
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 border-t space-y-0.5 sm:space-y-1 md:space-y-2 bg-white">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="font-medium text-xs sm:text-sm md:text-base">{t('common:logout')}</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        {/* Page Content - removed the header for desktop */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Bottom Navigation Bar - Mobile Only */}
        <BottomNavBar />
        
        {/* Floating Action Menu - Mobile Only */}
        <FloatingActionMenu />
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default AppLayout; 