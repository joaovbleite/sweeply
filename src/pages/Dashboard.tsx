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
  CheckCircle,
  XCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  MapPin,
  ChevronRight,
  BarChart3,
  UserCheck,
  FileCheck
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
import { format, isToday, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from "date-fns";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WelcomeWidget from "@/components/dashboard/WelcomeWidget";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";

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
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // Get user's name from metadata or email
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [jobsData, clientsData, invoicesData] = await Promise.all([
        jobsApi.getAll({ show_instances: false }),
        clientsApi.getAll(),
        invoicesApi.getAll()
      ]);

      setJobs(jobsData);
      setClients(clientsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(t('dashboard:errorLoadingData'));
      toast.error(t('common:errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Calculate dashboard statistics with trends
  const stats = React.useMemo(() => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const lastWeekStart = subDays(todayStart, 7);

    // Today's jobs
    const todaysJobs = jobs.filter(job => {
      const jobDate = new Date(job.scheduled_date);
      return jobDate >= todayStart && jobDate <= todayEnd;
    });

    // Last week's jobs for comparison
    const lastWeekJobs = jobs.filter(job => {
      const jobDate = new Date(job.scheduled_date);
      return jobDate >= lastWeekStart && jobDate < todayStart;
    });

    // Active clients
    const activeClients = clients.filter(client => client.is_active);
    const newClientsThisWeek = clients.filter(client => {
      const createdDate = new Date(client.created_at);
      return createdDate >= lastWeekStart;
    });

    // Pending invoices (unpaid)
    const pendingInvoices = invoices.filter(invoice => invoice.status === 'sent' || invoice.status === 'overdue');
    const pendingAmount = pendingInvoices.reduce((sum, invoice) => sum + invoice.balance_due, 0);

    // Total revenue this month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = invoices
      .filter(invoice => invoice.status === 'paid' && new Date(invoice.paid_at || '') >= monthStart)
      .reduce((sum, invoice) => sum + invoice.total_amount, 0);

    // Total hours today
    const totalHoursToday = todaysJobs.reduce((sum, job) => {
      return sum + ((job.estimated_duration || 120) / 60); // Convert minutes to hours, default 2 hours
    }, 0);

    return [
      { 
        label: t('dashboard:jobsToday'), 
        value: todaysJobs.length.toString(), 
        icon: Calendar, 
        color: "from-pulse-500 to-blue-600",
        trend: todaysJobs.length > (lastWeekJobs.length / 7) ? 'up' : 'down',
        trendValue: `${((todaysJobs.length - (lastWeekJobs.length / 7)) * 100).toFixed(0)}%`,
        subLabel: `${lastWeekJobs.length} last week`
      },
      { 
        label: t('dashboard:activeClients'), 
        value: activeClients.length.toString(), 
        icon: Users, 
        color: "from-blue-600 to-blue-700",
        trend: newClientsThisWeek.length > 0 ? 'up' : 'neutral',
        trendValue: `+${newClientsThisWeek.length}`,
        subLabel: `${newClientsThisWeek.length} new this week`
      },
      { 
        label: t('dashboard:monthlyRevenue'), 
        value: formatCurrency(monthlyRevenue), 
        icon: DollarSign, 
        color: "from-blue-700 to-blue-800",
        trend: monthlyRevenue > 0 ? 'up' : 'neutral',
        trendValue: '+12%',
        subLabel: 'vs last month'
      },
      { 
        label: t('dashboard:pendingPayments'), 
        value: formatCurrency(pendingAmount), 
        icon: CreditCard, 
        color: "from-gray-600 to-gray-700",
        trend: pendingInvoices.length > 0 ? 'down' : 'neutral',
        trendValue: `${pendingInvoices.length} invoices`,
        subLabel: 'awaiting payment'
      },
    ];
  }, [jobs, clients, invoices, formatCurrency, t]);

  // Revenue chart data
  const revenueData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayRevenue = invoices
        .filter(invoice => {
          const invoiceDate = new Date(invoice.created_at);
          return format(invoiceDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && 
                 invoice.status === 'paid';
        })
        .reduce((sum, invoice) => sum + invoice.total_amount, 0);
      
      return {
        date: format(date, 'MMM dd'),
        revenue: dayRevenue,
        jobs: jobs.filter(job => format(new Date(job.scheduled_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')).length
      };
    });
    return last7Days;
  }, [jobs, invoices]);

  // Today's upcoming jobs
  const upcomingJobs = React.useMemo(() => {
    const today = new Date();
    return jobs
      .filter(job => isToday(new Date(job.scheduled_date)))
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
      .slice(0, 5); // Show only next 5 jobs
  }, [jobs]);

  // Recent activities
  const recentActivities = React.useMemo(() => {
    const activities = [];
    
    // Recent jobs
    jobs.slice(0, 3).forEach(job => {
      activities.push({
        id: `job-${job.id}`,
        type: 'job',
        icon: Briefcase,
        title: `New job scheduled`,
        description: `${job.service_type?.replace('_', ' ')} - ${job.title || 'Cleaning Service'}`,
        time: new Date(job.created_at),
        color: 'text-blue-600 bg-blue-100'
      });
    });

    // Recent clients
    clients.slice(0, 2).forEach(client => {
      activities.push({
        id: `client-${client.id}`,
        type: 'client',
        icon: UserCheck,
        title: `New client added`,
        description: client.name,
        time: new Date(client.created_at),
        color: 'text-blue-600 bg-blue-100'
      });
    });

    // Recent invoices
    invoices.slice(0, 2).forEach(invoice => {
      activities.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        icon: FileCheck,
        title: invoice.status === 'paid' ? 'Invoice paid' : 'Invoice sent',
        description: `${invoice.invoice_number} - ${formatCurrency(invoice.total_amount)}`,
        time: new Date(invoice.created_at),
        color: invoice.status === 'paid' ? 'text-blue-700 bg-blue-100' : 'text-gray-600 bg-gray-100'
      });
    });

    // Sort by time
    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
  }, [jobs, clients, invoices, formatCurrency]);

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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
              <Activity className="w-4 h-4" />
              {t('dashboard:tryAgain')}
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1">
        {/* Welcome Widget at top */}
        <WelcomeWidget />
        
        <div className="p-2 sm:p-3 md:p-6 max-w-7xl mx-auto">
          {/* Stats Grid - Enhanced with trends - Improved for mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const TrendIcon = stat.trend === 'up' ? ArrowUpRight : stat.trend === 'down' ? ArrowDownRight : Activity;
              return (
                <div key={index} className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm p-2 sm:p-3 md:p-5 hover:shadow-md transition-all hover:scale-[1.02] group">
                  <div className="flex items-center justify-between mb-1 sm:mb-2 md:mb-3">
                    <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className={`flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-xs md:text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      <TrendIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                      <span>{stat.trendValue}</span>
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-base md:text-2xl font-bold text-gray-900 truncate">{stat.value}</h3>
                  <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm truncate">{stat.label}</p>
                  <p className="text-gray-500 text-[8px] sm:text-[10px] md:text-xs mt-0.5 truncate">{stat.subLabel}</p>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Left Column - Takes 2/3 on large screens */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-gray-900">Revenue Overview</h2>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setSelectedTimeRange('week')}
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs md:text-sm rounded-lg transition-all ${
                        selectedTimeRange === 'week' 
                          ? 'bg-pulse-100 text-pulse-700 scale-105' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setSelectedTimeRange('month')}
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs md:text-sm rounded-lg transition-all ${
                        selectedTimeRange === 'month' 
                          ? 'bg-pulse-100 text-pulse-700 scale-105' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>
                <div className="h-40 sm:h-52 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={8} tick={{fontSize: 8}} />
                      <YAxis stroke="#9CA3AF" fontSize={8} tick={{fontSize: 8}} width={30} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '10px' }}
                        formatter={(value: any) => formatCurrency(value)}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-gray-900">
                    {t('dashboard:todaysSchedule')}
                  </h2>
                  <Link 
                    to="/calendar"
                    className="text-[10px] sm:text-xs md:text-sm text-pulse-600 hover:text-pulse-700 font-medium flex items-center gap-0.5 sm:gap-1 hover:gap-1.5 transition-all"
                  >
                    View all <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                  </Link>
                </div>
                
                {upcomingJobs.length > 0 ? (
                  <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                    {upcomingJobs.map((job) => (
                      <Link
                        key={job.id}
                        to={`/jobs/${job.id}`}
                        className="flex items-center justify-between p-2 sm:p-3 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-pulse-50 hover:to-pulse-100 transition-all hover:shadow-sm group"
                      >
                        <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                          <div className="p-1 sm:p-1.5 md:p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-pulse-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 group-hover:text-pulse-600 transition-colors truncate">
                              {job.title || t('dashboard:cleaningService')}
                            </h4>
                            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 capitalize truncate">
                              {job.service_type?.replace('_', ' ') || t('dashboard:cleaningService')}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400 flex-shrink-0" />
                              <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 truncate">
                                {job.address || t('dashboard:noAddress')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right pl-2 flex-shrink-0">
                          <span className="text-[10px] sm:text-xs md:text-sm font-medium text-pulse-600 whitespace-nowrap">
                            {job.scheduled_time || 'No time'}
                          </span>
                          <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 mt-0.5 whitespace-nowrap">
                            {formatCurrency(job.estimated_price || 0)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 sm:py-6 md:py-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-300" />
                    </div>
                    <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-1.5 sm:mb-2 md:mb-3">{t('dashboard:noJobsToday')}</p>
                    <Link 
                      to="/jobs/new"
                      className="inline-flex items-center gap-1 text-pulse-600 hover:text-pulse-700 font-medium text-[10px] sm:text-xs md:text-sm hover:gap-1.5 transition-all"
                    >
                      {t('dashboard:scheduleJob')} <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Takes 1/3 on large screens */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Performance Metrics */}
              <div className="mb-3 sm:mb-4 md:mb-6">
                <PerformanceMetrics />
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow">
                <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-gray-900 mb-2 sm:mb-3 md:mb-6">
                  {t('dashboard:quickActions')}
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Link 
                    to="/jobs/new"
                    className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-pulse-500 to-pulse-600 text-white rounded-lg sm:rounded-xl hover:from-pulse-600 hover:to-pulse-700 transition-all transform hover:scale-[1.05] active:scale-[0.98] flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 shadow-md hover:shadow-lg"
                  >
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-center">{t('dashboard:newJob')}</span>
                  </Link>
                  <Link 
                    to="/clients/new"
                    className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.05] active:scale-[0.98] flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 shadow-md hover:shadow-lg"
                  >
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-center">{t('dashboard:addClient')}</span>
                  </Link>
                  <Link 
                    to="/invoices/new"
                    className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-blue-700 to-blue-800 text-white rounded-lg sm:rounded-xl hover:from-blue-800 hover:to-blue-900 transition-all transform hover:scale-[1.05] active:scale-[0.98] flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 shadow-md hover:shadow-lg"
                  >
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-center">{t('dashboard:createInvoice')}</span>
                  </Link>
                  <Link 
                    to="/reports"
                    className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-lg sm:rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-[1.05] active:scale-[0.98] flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 shadow-md hover:shadow-lg"
                  >
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-center">{t('dashboard:viewReports')}</span>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-gray-900">Recent Activity</h2>
                </div>
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  {recentActivities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-2 sm:gap-3 md:gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`p-1 sm:p-1.5 md:p-2 rounded-lg ${activity.color}`}>
                          <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900">{activity.title}</p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 truncate">{activity.description}</p>
                          <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 mt-0.5 sm:mt-1">{formatRelativeTime(activity.time)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard; 