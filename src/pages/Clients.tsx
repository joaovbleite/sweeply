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
  Receipt
} from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api/clients";
import { Client } from "@/types/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";

const Clients = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['clients', 'common']);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'residential' | 'commercial'>('all');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'updated_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<'clients' | 'jobs' | 'quotes' | 'invoices'>('clients');

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, [showInactive]);

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
            className="bg-[#307842] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('clients:addClient')}</span>
          </Link>
        );
      case 'jobs':
        return (
          <Link
            to="/jobs/new"
            className="bg-[#307842] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Job</span>
          </Link>
        );
      case 'quotes':
        return (
          <Link
            to="/quotes/new"
            className="bg-[#307842] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Quote</span>
          </Link>
        );
      case 'invoices':
        return (
          <Link
            to="/invoices/new"
            className="bg-[#307842] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
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
      />

      {/* Main content - with top padding to account for fixed header */}
      <div className="pt-28 px-4 pb-20">
        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto mb-6 border-b border-gray-200 no-scrollbar">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'clients' 
                ? 'text-[#307842] border-b-2 border-[#307842]' 
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
                ? 'text-[#307842] border-b-2 border-[#307842]' 
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
                ? 'text-[#307842] border-b-2 border-[#307842]' 
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
                ? 'text-[#307842] border-b-2 border-[#307842]' 
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
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#307842] focus:border-transparent"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#307842] text-sm"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#307842] text-sm whitespace-nowrap"
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
                className="rounded border-gray-300 text-[#307842] focus:ring-[#307842]"
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
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#307842]"></div>
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#307842] text-white rounded-lg hover:bg-[#276938] transition-colors text-sm"
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
                            <CheckSquare className="w-4 h-4 text-[#307842]" />
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
                                <a href={`mailto:${client.email}`} className="truncate hover:text-[#307842]">
                                  {client.email}
                                </a>
                              </div>
                            )}
                            {client.phone && (
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <a href={`tel:${client.phone}`} className="hover:text-[#307842]">
                                  {client.phone}
                                </a>
                              </div>
                            )}
                          </div>
                          
                          {/* Client Summary Row */}
                          <div className="mt-3 pt-2 border-t border-gray-100 grid grid-cols-3 gap-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <LayoutList className="w-4 h-4 text-[#307842]" />
                              <span className="text-xs">3 Jobs</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <FileText className="w-4 h-4 text-[#307842]" />
                              <span className="text-xs">2 Quotes</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Receipt className="w-4 h-4 text-[#307842]" />
                              <span className="text-xs">1 Invoice</span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <div className="flex gap-4">
                              <Link
                                to={`/clients/${client.id}/edit`}
                                className="text-[#307842]"
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
                              className="flex items-center text-sm text-[#307842]"
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
          // Jobs List (Placeholder)
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <LayoutList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Job Management</h3>
            <p className="text-sm text-gray-600 mb-4">
              View and manage all client jobs in one place
            </p>
            <Link
              to="/jobs/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#307842] text-white rounded-lg hover:bg-[#276938] transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Create New Job
            </Link>
          </div>
        ) : activeTab === 'quotes' ? (
          // Quotes List (Placeholder)
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Quote Management</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create and manage quotes for your clients
            </p>
            <Link
              to="/quotes/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#307842] text-white rounded-lg hover:bg-[#276938] transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Create New Quote
            </Link>
          </div>
        ) : (
          // Invoices List (Placeholder)
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Management</h3>
            <p className="text-sm text-gray-600 mb-4">
              Generate and track invoices for your clients
            </p>
            <Link
              to="/invoices/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#307842] text-white rounded-lg hover:bg-[#276938] transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Create New Invoice
            </Link>
          </div>
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