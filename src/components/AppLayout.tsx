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
  Calculator
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useProfile";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation(['navigation', 'common']);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userProfile } = useProfile();

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
    { id: "overview", label: t('navigation:dashboard'), icon: LayoutDashboard, path: "/dashboard" },
    { id: "calendar", label: t('navigation:calendar'), icon: Calendar, path: "/calendar" },
    { id: "jobs", label: t('navigation:jobs'), icon: Briefcase, path: "/jobs" },
    { id: "clients", label: t('navigation:clients'), icon: Users, path: "/clients" },
    { id: "invoices", label: t('navigation:invoices'), icon: FileText, path: "/invoices" },
    { id: "pricing", label: t('navigation:pricing'), icon: Calculator, path: "/pricing" },
    { id: "reports", label: t('navigation:reports'), icon: BarChart3, path: "/reports" },
    { id: "employees", label: t('navigation:team'), icon: UserCheck, path: "/employees" },
    { id: "payroll", label: t('navigation:payroll'), icon: CreditCard, path: "/payroll" },
    { id: "settings", label: t('navigation:settings'), icon: Settings, path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside 
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-[270px] bg-white shadow-lg transition-transform duration-300 transform 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:inset-0 lg:w-64 lg:z-0 lg:min-h-screen overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 border-b sticky top-0 bg-white z-10">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
            <img src="/sweeply-favicon.png" alt="Sweeply" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-pulse-500 to-pulse-600 bg-clip-text text-transparent">
              Sweeply
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

        <nav className="p-2 sm:p-3 md:p-4">
          <ul className="space-y-0.5 sm:space-y-1 md:space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-pulse-50 text-pulse-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="font-medium text-xs sm:text-sm md:text-base truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
            <button
              id="menu-button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <div className="text-xs sm:text-sm md:text-base text-gray-500 lg:hidden">
              {/* Show current page name on mobile */}
              {sidebarItems.find(item => item.path === location.pathname)?.label || 'Sweeply'}
            </div>
            
            <div className="lg:hidden w-4 h-4 sm:w-5 sm:h-5">
              {/* Empty div for flex spacing */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
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