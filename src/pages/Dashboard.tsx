import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X,
  DollarSign,
  Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { testSupabaseConnection, checkEnvironmentVariables } from "@/lib/test-supabase";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Get user's name from metadata or email
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  // Test Supabase connection on component mount
  useEffect(() => {
    const runTests = async () => {
      console.log('🧪 Running Supabase tests...');
      checkEnvironmentVariables();
      await testSupabaseConnection();
    };
    
    runTests();
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Calendar },
    { id: "clients", label: "Clients", icon: Users },
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Mock data for the dashboard
  const stats = [
    { label: "This Week's Jobs", value: "12", icon: Calendar, color: "from-blue-500 to-blue-600" },
    { label: "Active Clients", value: "48", icon: Users, color: "from-purple-500 to-purple-600" },
    { label: "Unpaid Invoices", value: "$2,847", icon: DollarSign, color: "from-orange-500 to-orange-600" },
    { label: "Hours Saved", value: "18.5", icon: Clock, color: "from-green-500 to-green-600" },
  ];

  const upcomingJobs = [
    { id: 1, client: "Maria Silva", time: "9:00 AM", service: "Regular Cleaning" },
    { id: 2, client: "João Santos", time: "11:30 AM", service: "Deep Cleaning" },
    { id: 3, client: "Ana Costa", time: "2:00 PM", service: "Move-out Cleaning" },
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
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-pulse-50 text-pulse-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
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
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Welcome back, {userName}!
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-pulse-500 rounded-full flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
                Today's Schedule
              </h2>
              <div className="space-y-4">
                {upcomingJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <h4 className="font-semibold text-gray-900">{job.client}</h4>
                      <p className="text-sm text-gray-600">{job.service}</p>
                    </div>
                    <span className="text-sm font-medium text-pulse-600">{job.time}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 text-pulse-600 font-medium hover:text-pulse-700 transition-colors">
                View full calendar →
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-gradient-to-r from-pulse-500 to-pulse-600 text-white rounded-lg hover:from-pulse-600 hover:to-pulse-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                  <Calendar className="w-6 h-6 mb-2" />
                  <span className="block text-sm font-medium">New Job</span>
                </button>
                <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="block text-sm font-medium">Create Invoice</span>
                </button>
                <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                  <Users className="w-6 h-6 mb-2" />
                  <span className="block text-sm font-medium">Add Client</span>
                </button>
                <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                  <CreditCard className="w-6 h-6 mb-2" />
                  <span className="block text-sm font-medium">Record Payment</span>
                </button>
              </div>
            </div>
          </div>
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

export default Dashboard; 