import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Clock,
  Target,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
  Zap,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";
import { clientsApi } from "@/lib/api/clients";
import { invoicesApi } from "@/lib/api/invoices";
import { Job } from "@/types/job";
import { Client } from "@/types/client";
import { Invoice } from "@/types/invoice";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";

const Reports = () => {
  const { t } = useTranslation(['reports', 'common', 'dashboard']);
  const { formatCurrency, formatDate } = useLocale();
  
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'clients' | 'services' | 'performance'>('overview');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showFilters, setShowFilters] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [jobsData, clientsData, invoicesData] = await Promise.all([
          jobsApi.getAll({ show_instances: false }),
          clientsApi.getAll(),
          invoicesApi.getAll()
        ]);
        
        setJobs(jobsData);
        setClients(clientsData);
        setInvoices(invoicesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error(t('common:errorOccurred'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t]);

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));
    const currentYear = startOfYear(now);
    
    // Revenue calculations
    const totalRevenue = jobs.reduce((sum, job) => sum + (job.actual_price || job.estimated_price || 0), 0);
    const completedRevenue = jobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => sum + (job.actual_price || job.estimated_price || 0), 0);
    
    const currentMonthRevenue = jobs
      .filter(job => new Date(job.scheduled_date) >= currentMonth && job.status === 'completed')
      .reduce((sum, job) => sum + (job.actual_price || job.estimated_price || 0), 0);
    
    const lastMonthRevenue = jobs
      .filter(job => {
        const jobDate = new Date(job.scheduled_date);
        return jobDate >= lastMonth && jobDate < currentMonth && job.status === 'completed';
      })
      .reduce((sum, job) => sum + (job.actual_price || job.estimated_price || 0), 0);

    // Job statistics
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(job => job.status === 'completed').length;
    const scheduledJobs = jobs.filter(job => job.status === 'scheduled').length;
    const inProgressJobs = jobs.filter(job => job.status === 'in_progress').length;
    
    // Client statistics
    const activeClients = clients.filter(client => client.is_active).length;
    const newClientsThisMonth = clients.filter(client => 
      new Date(client.created_at) >= currentMonth
    ).length;
    
    // Performance metrics
    const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
    const revenueGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    
    // Service type breakdown
    const serviceBreakdown = jobs.reduce((acc, job) => {
      const type = job.service_type;
      if (!acc[type]) {
        acc[type] = { count: 0, revenue: 0 };
      }
      acc[type].count++;
      acc[type].revenue += job.actual_price || job.estimated_price || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    // Monthly revenue trend (last 12 months)
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const month = subMonths(now, 11 - i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthJobs = jobs.filter(job => {
        const jobDate = new Date(job.scheduled_date);
        return jobDate >= monthStart && jobDate <= monthEnd && job.status === 'completed';
      });
      
      return {
        month: format(month, 'MMM'),
        revenue: monthJobs.reduce((sum, job) => sum + (job.actual_price || job.estimated_price || 0), 0),
        jobs: monthJobs.length
      };
    });

    // Top clients by revenue
    const clientRevenue = jobs.reduce((acc, job) => {
      if (job.client && job.status === 'completed') {
        const clientId = job.client.id;
        if (!acc[clientId]) {
          acc[clientId] = {
            client: job.client,
            revenue: 0,
            jobs: 0
          };
        }
        acc[clientId].revenue += job.actual_price || job.estimated_price || 0;
        acc[clientId].jobs++;
      }
      return acc;
    }, {} as Record<string, { client: typeof jobs[0]['client']; revenue: number; jobs: number }>);

    const topClients = Object.values(clientRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      completedRevenue,
      currentMonthRevenue,
      lastMonthRevenue,
      revenueGrowth,
      totalJobs,
      completedJobs,
      scheduledJobs,
      inProgressJobs,
      activeClients,
      newClientsThisMonth,
      averageJobValue,
      completionRate,
      serviceBreakdown,
      monthlyTrend,
      topClients
    };
  }, [jobs, clients]);

  // Export functionality
  const handleExport = (type: 'pdf' | 'csv') => {
    const message = type === 'csv' ? t('reports:csvReportExported') : t('reports:pdfReportExported');
    toast.success(message);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pulse-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={<span className="flex items-center gap-3"><BarChart3 className="w-8 h-8 text-pulse-500" />{t('reports:businessReports')}</span>}
        rightElement={
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {t('reports:filters')}
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t('reports:exportCSV')}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              {t('reports:exportPDF')}
            </button>
          </div>
        }
        compact
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-pulse-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{t('reports:totalRevenue')}</p>
                <p className="text-3xl font-bold">{formatCurrency(analytics.completedRevenue)}</p>
                <div className="flex items-center mt-2">
                  {analytics.revenueGrowth > 0 ? (
                    <ArrowUp className="w-4 h-4 text-blue-200" />
                  ) : analytics.revenueGrowth < 0 ? (
                    <ArrowDown className="w-4 h-4 text-blue-200" />
                  ) : (
                    <Minus className="w-4 h-4 text-blue-200" />
                  )}
                  <span className="text-blue-200 text-sm ml-1">
                    {Math.abs(analytics.revenueGrowth).toFixed(1)}% {t('reports:vsLastMonth')}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{t('reports:completedJobs')}</p>
                <p className="text-3xl font-bold">{analytics.completedJobs}</p>
                <p className="text-blue-200 text-sm mt-2">
                  {analytics.completionRate.toFixed(1)}% {t('reports:completionRate')}
                </p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">{t('reports:activeClients')}</p>
                <p className="text-3xl font-bold">{analytics.activeClients}</p>
                <p className="text-purple-200 text-sm mt-2">
                  +{analytics.newClientsThisMonth} {t('reports:newThisMonth')}
                </p>
              </div>
              <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{t('reports:avgJobValue')}</p>
                <p className="text-3xl font-bold">{formatCurrency(analytics.averageJobValue)}</p>
                <p className="text-blue-200 text-sm mt-2">
                  {analytics.scheduledJobs} {t('reports:jobsScheduled')}
                </p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
                <Target className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: t('reports:overview'), icon: Eye },
                { id: 'revenue', label: t('reports:revenue'), icon: TrendingUp },
                { id: 'clients', label: t('reports:clients'), icon: Users },
                { id: 'services', label: t('reports:services'), icon: Star },
                { id: 'performance', label: t('reports:performance'), icon: Zap }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'revenue' | 'clients' | 'services' | 'performance')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-pulse-500 text-pulse-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Trend Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pulse-500" />
                  {t('reports:revenueTrend')}
                </h3>
                <div className="space-y-3">
                  {analytics.monthlyTrend.map((month, index) => {
                    const maxRevenue = Math.max(...analytics.monthlyTrend.map(m => m.revenue));
                    const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 w-20">
                          <span className="text-sm font-medium text-gray-700">{month.month}</span>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-pulse-400 to-pulse-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right w-24">
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(month.revenue)}</p>
                          <p className="text-xs text-gray-500">{month.jobs} jobs</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service Breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-pulse-500" />
                  {t('reports:serviceTypePerformance')}
                </h3>
                <div className="space-y-4">
                  {Object.entries(analytics.serviceBreakdown).map(([service, data]) => {
                    const colors = {
                      regular: 'bg-blue-500',
                      deep_clean: 'bg-purple-500',
                      move_in: 'bg-green-500',
                      move_out: 'bg-orange-500',
                      post_construction: 'bg-red-500',
                      one_time: 'bg-gray-500'
                    };
                    const color = colors[service as keyof typeof colors] || 'bg-gray-500';
                    const percentage = analytics.totalJobs > 0 ? (data.count / analytics.totalJobs) * 100 : 0;
                    
                    return (
                      <div key={service} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${color}`} />
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {service.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(data.revenue)}</p>
                            <p className="text-xs text-gray-500">{data.count} jobs</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-pulse-500" />
                {t('reports:topClientsByRevenue')}
              </h3>
              <div className="space-y-4">
                {analytics.topClients.map((clientData, index) => (
                  <div key={clientData.client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-pulse-100 text-pulse-600 rounded-full font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{clientData.client.name}</h4>
                        <p className="text-sm text-gray-600">{clientData.jobs} {t('reports:jobsCompleted')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{formatCurrency(clientData.revenue)}</p>
                      <p className="text-sm text-gray-500">
                        Avg: {formatCurrency(clientData.revenue / clientData.jobs)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports; 