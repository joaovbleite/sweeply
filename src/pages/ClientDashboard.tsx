import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Star,
  MessageSquare,
  FileText,
  Camera,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Edit,
  Settings,
  Heart,
  Award,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api/clients";
import { jobsApi } from "@/lib/api/jobs";
import { invoicesApi } from "@/lib/api/invoices";
import { Client } from "@/types/client";
import { Job } from "@/types/job";
import { format, differenceInDays, startOfYear, endOfYear } from "date-fns";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";

const ClientDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'analytics' | 'communication' | 'preferences'>('overview');
  const [newNote, setNewNote] = useState('');

  // Load client and jobs
  useEffect(() => {
    const loadClientData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [clientsData, jobsData, invoicesData] = await Promise.all([
          clientsApi.getAll(),
          jobsApi.getAll({ show_instances: false }),
          invoicesApi.getAll()
        ]);
        
        setClient(clientsData.find(c => c.id === id) || null);
        // Filter jobs for this client
        const clientJobs = jobsData.filter(job => job.client_id === id);
        setJobs(clientJobs);
      } catch (error) {
        console.error('Error loading client data:', error);
        toast.error('Failed to load client data');
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [id]);

  // Calculate client analytics
  const analytics = React.useMemo(() => {
    if (!jobs.length) return null;

    const totalRevenue = jobs.reduce((sum, job) => sum + (job.estimated_price || 0), 0);
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const completedRevenue = completedJobs.reduce((sum, job) => sum + (job.estimated_price || 0), 0);
    const averageJobValue = jobs.length > 0 ? totalRevenue / jobs.length : 0;
    
    const thisYear = new Date().getFullYear();
    const thisYearJobs = jobs.filter(job => new Date(job.scheduled_date).getFullYear() === thisYear);
    const thisYearRevenue = thisYearJobs.reduce((sum, job) => sum + (job.estimated_price || 0), 0);
    
    const lastJobDate = jobs.length > 0 ? new Date(Math.max(...jobs.map(job => new Date(job.scheduled_date).getTime()))) : null;
    const daysSinceLastJob = lastJobDate ? differenceInDays(new Date(), lastJobDate) : null;
    
    // Service type breakdown
    const serviceBreakdown = jobs.reduce((acc, job) => {
      acc[job.service_type] = (acc[job.service_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly revenue trend
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthJobs = jobs.filter(job => {
        const jobDate = new Date(job.scheduled_date);
        return jobDate.getFullYear() === thisYear && jobDate.getMonth() + 1 === month;
      });
      return {
        month: format(new Date(thisYear, i, 1), 'MMM'),
        revenue: monthJobs.reduce((sum, job) => sum + (job.estimated_price || 0), 0),
        jobs: monthJobs.length
      };
    });

    return {
      totalJobs: jobs.length,
      completedJobs: completedJobs.length,
      totalRevenue,
      completedRevenue,
      averageJobValue,
      thisYearRevenue,
      daysSinceLastJob,
      serviceBreakdown,
      monthlyRevenue,
      completionRate: jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0
    };
  }, [jobs]);

  // Get client tier based on revenue
  const getClientTier = (revenue: number) => {
    if (revenue >= 2000) return { tier: 'VIP', color: 'text-blue-800 bg-blue-100', icon: Award };
    if (revenue >= 1000) return { tier: 'Gold', color: 'text-blue-700 bg-blue-100', icon: Star };
    if (revenue >= 500) return { tier: 'Silver', color: 'text-gray-600 bg-gray-100', icon: Target };
    return { tier: 'Bronze', color: 'text-gray-700 bg-gray-100', icon: Heart };
  };

  const getServiceTypeColor = (serviceType: string) => {
    const colors = {
      regular: 'bg-pulse-500',
      deep_clean: 'bg-blue-600',
      move_in: 'bg-blue-700',
      move_out: 'bg-blue-800',
      post_construction: 'bg-gray-700',
      one_time: 'bg-gray-500'
    };
    return colors[serviceType] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500"></div>
        </div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Client not found</h3>
          <p className="text-gray-600 mb-4">The client you're looking for doesn't exist.</p>
          <Link
            to="/clients"
            className="inline-flex items-center px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Link>
        </div>
      </AppLayout>
    );
  }

  const clientTier = analytics ? getClientTier(analytics.totalRevenue) : null;
  const TierIcon = clientTier?.icon || User;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={client.name}
          onBackClick={() => window.history.back()}
          rightElement={clientTier && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${clientTier.color}`}>
              <TierIcon className="w-4 h-4" />
              {clientTier.tier}
            </div>
          )}
        />

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${analytics.totalRevenue}</p>
                  <p className="text-xs text-green-600 mt-1">
                    ${analytics.completedRevenue} completed
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalJobs}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {analytics.completedJobs} completed
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Job Value</p>
                  <p className="text-2xl font-bold text-gray-900">${analytics.averageJobValue.toFixed(0)}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {analytics.completionRate.toFixed(1)}% completion
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Service</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.daysSinceLastJob !== null ? `${analytics.daysSinceLastJob}d` : 'N/A'}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {analytics.daysSinceLastJob !== null && analytics.daysSinceLastJob > 90 ? 'Needs attention' : 'Recent'}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'jobs', label: 'Job History', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'communication', label: 'Communication', icon: MessageSquare },
              { id: 'preferences', label: 'Preferences', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'jobs' | 'analytics' | 'communication' | 'preferences')}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-pulse-600 border-b-2 border-pulse-600 bg-pulse-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Client Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{client.email || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{client.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium">
                            {client.address ? `${client.address}, ${client.city}, ${client.state} ${client.zip}` : 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Client Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Client Type</p>
                        <p className="font-medium capitalize">{client.client_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          client.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-medium">{format(new Date(client.created_at), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {client.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                    <p className="text-gray-700">{client.notes}</p>
                  </div>
                )}

                {/* Preferences */}
                {client.preferences && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Preferences</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{client.preferences}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Job History</h3>
                  <Link
                    to={`/jobs/new?client_id=${client.id}`}
                    className="px-3 py-1 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors text-sm"
                  >
                    Schedule New Job
                  </Link>
                </div>

                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No jobs scheduled yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.map(job => (
                      <div key={job.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${getServiceTypeColor(job.service_type)}`} />
                              <h4 className="font-medium text-gray-900">{job.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                job.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                job.status === 'in_progress' ? 'bg-gray-100 text-gray-800' :
                                job.status === 'cancelled' ? 'bg-gray-200 text-gray-700' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {job.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>{format(new Date(job.scheduled_date), 'MMM d, yyyy')}</span>
                              {job.scheduled_time && <span>{job.scheduled_time}</span>}
                              {job.estimated_price && <span>${job.estimated_price}</span>}
                              {job.estimated_duration && <span>{Math.round(job.estimated_duration / 60)}h</span>}
                            </div>
                          </div>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-pulse-600 hover:text-pulse-700 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && analytics && (
              <div className="space-y-6">
                {/* Service Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Service Breakdown
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.serviceBreakdown).map(([service, count]) => (
                        <div key={service} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getServiceTypeColor(service)}`} />
                            <span className="text-sm text-gray-700 capitalize">
                              {service.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getServiceTypeColor(service)}`}
                                style={{ width: `${(count / analytics.totalJobs) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-pulse-600 mb-2">
                          {analytics.completionRate.toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">Completion Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          ${analytics.thisYearRevenue}
                        </div>
                        <p className="text-sm text-gray-600">This Year Revenue</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                          {analytics.daysSinceLastJob || 0}
                        </div>
                        <p className="text-sm text-gray-600">Days Since Last Job</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Revenue Trend */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Monthly Revenue Trend
                  </h3>
                  <div className="space-y-3">
                    {analytics.monthlyRevenue.map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 w-12">
                            {month.month}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-pulse-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min((month.revenue / Math.max(...analytics.monthlyRevenue.map(m => m.revenue))) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">{month.jobs} jobs</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${month.revenue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'communication' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Communication Center</h3>
                  <p className="text-gray-600 mb-4">Message history and communication tools coming soon</p>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Client Preferences</h3>
                  <p className="text-gray-600 mb-4">Detailed preference management coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientDashboard; 
 
 
 
 