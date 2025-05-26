import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  FileText, 
  CreditCard, 
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import AppLayout from "@/components/AppLayout";
import { jobsApi } from "@/lib/api/jobs";
import { clientsApi } from "@/lib/api/clients";
import { invoicesApi } from "@/lib/api/invoices";
import { Job } from "@/types/job";
import { Client } from "@/types/client";
import { Invoice } from "@/types/invoice";
import { format, isToday, startOfDay, endOfDay } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard', 'common', 'navigation']);
  const { formatCurrency, formatDate } = useLocale();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Get user's name from metadata or email
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  // Load dashboard data
  const loadDashboardData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [jobsData, clientsData, invoicesData] = await Promise.all([
        jobsApi.getAll(),
        clientsApi.getAll(),
        invoicesApi.getAll()
      ]);

      setJobs(jobsData);
      setClients(clientsData);
      setInvoices(invoicesData);

      if (showRefreshToast) {
        toast.success(t('dashboard:dataRefreshed'));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(t('dashboard:errorLoadingData'));
      toast.error(t('common:errorOccurred'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Calculate dashboard statistics
  const stats = React.useMemo(() => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Today's jobs
    const todaysJobs = jobs.filter(job => {
      const jobDate = new Date(job.scheduled_date);
      return jobDate >= todayStart && jobDate <= todayEnd;
    });

    // Active clients
    const activeClients = clients.filter(client => client.is_active);

    // Pending invoices (unpaid)
    const pendingInvoices = invoices.filter(invoice => invoice.status === 'sent' || invoice.status === 'overdue');
    const pendingAmount = pendingInvoices.reduce((sum, invoice) => sum + invoice.balance_due, 0);

    // Total hours today
    const totalHoursToday = todaysJobs.reduce((sum, job) => {
      return sum + ((job.estimated_duration || 120) / 60); // Convert minutes to hours, default 2 hours
    }, 0);

    return [
      { 
        label: t('dashboard:jobsToday'), 
        value: todaysJobs.length.toString(), 
        icon: Calendar, 
        color: "from-blue-500 to-blue-600",
        trend: todaysJobs.length > 0 ? 'up' : 'neutral'
      },
      { 
        label: t('dashboard:activeClients'), 
        value: activeClients.length.toString(), 
        icon: Users, 
        color: "from-purple-500 to-purple-600",
        trend: 'up'
      },
      { 
        label: t('dashboard:pendingInvoices'), 
        value: formatCurrency(pendingAmount), 
        icon: DollarSign, 
        color: "from-orange-500 to-orange-600",
        trend: pendingInvoices.length > 0 ? 'down' : 'neutral'
      },
      { 
        label: t('dashboard:hoursToday'), 
        value: `${totalHoursToday.toFixed(1)}h`, 
        icon: Clock, 
        color: "from-green-500 to-green-600",
        trend: 'up'
      },
    ];
  }, [jobs, clients, invoices, formatCurrency, t]);

  // Today's upcoming jobs
  const upcomingJobs = React.useMemo(() => {
    const today = new Date();
    return jobs
      .filter(job => isToday(new Date(job.scheduled_date)))
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
      .slice(0, 5); // Show only next 5 jobs
  }, [jobs]);

  // Handle refresh
  const handleRefresh = () => {
    loadDashboardData(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pulse-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('dashboard:loadingDashboard')}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('dashboard:errorTitle')}</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => loadDashboardData()}
              className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              {t('dashboard:tryAgain')}
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              {t('dashboard:welcome')}, {userName}!
            </h1>
            <p className="text-gray-600 mt-1">{t('dashboard:todayIs')} {formatDate(new Date())}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? t('dashboard:refreshing') : t('dashboard:refresh')}
          </button>
        </div>

        {/* Connection Status */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-800 font-medium">
              {t('dashboard:connectedAs')}: {user?.email}
            </span>
            <span className="text-green-600 text-sm">
              ({t('dashboard:dataLoaded')}: {jobs.length} {t('dashboard:jobs')}, {clients.length} {t('dashboard:clients')})
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? XCircle : CheckCircle;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendIcon className={`w-5 h-5 ${
                    stat.trend === 'up' ? 'text-green-500' : 
                    stat.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <div className="mt-3 flex items-center">
                  <div className={`w-full bg-gray-200 rounded-full h-2 ${stat.trend === 'up' ? 'bg-green-100' : stat.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        stat.trend === 'up' ? 'bg-green-500' : 
                        stat.trend === 'down' ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${Math.random() * 60 + 40}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-pulse-500" />
                {t('dashboard:todaysSchedule')}
              </h2>
              <span className="bg-pulse-100 text-pulse-700 px-3 py-1 rounded-full text-sm font-medium">
                {upcomingJobs.length} {t('dashboard:jobsScheduled')}
              </span>
            </div>
            
            {upcomingJobs.length > 0 ? (
              <div className="space-y-4">
                {upcomingJobs.map((job, index) => (
                  <div key={job.id} className="group p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-pulse-50 hover:to-pulse-100 transition-all duration-300 border border-gray-200 hover:border-pulse-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-pulse-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-pulse-700 transition-colors">
                              {job.client?.name || t('dashboard:unknownClient')}
                            </h4>
                            <p className="text-sm text-gray-600 capitalize">
                              {job.service_type?.replace('_', ' ') || t('dashboard:cleaningService')}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 ml-13">
                          📍 {job.address || t('dashboard:noAddress')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-pulse-600">
                          {format(new Date(job.scheduled_date), 'HH:mm')}
                        </span>
                        <p className="text-sm text-gray-600 font-medium">
                          {formatCurrency(job.estimated_price || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard:noJobsToday')}</h3>
                <p className="text-gray-500 mb-4">Start by scheduling your first job of the day</p>
                <Link 
                  to="/jobs/new"
                  className="inline-flex items-center gap-2 bg-pulse-500 text-white px-4 py-2 rounded-lg hover:bg-pulse-600 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  {t('dashboard:scheduleJob')}
                </Link>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link 
                to="/calendar"
                className="flex items-center justify-center gap-2 w-full py-3 text-pulse-600 font-medium hover:text-pulse-700 hover:bg-pulse-50 rounded-lg transition-all"
              >
                {t('dashboard:viewFullCalendar')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-pulse-500" />
              {t('dashboard:quickActions')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/jobs/new"
                className="group p-6 bg-gradient-to-br from-pulse-500 to-pulse-600 text-white rounded-xl hover:from-pulse-600 hover:to-pulse-700 transition-all transform hover:scale-[1.05] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <span className="block text-sm font-semibold">{t('dashboard:newJob')}</span>
                <span className="block text-xs opacity-90 mt-1">Schedule cleaning</span>
              </Link>
              
              <Link 
                to="/invoices"
                className="group p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-[1.05] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <FileText className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <span className="block text-sm font-semibold">{t('dashboard:createInvoice')}</span>
                <span className="block text-xs opacity-90 mt-1">Bill clients</span>
              </Link>
              
              <Link 
                to="/clients/new"
                className="group p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.05] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <Users className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <span className="block text-sm font-semibold">{t('dashboard:addClient')}</span>
                <span className="block text-xs opacity-90 mt-1">Grow network</span>
              </Link>
              
              <Link 
                to="/reports"
                className="group p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-[1.05] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <TrendingUp className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <span className="block text-sm font-semibold">{t('dashboard:viewReports')}</span>
                <span className="block text-xs opacity-90 mt-1">Track progress</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard; 