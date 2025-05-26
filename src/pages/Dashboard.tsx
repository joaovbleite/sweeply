import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  FileText, 
  CreditCard, 
  DollarSign,
  Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import AppLayout from "@/components/AppLayout";
import { testSupabaseConnection, checkEnvironmentVariables } from "@/lib/test-supabase";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard', 'common', 'navigation']);
  const { formatCurrency, formatDate } = useLocale();
  const [activeTab, setActiveTab] = useState("overview");

  // Get user's name from metadata or email
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  // Test Supabase connection on component mount
  useEffect(() => {
    const runTests = async () => {
      console.log('🧪 Running Supabase tests...');
      console.log('👤 Current user object:', user);
      console.log('📧 User email:', user?.email);
      console.log('🆔 User ID:', user?.id);
      console.log('📝 User metadata:', user?.user_metadata);
      
      checkEnvironmentVariables();
      await testSupabaseConnection();
    };
    
    runTests();
  }, [user]);

  // Mock data for the dashboard
  const stats = [
    { label: t('dashboard:jobsToday'), value: "12", icon: Calendar, color: "from-blue-500 to-blue-600" },
    { label: t('dashboard:activeClients'), value: "48", icon: Users, color: "from-purple-500 to-purple-600" },
    { label: t('dashboard:pendingInvoices'), value: formatCurrency(2847), icon: DollarSign, color: "from-orange-500 to-orange-600" },
    { label: t('common:duration'), value: "18.5h", icon: Clock, color: "from-green-500 to-green-600" },
  ];

  const upcomingJobs = [
    { id: 1, client: "Maria Silva", time: "9:00 AM", service: t('jobs:regularCleaning') },
    { id: 2, client: "João Santos", time: "11:30 AM", service: t('jobs:deepCleaning') },
    { id: 3, client: "Ana Costa", time: "2:00 PM", service: t('jobs:moveInOut') },
  ];

  return (
    <AppLayout>
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            {t('dashboard:welcome')}
          </h1>
          <p className="text-gray-600 mt-1">{t('common:tagline')}</p>
        </div>

        {/* Authentication Status Banner */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">
              ✅ Authenticated as: {user?.email}
            </span>
            <span className="text-green-600 text-sm">
              (User ID: {user?.id?.slice(0, 8)}...)
            </span>
          </div>
        </div>

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
              {t('dashboard:todaysSummary')}
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
            <Link 
              to="/calendar"
              className="mt-4 block w-full text-center py-2 text-pulse-600 font-medium hover:text-pulse-700 transition-colors"
            >
              {t('navigation:calendar')} →
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
              {t('dashboard:quickStats')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/jobs/new"
                className="p-4 bg-gradient-to-r from-pulse-500 to-pulse-600 text-white rounded-lg hover:from-pulse-600 hover:to-pulse-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center"
              >
                <Calendar className="w-6 h-6 mb-2" />
                <span className="block text-sm font-medium">{t('jobs:newJob')}</span>
              </Link>
              <Link 
                to="/invoices"
                className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center"
              >
                <FileText className="w-6 h-6 mb-2" />
                <span className="block text-sm font-medium">{t('common:invoice')}</span>
              </Link>
              <Link 
                to="/clients/new"
                className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center"
              >
                <Users className="w-6 h-6 mb-2" />
                <span className="block text-sm font-medium">{t('clients:addClient')}</span>
              </Link>
              <Link 
                to="/invoices"
                className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center"
              >
                <CreditCard className="w-6 h-6 mb-2" />
                <span className="block text-sm font-medium">{t('common:payment')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard; 