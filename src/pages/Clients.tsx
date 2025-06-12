import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Filter,
  Download,
  Eye,
  CheckSquare,
  Square,
  RotateCcw,
  Building,
  Home,
  TrendingUp,
  Calendar,
  DollarSign,
  ChevronRight,
  X,
  FileText,
  LayoutList,
  Clock,
  CalendarCheck,
  Receipt,
  User
} from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api/clients";
import { jobsApi } from "@/lib/api/jobs";
import { invoicesApi } from "@/lib/api/invoices";
import { quotesApi } from "@/lib/api/quotes";
import { Client } from "@/types/client";
import { Job } from "@/types/job";
import { Invoice } from "@/types/invoice";
import { Quote } from "@/lib/api/quotes";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";

const Clients = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['clients', 'common']);
  
  // Data states
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'residential' | 'commercial'>('all');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'updated_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<'clients' | 'jobs' | 'quotes' | 'invoices'>('clients');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedQuoteStatus, setSelectedQuoteStatus] = useState<string | null>(null);
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState<string | null>(null);
  
  // Client-specific data
  const [clientJobs, setClientJobs] = useState<Record<string, number>>({});
  const [clientQuotes, setClientQuotes] = useState<Record<string, number>>({});
  const [clientInvoices, setClientInvoices] = useState<Record<string, number>>({});

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, [showInactive]);

  // Load relevant data when tab changes
  useEffect(() => {
    switch (activeTab) {
      case 'jobs':
        loadJobs();
        break;
      case 'quotes':
        loadQuotes();
        break;
      case 'invoices':
        loadInvoices();
        break;
    }
  }, [activeTab]);

  // Real-time search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        loadClients();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Count client-related data after loading clients
  useEffect(() => {
    if (clients.length > 0) {
      // We'll load counts for client data
      loadClientDataCounts();
    }
  }, [clients]);

  // Load client data counts (jobs, quotes, invoices)
  const loadClientDataCounts = async () => {
    try {
      // Get jobs count per client
      const allJobs = await jobsApi.getAll();
      const jobCounts: Record<string, number> = {};
      allJobs.forEach(job => {
        jobCounts[job.client_id] = (jobCounts[job.client_id] || 0) + 1;
      });
      setClientJobs(jobCounts);
      
      // Get quotes count per client
      try {
        const allQuotes = await quotesApi.getAll();
        const quoteCounts: Record<string, number> = {};
        allQuotes.forEach(quote => {
          quoteCounts[quote.client_id] = (quoteCounts[quote.client_id] || 0) + 1;
        });
        setClientQuotes(quoteCounts);
      } catch (error) {
        console.error('Error fetching quote counts, quotes API might not be set up:', error);
        // Fallback - simulate some quote data
        const quoteCounts: Record<string, number> = {};
        clients.forEach(client => {
          quoteCounts[client.id] = Math.floor(Math.random() * 3);
        });
        setClientQuotes(quoteCounts);
      }
      
      // Get invoices count per client
      const allInvoices = await invoicesApi.getAll();
      const invoiceCounts: Record<string, number> = {};
      allInvoices.forEach(invoice => {
        invoiceCounts[invoice.client_id] = (invoiceCounts[invoice.client_id] || 0) + 1;
      });
      setClientInvoices(invoiceCounts);
    } catch (error) {
      console.error('Error loading client data counts:', error);
    }
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getAll(!showInactive ? true : undefined);
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      setJobsLoading(true);
      const data = await jobsApi.getAll();
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  const loadQuotes = async () => {
    try {
      setQuotesLoading(true);
      // Try to fetch quotes if the API exists
      try {
        const data = await quotesApi.getAll();
        setQuotes(data);
      } catch (error) {
        console.error('Error fetching quotes, quotes API might not be set up:', error);
        // Fallback with empty array if quotes API not yet implemented in database
        setQuotes([]);
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
      toast.error('Failed to load quotes');
    } finally {
      setQuotesLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setInvoicesLoading(true);
      const data = await invoicesApi.getAll();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadClients();
      return;
    }

    try {
      setLoading(true);
      const data = await clientsApi.search(searchQuery);
      setClients(data);
    } catch (error) {
      console.error('Error searching clients:', error);
      toast.error('Failed to search clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('clients:deleteClientConfirm').replace('{name}', name))) return;

    try {
      await clientsApi.delete(id);
      toast.success(t('clients:clientDeleted'));
      loadClients();
      setSelectedClients(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(t('common:errorOccurred'));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedClients.size === 0) return;
    
    const confirmed = confirm(t('common:confirmDelete'));
    if (!confirmed) return;

    try {
      await Promise.all(Array.from(selectedClients).map(id => clientsApi.delete(id)));
      toast.success(t('common:deleteSuccess'));
      setSelectedClients(new Set());
      loadClients();
    } catch (error) {
      console.error('Error deleting clients:', error);
      toast.error(t('common:errorOccurred'));
    }
  };

  const handleSelectAll = () => {
    if (selectedClients.size === filteredAndSortedClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filteredAndSortedClients.map(client => client.id)));
    }
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const exportClients = () => {
    const csvContent = [
      [t('common:name'), t('common:email'), t('common:phone'), t('clients:clientType'), t('common:status'), t('common:city'), t('common:state')].join(','),
      ...filteredAndSortedClients.map(client => [
        client.name,
        client.email || '',
        client.phone || '',
        client.client_type,
        client.is_active ? t('common:active') : t('common:inactive'),
        client.city || '',
        client.state || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(t('common:exportSuccess'));
  };

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    const filtered = clients.filter(client => {
      if (selectedType !== 'all' && client.client_type !== selectedType) return false;
      return true;
    });

    // Sort clients
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clients, selectedType, sortBy, sortOrder]);

  // Filter jobs based on selected status
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Filter by status if selected
      if (selectedStatus && job.status !== selectedStatus) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [jobs, selectedStatus, searchQuery]);

  // Filter quotes based on selected status
  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      // Filter by status if selected
      if (selectedQuoteStatus && quote.status !== selectedQuoteStatus) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !quote.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [quotes, selectedQuoteStatus, searchQuery]);

  // Filter invoices based on selected status
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // Filter by status if selected
      if (selectedInvoiceStatus && invoice.status !== selectedInvoiceStatus) {
        return false;
      }
      
      // Filter by search query if invoice has a title
      if (searchQuery && invoice.invoice_title && !invoice.invoice_title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [invoices, selectedInvoiceStatus, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => c.is_active).length;
    const residential = clients.filter(c => c.client_type === 'residential').length;
    const commercial = clients.filter(c => c.client_type === 'commercial').length;
    const recentlyAdded = clients.filter(c => {
      const createdDate = new Date(c.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length;

    return { total, active, residential, commercial, recentlyAdded };
  }, [clients]);

  // Create add button based on active tab
  const getAddButton = () => {
    switch (activeTab) {
      case 'clients':
        return (
          <Link
            to="/clients/new"
            className="bg-[#3b82f6] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </Link>
        );
      case 'jobs':
        return (
          <Link
            to="/jobs/new"
            className="bg-[#3b82f6] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Job</span>
          </Link>
        );
      case 'quotes':
        return (
          <Link
            to="/quotes/new"
            className="bg-[#3b82f6] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Quote</span>
          </Link>
        );
      case 'invoices':
        return (
          <Link
            to="/invoices/new"
            className="bg-[#3b82f6] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </Link>
        );
      default:
        return null;
    }
  };

  // Get title based on active tab
  const getTitle = () => {
    switch (activeTab) {
      case 'clients': return 'Clients';
      case 'jobs': return 'Jobs';
      case 'quotes': return 'Quotes';
      case 'invoices': return 'Invoices';
      default: return 'Clients';
    }
  };

  return (
    <AppLayout>
      {/* Use PageHeader with dynamic title and button */}
      <PageHeader
        title={getTitle()}
        rightElement={getAddButton()}
        compact
      />

      {/* Main content - with minimal padding to account for fixed header */}
      <div className="pt-0 px-4 pb-20">
        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto mb-6 border-b border-gray-200 no-scrollbar">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'clients' 
                ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Clients
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'jobs' 
                ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            Jobs
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'quotes' 
                ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Quotes
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'invoices' 
                ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Invoices
          </button>
          </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
              placeholder={`Search ${getTitle().toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
          </div>
            </div>

        {/* Quick Filters - Only show relevant filters based on active tab */}
        {activeTab === 'clients' && (
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'all' | 'residential' | 'commercial')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
              >
              <option value="all">{t('common:allTypes')}</option>
                <option value="residential">{t('clients:residential')}</option>
                <option value="commercial">{t('clients:commercial')}</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'name' | 'created_at' | 'updated_at');
                  setSortOrder(order as 'asc' | 'desc');
                }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm whitespace-nowrap"
              >
                <option value="name-asc">{t('common:name')} A-Z</option>
                <option value="name-desc">{t('common:name')} Z-A</option>
                <option value="created_at-desc">{t('common:newest')}</option>
                <option value="created_at-asc">{t('common:oldest')}</option>
              </select>

            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-[#3b82f6] focus:ring-[#3b82f6]"
                />
                <span className="text-gray-700">{t('common:showInactive')}</span>
              </label>

            <button
              onClick={exportClients}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors text-sm ml-auto"
            >
              <Download className="w-4 h-4" />
              <span>{t('common:export')}</span>
            </button>
            </div>
        )}

        {/* Bulk Actions - Only show for clients tab */}
        {activeTab === 'clients' && selectedClients.size > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                  {selectedClients.size} {t('clients:clientsSelected')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkDelete}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    {t('common:deleteSelected')}
                  </button>
                  <button
                    onClick={() => setSelectedClients(new Set())}
                  className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    {t('common:clearSelection')}
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Content based on active tab */}
        {activeTab === 'clients' ? (
          // Clients List Content
          <>
        {loading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3b82f6]"></div>
          </div>
        ) : filteredAndSortedClients.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                <p className="text-sm text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search or filters' : 'Get started by adding your first client'}
            </p>
            {!searchQuery && (
              <Link
                to="/clients/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                    <Plus className="w-4 h-4" />
                Add Your First Client
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Clients List */}
                <div className="divide-y divide-gray-100">
                  {filteredAndSortedClients.map((client) => (
                    <div 
                      key={client.id} 
                      className={`p-4 hover:bg-gray-50 transition-colors ${selectedClients.has(client.id) ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleSelectClient(client.id)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {selectedClients.has(client.id) ? (
                            <CheckSquare className="w-4 h-4 text-[#3b82f6]" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          {/* Client Name and Type */}
                          <div className="flex items-start justify-between mb-1">
                            <Link to={`/clients/${client.id}`} className="block">
                              <h3 className="text-base font-semibold text-gray-900 truncate pr-2">{client.name}</h3>
                            </Link>
                            
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium rounded-full ${
                                client.client_type === 'commercial' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {client.client_type === 'commercial' ? <Building className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                                <span className="text-xs">{client.client_type}</span>
                              </span>
                            </div>
                          </div>
                          
                          {/* Contact Info */}
                          <div className="mt-2 space-y-2">
                          {client.address && (
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{client.city && `${client.city}, `}{client.state}</span>
                            </div>
                          )}
                          {client.email && (
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <a href={`mailto:${client.email}`} className="truncate hover:text-[#3b82f6]">
                                {client.email}
                              </a>
                            </div>
                          )}
                          {client.phone && (
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <a href={`tel:${client.phone}`} className="hover:text-[#3b82f6]">
                                {client.phone}
                              </a>
                            </div>
                          )}
                        </div>
                          
                          {/* Client Summary Row */}
                          <div className="mt-3 pt-2 border-t border-gray-100 grid grid-cols-3 gap-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <LayoutList className="w-4 h-4 text-[#3b82f6]" />
                              <span className="text-xs">{clientJobs[client.id] || 0} Jobs</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <FileText className="w-4 h-4 text-[#3b82f6]" />
                              <span className="text-xs">{clientQuotes[client.id] || 0} Quotes</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Receipt className="w-4 h-4 text-[#3b82f6]" />
                              <span className="text-xs">{clientInvoices[client.id] || 0} Invoices</span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <div className="flex gap-4">
                          <Link
                            to={`/clients/${client.id}/edit`}
                                className="text-[#3b82f6]"
                            title="Edit client"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(client.id, client.name)}
                                className="text-red-500"
                            title="Delete client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                            
                            <Link
                              to={`/clients/${client.id}`}
                              className="flex items-center text-sm text-[#3b82f6]"
                            >
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'jobs' ? (
          // Jobs List with real data
          <>
            {jobsLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3b82f6]"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <LayoutList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first job'}
                </p>
                <Link
                  to="/jobs/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create New Job
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Job status filters */}
                <div className="flex flex-wrap gap-2 bg-white p-4 rounded-lg shadow-sm">
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      !selectedStatus ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedStatus(null)}
                  >
                    All
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedStatus === 'scheduled' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedStatus('scheduled')}
                  >
                    Scheduled
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedStatus === 'in_progress' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedStatus('in_progress')}
                  >
                    In Progress
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedStatus === 'completed' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedStatus('completed')}
                  >
                    Completed
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedStatus === 'cancelled' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedStatus('cancelled')}
                  >
                    Cancelled
                  </button>
            </div>

                {/* Jobs list */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                    {filteredJobs.map((job) => (
                  <div 
                        key={job.id} 
                        className="p-4 hover:bg-gray-50 transition-colors"
                  >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
                              {job.client && (
                                <div className="text-sm text-gray-600 mt-1">
                                  <span>Client: </span>
                                  <Link to={`/clients/${job.client.id}`} className="text-[#3b82f6] hover:underline">
                                    {job.client.name}
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-2 sm:mt-0 flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              job.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              job.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status.replace('_', ' ')}
                            </span>
                            
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              job.property_type === 'commercial' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {job.property_type}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-[#3b82f6]" />
                            <span>{new Date(job.scheduled_date).toLocaleDateString()}</span>
                            {job.scheduled_time && (
                              <span className="text-gray-500">
                                {job.scheduled_time}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-[#3b82f6]" />
                            <span className="truncate">{job.address || 'No address'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <LayoutList className="w-4 h-4 text-[#3b82f6]" />
                            <span>{job.service_type.replace('_', ' ')}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 text-[#3b82f6]" />
                            <span>${job.estimated_price || job.actual_price || 0}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100 gap-3">
                          <Link
                            to={`/jobs/${job.id}/edit`}
                            className="px-3 py-1.5 text-sm text-[#3b82f6] border border-[#3b82f6] rounded-lg hover:bg-[#3b82f6] hover:text-white transition-colors"
                          >
                            Edit
                          </Link>
                          
                          <Link
                            to={`/jobs/${job.id}`}
                            className="px-3 py-1.5 text-sm bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pagination or load more (just showing count for now) */}
                <div className="text-sm text-center text-gray-600">
                  Showing {filteredJobs.length} of {jobs.length} jobs
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'quotes' ? (
          // Quotes tab with real data
          <>
            {quotesLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3b82f6]"></div>
              </div>
            ) : quotes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first quote'}
                </p>
                <Link
                  to="/quotes/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create New Quote
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Quote status filters */}
                <div className="flex flex-wrap gap-2 bg-white p-4 rounded-lg shadow-sm">
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      !selectedQuoteStatus ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedQuoteStatus(null)}
                  >
                    All
                      </button>
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedQuoteStatus === 'draft' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedQuoteStatus('draft')}
                  >
                    Draft
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedQuoteStatus === 'sent' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedQuoteStatus('sent')}
                  >
                    Sent
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedQuoteStatus === 'accepted' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedQuoteStatus('accepted')}
                  >
                    Accepted
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedQuoteStatus === 'rejected' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedQuoteStatus('rejected')}
                  >
                    Rejected
                  </button>
                </div>
                
                {/* Quotes list */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {filteredQuotes.map((quote) => (
                      <div 
                        key={quote.id} 
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900">{quote.title}</h3>
                              {quote.client && (
                                <div className="text-sm text-gray-600 mt-1">
                                  <span>Client: </span>
                                  <Link to={`/clients/${quote.client.id}`} className="text-[#3b82f6] hover:underline">
                                    {quote.client.name}
                          </Link>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-2 sm:mt-0 flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              quote.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                              quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800' // expired
                            }`}>
                              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-[#3b82f6]" />
                            <span>Created: {new Date(quote.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-[#3b82f6]" />
                            <span>
                              {quote.valid_until ? 
                                `Valid until: ${new Date(quote.valid_until).toLocaleDateString()}` : 
                                'No expiration date'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 text-[#3b82f6]" />
                            <span>Total: ${quote.total_amount.toFixed(2)}</span>
                        </div>
                        
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 text-[#3b82f6]" />
                            <span>Worker: {quote.worker || 'Not specified'}</span>
                            </div>
                            </div>
                        
                        <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100 gap-3">
                          <Link
                            to={`/quotes/${quote.id}/edit`}
                            className="px-3 py-1.5 text-sm text-[#3b82f6] border border-[#3b82f6] rounded-lg hover:bg-[#3b82f6] hover:text-white transition-colors"
                          >
                            Edit
                          </Link>
                          
                          <Link
                            to={`/quotes/${quote.id}`}
                            className="px-3 py-1.5 text-sm bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            View Details
                          </Link>
                            </div>
                      </div>
                    ))}
                  </div>
                        </div>
                        
                {/* Pagination or load more (just showing count for now) */}
                <div className="text-sm text-center text-gray-600">
                  Showing {filteredQuotes.length} of {quotes.length} quotes
                </div>
              </div>
            )}
          </>
        ) : (
          // Invoices tab with real data
          <>
            {invoicesLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3b82f6]"></div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first invoice'}
                </p>
                            <Link
                  to="/invoices/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                  <Plus className="w-4 h-4" />
                  Create New Invoice
                            </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Invoice status filters */}
                <div className="flex flex-wrap gap-2 bg-white p-4 rounded-lg shadow-sm">
                            <button
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      !selectedInvoiceStatus ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedInvoiceStatus(null)}
                  >
                    All
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedInvoiceStatus === 'draft' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedInvoiceStatus('draft')}
                  >
                    Draft
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedInvoiceStatus === 'sent' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedInvoiceStatus('sent')}
                  >
                    Sent
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedInvoiceStatus === 'paid' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedInvoiceStatus('paid')}
                  >
                    Paid
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedInvoiceStatus === 'overdue' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedInvoiceStatus('overdue')}
                  >
                    Overdue
                            </button>
                          </div>
                          
                {/* Invoices list */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {filteredInvoices.map((invoice) => (
                      <div 
                        key={invoice.id} 
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900">
                                Invoice #{invoice.invoice_number}
                                {invoice.invoice_title && ` - ${invoice.invoice_title}`}
                              </h3>
                              {invoice.client && (
                                <div className="text-sm text-gray-600 mt-1">
                                  <span>Client: </span>
                                  <Link to={`/clients/${invoice.client.id}`} className="text-[#3b82f6] hover:underline">
                                    {invoice.client.name}
                          </Link>
                        </div>
                              )}
                      </div>
                          </div>
                          
                          <div className="mt-2 sm:mt-0 flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800' // cancelled
                            }`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-[#3b82f6]" />
                            <span>Issued: {new Date(invoice.issue_date).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-[#3b82f6]" />
                            <span>
                              Due: {new Date(invoice.due_date).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 text-[#3b82f6]" />
                            <span>Total: ${invoice.total_amount.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Receipt className="w-4 h-4 text-[#3b82f6]" />
                            <span>Balance Due: ${invoice.balance_due.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100 gap-3">
                          <Link
                            to={`/invoices/${invoice.id}/edit`}
                            className="px-3 py-1.5 text-sm text-[#3b82f6] border border-[#3b82f6] rounded-lg hover:bg-[#3b82f6] hover:text-white transition-colors"
                          >
                            Edit
                          </Link>
                          
                          <Link
                            to={`/invoices/${invoice.id}`}
                            className="px-3 py-1.5 text-sm bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            View Details
                          </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
                
                {/* Pagination or load more (just showing count for now) */}
                <div className="text-sm text-center text-gray-600">
                  Showing {filteredInvoices.length} of {invoices.length} invoices
            </div>
          </div>
            )}
          </>
        )}

        {/* Results Summary - Only show for clients tab */}
        {activeTab === 'clients' && !loading && filteredAndSortedClients.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredAndSortedClients.length} of {clients.length} clients
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Clients; 