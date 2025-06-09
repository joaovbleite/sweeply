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
  FileCheck,
  HelpCircle
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
import BusinessHealth from "@/components/dashboard/BusinessHealth";
import TodayScheduleSlider from "@/components/dashboard/TodayScheduleSlider";
import GettingStartedTodo from "@/components/dashboard/GettingStartedTodo";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard', 'common', 'navigation']);
  const { formatCurrency, formatDate } = useLocale();
  const isMobile = useIsMobile();
  
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
      <div className={`${isMobile ? 'px-3 sm:px-4' : 'px-6 lg:px-8'} py-0 sm:py-4 md:py-6`}>
        {/* Welcome Widget */}
        <div className={isMobile ? '' : 'mt-6'}>
          <WelcomeWidget />
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mt-3 sm:mt-5 md:mt-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`bg-white p-3 sm:p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.02] hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">{stat.label}</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stat.value}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{stat.subLabel}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`rounded-full p-1.5 sm:p-2 md:p-2.5 ${stat.icon === Calendar ? "bg-blue-100" : stat.icon === Users ? "bg-green-100" : stat.icon === DollarSign ? "bg-indigo-100" : "bg-gray-100"}`}>
                    <stat.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${stat.icon === Calendar ? "text-blue-600" : stat.icon === Users ? "text-green-600" : stat.icon === DollarSign ? "text-indigo-600" : "text-gray-600"}`} />
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center mt-1 sm:mt-1.5 md:mt-2 ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : 
                       stat.trend === 'down' ? <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : null}
                      <span className="text-[9px] sm:text-[10px] md:text-xs font-medium ml-0.5">{stat.trendValue}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Revenue Chart */}
        <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 mt-3 sm:mt-5 md:mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Revenue Overview</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Track your daily earnings</p>
            </div>
            <div className="flex items-center mt-2 sm:mt-0 self-end sm:self-auto gap-1 sm:gap-2">
              <button 
                onClick={() => setSelectedTimeRange('week')} 
                className={`px-3 py-1 rounded-full text-xs sm:text-sm ${selectedTimeRange === 'week' ? 'bg-blue-100 text-blue-600 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setSelectedTimeRange('month')} 
                className={`px-3 py-1 rounded-full text-xs sm:text-sm ${selectedTimeRange === 'month' ? 'bg-blue-100 text-blue-600 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Month
              </button>
            </div>
          </div>
          
          <div className="h-44 sm:h-52 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#f0f0f0' }}
                />
                <YAxis
                  tickFormatter={(value) => `${value}`}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickCount={4}
                />
                <Tooltip
                  formatter={(value) => [`${formatCurrency(value as number)}`, 'Revenue']}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4F46E5" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                  dot={{ stroke: '#4F46E5', strokeWidth: 2, r: 4, fill: 'white' }}
                  activeDot={{ stroke: '#4F46E5', strokeWidth: 2, r: 6, fill: 'white' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Mobile Dashboard Sections */}
        {isMobile ? (
          <div className="pb-16">
            {/* Today's Schedule */}
            <TodayScheduleSlider hasJobs={upcomingJobs.length > 0} />
            
            {/* Getting Started Todo Section */}
            <GettingStartedTodo />
            
            {/* Business Health section */}
            <BusinessHealth />
            
            {/* Need Help? button - positioned higher above the bottom toolbar */}
            <div className="px-1 mt-6 mb-16">
              <Link 
                to="/support" 
                className="flex justify-center items-center py-3.5 bg-white rounded-lg shadow-md border border-gray-100 text-blue-600 font-medium"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                Need Help?
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Today's Schedule */}
            <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 mt-6 sm:mt-8 md:mt-10">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 pt-1.5">Today's Schedule</h3>
                <Link to="/calendar" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
              
              {upcomingJobs.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {upcomingJobs.map((job) => (
                    <Link
                      to={`/jobs/${job.id}`}
                      key={job.id}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="bg-blue-100 text-blue-600 p-1.5 sm:p-2 rounded-lg">
                        <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-gray-900 truncate">
                          {job.title || 'Cleaning Service'}
                        </p>
                        <div className="flex items-center mt-0.5">
                          <Clock className="w-3 h-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500">
                            {new Date(job.scheduled_date).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          {job.address && (
                            <>
                              <span className="mx-1 text-gray-300">•</span>
                              <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                              <p className="text-xs text-gray-500 truncate">
                                {job.address}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded-lg px-2 py-1">
                        <p className="text-xs text-gray-600">
                          {formatCurrency(job.estimated_price || 0)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                  <div className="bg-gray-100 p-3 sm:p-4 rounded-full mb-2 sm:mb-3">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base mb-1">No jobs scheduled for today</p>
                  <Link to="/jobs/new" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">
                    Schedule a job
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard; 