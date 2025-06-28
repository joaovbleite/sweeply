import React, { useState, useEffect, Suspense, useMemo } from "react";
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
  HelpCircle,
  Globe,
  Plus
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
import DiscoverCard from "@/components/dashboard/DiscoverCard";
import { Button } from '@/components/ui/button';
import './dashboard.css';
// Import the map component with React.lazy for code splitting
const DashboardMap = React.lazy(() => import("@/components/maps/DashboardMap"));

// Error boundary component to catch map errors
class MapErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Map component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center p-4" style={{ height: '350px' }}>
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-gray-600">Map could not be loaded</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard', 'common', 'navigation']);
  const { formatCurrency, formatDate } = useLocale();
  const isMobile = useIsMobile();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Get user's name from metadata or email
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
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

  const discoverItems = [
    {
      title: "New Feature: Route Optimization",
      subtitle: "Save time and fuel with our new route planning tool.",
      imageSrc: "https://i.postimg.cc/nLrhd0xY/image.png",
      actionText: "Learn More",
      actionLink: "#",
    },
    {
      title: "Tips for Growing Your Business",
      subtitle: "Read our latest blog post on client acquisition.",
      imageSrc: "/placeholder.svg",
      actionText: "Read Now",
      actionLink: "#",
    },
    {
      title: "Refer a Friend, Get $50",
      subtitle: "Share Sweeply with other pros and get rewarded.",
      imageSrc: "/placeholder.svg",
      actionText: "Get Referral Link",
      actionLink: "#",
    },
    {
      title: "Automate Your Invoicing",
      subtitle: "Set up recurring invoices and get paid on time.",
      imageSrc: "/placeholder.svg",
      actionText: "Set Up",
      actionLink: "#",
    },
  ];

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

    return [
      { 
        label: t('dashboard:jobsToday'), 
        value: todaysJobs.length.toString(), 
        icon: Calendar, 
        color: "from-blue-500 to-blue-600",
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
      }
    ];
  }, [jobs, clients, t]);



  // Today's upcoming jobs
  const upcomingJobs = React.useMemo(() => {
    const today = new Date();
    return jobs
      .filter(job => isToday(new Date(job.scheduled_date)))
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
      .slice(0, 5); // Show only next 5 jobs
  }, [jobs]);

  const todaysJobsOnMapCount = useMemo(() => {
    return jobs.filter(job => job.address && isToday(new Date(job.scheduled_date))).length;
  }, [jobs]);

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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
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
      <div className={`${isMobile ? 'px-0 sm:px-0' : 'px-0 lg:px-0'} py-0 sm:py-0 md:py-0`}>
        {/* Welcome Widget (now just a header with date and icons) */}
        <div className={isMobile ? '' : ''}>
          <WelcomeWidget />
        </div>
        
        {/* Stats Cards */}
        <div className="dashboard-content grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 mt-3 sm:mt-5 md:mt-6 px-3 sm:px-4 md:px-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`bg-white p-3 sm:p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.02] hover:shadow-md ${loading ? 'animate-pulse' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">{stat.label}</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">
                    {loading ? '-' : stat.value}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{stat.subLabel}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`rounded-full p-1.5 sm:p-2 md:p-2.5 ${stat.icon === Calendar ? "bg-blue-100" : stat.icon === Users ? "bg-green-100" : stat.icon === DollarSign ? "bg-indigo-100" : "bg-gray-100"}`}>
                    <stat.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${stat.icon === Calendar ? "text-blue-600" : stat.icon === Users ? "text-green-600" : stat.icon === DollarSign ? "text-indigo-600" : "text-gray-600"}`} />
                  </div>
                  {stat.trend && !loading && (
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
        
        {isMobile ? (
          <>
            {/* Today's Job Map for Mobile */}
            <div className="mt-3 sm:mt-5 md:mt-6 -mx-0 sm:-mx-0 md:-mx-0">
              <div className="relative overflow-hidden" style={{ height: '350px' }}>
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
                <Suspense fallback={<div id="map-loading" className="flex items-center justify-center h-full"><p>Loading map...</p></div>}>
                  <MapErrorBoundary>
                    <DashboardMap jobs={jobs} />
                  </MapErrorBoundary>
                </Suspense>
              </div>
            </div>

            {/* Mobile Dashboard Sections */}
            <div className="pb-24 px-3 sm:px-4">
              <div className="relative -mt-16 z-10">
                <TodayScheduleSlider hasJobs={upcomingJobs.length > 0} />
              </div>
              <GettingStartedTodo />
              <BusinessHealth />
              <div className="mt-6 mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">Discover</h3>
                <div className="flex overflow-x-auto space-x-4 -mx-3 sm:-mx-4 px-3 sm:px-4 pb-4">
                  {discoverItems.map((item, index) => (
                    <div key={index} className="flex-shrink-0 w-[70vw] sm:w-[280px]">
                      <DiscoverCard 
                        imageSrc={item.imageSrc}
                        title={item.title}
                        subtitle={item.subtitle}
                        actionText={item.actionText}
                        actionLink={item.actionLink}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-1 mt-4">
                <Link 
                  to="/support" 
                  className="flex justify-center items-center py-3.5 bg-white rounded-lg shadow-md border border-gray-100 text-blue-600 font-medium"
                >
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Need Help?
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Desktop Map with Schedule Overlay */}
            <div className="relative mt-6 sm:mt-8 md:mt-10 rounded-xl overflow-hidden shadow-sm border border-gray-100 mx-6">
              {/* Map */}
              <div className="relative" style={{ height: '350px' }}>
                <Suspense fallback={<div id="map-loading" className="flex items-center justify-center h-full"><p>Loading map...</p></div>}>
                  <MapErrorBoundary>
                    <DashboardMap jobs={jobs} />
                  </MapErrorBoundary>
                </Suspense>
              </div>
              
              {/* Schedule Header Overlay */}
              <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 md:p-5 bg-gradient-to-b from-black/60 via-black/40 to-transparent pointer-events-none">
                <div className="flex justify-between items-center pointer-events-auto">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white pt-1">Today's Schedule</h3>
                  <Link to="/todays-appointments" className="text-white hover:text-gray-200 text-xs sm:text-sm font-medium flex items-center gap-1">
                    View all <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              </div>

              {/* Schedule List */}
              <div className="bg-white p-3 sm:p-4 md:p-5 pt-16">
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
            </div>
          </>
        )}
      </div>
      
      {/* Add Job Button */}
      {isMobile && (
        <div className="fixed bottom-24 right-4 z-10">
          <Link to="/add-job">
            <Button size="icon" className="h-14 w-14 rounded-full bg-[#0d3547] hover:bg-[#0a2835] shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard; 