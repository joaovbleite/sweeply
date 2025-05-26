import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  Briefcase,
  FileText, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get user's name from metadata or email
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  const handleLogout = async () => {
    await signOut();
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Calendar, path: "/dashboard" },
    { id: "jobs", label: "Jobs", icon: Briefcase, path: "/jobs" },
    { id: "clients", label: "Clients", icon: Users, path: "/clients" },
    { id: "invoices", label: "Invoices", icon: FileText, path: "/invoices" },
    { id: "payments", label: "Payments", icon: CreditCard, path: "/payments" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <img src="/sweeply-favicon.png" alt="Sweeply" className="w-8 h-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-pulse-500 to-pulse-600 bg-clip-text text-transparent">
              Sweeply
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-pulse-50 text-pulse-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {userName}
              </span>
              <div className="w-10 h-10 bg-pulse-500 rounded-full flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout; 