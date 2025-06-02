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
  X
} from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api/clients";
import { Client } from "@/types/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/AppLayout";

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

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-gray-900">{t('clients:clients')}</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">{t('clients:clientList')}</p>
          </div>
          <div className="mt-3 sm:mt-0 flex gap-2 sm:gap-3">
            <button
              onClick={exportClients}
              className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{t('common:export')}</span>
            </button>
            <Link
              to="/clients/new"
              className="px-3 sm:px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center gap-2 transition-colors text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{t('clients:addClient')}</span>
              <span className="xs:hidden">New</span>
            </Link>
          </div>
        </div>

        {/* Statistics Cards - Mobile Scrollable, Desktop Grid */}
        <div className="flex overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-8 no-scrollbar">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 flex-shrink-0 w-32 sm:w-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">{t('clients:totalClients')}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 flex-shrink-0 w-32 sm:w-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">{t('common:active')}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 flex-shrink-0 w-32 sm:w-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Home className="h-5 w-5 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">{t('clients:residential')}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.residential}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 flex-shrink-0 w-32 sm:w-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-5 w-5 sm:h-8 sm:w-8 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">{t('clients:commercial')}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.commercial}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 flex-shrink-0 w-32 sm:w-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 sm:h-8 sm:w-8 text-indigo-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">{t('dashboard:thisWeek')}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.recentlyAdded}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder={t('clients:searchClients')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent text-sm"
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

            {/* Quick Filters - Scrollable on mobile */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'all' | 'residential' | 'commercial')}
                className="px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 text-xs sm:text-sm"
              >
                <option value="all">{t('common:selectOption')}</option>
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
                className="px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 text-xs sm:text-sm whitespace-nowrap"
              >
                <option value="name-asc">{t('common:name')} A-Z</option>
                <option value="name-desc">{t('common:name')} Z-A</option>
                <option value="created_at-desc">{t('common:newest')}</option>
                <option value="created_at-asc">{t('common:oldest')}</option>
                <option value="updated_at-desc">{t('common:recentlyUpdated')}</option>
              </select>

              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded border-gray-300 text-pulse-500 focus:ring-pulse-500"
                />
                <span className="text-gray-700">{t('common:showInactive')}</span>
              </label>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedClients.size > 0 && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-blue-900">
                  {selectedClients.size} {t('clients:clientsSelected')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkDelete}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    {t('common:deleteSelected')}
                  </button>
                  <button
                    onClick={() => setSelectedClients(new Set())}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    {t('common:clearSelection')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clients List */}
        {loading ? (
          <div className="flex justify-center items-center h-44 sm:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-pulse-500"></div>
          </div>
        ) : filteredAndSortedClients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-12 text-center">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No clients found</h3>
            <p className="text-sm text-gray-600 mb-3 sm:mb-4">
              {searchQuery ? 'Try adjusting your search or filters' : 'Get started by adding your first client'}
            </p>
            {!searchQuery && (
              <Link
                to="/clients/new"
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                Add Your First Client
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        {selectedClients.size === filteredAndSortedClients.length && filteredAndSortedClients.length > 0 ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                        Select
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedClients.map((client) => (
                    <tr key={client.id} className={`hover:bg-gray-50 transition-colors ${selectedClients.has(client.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleSelectClient(client.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {selectedClients.has(client.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          {client.address && (
                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {client.city && `${client.city}, `}{client.state}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {client.email && (
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <a href={`mailto:${client.email}`} className="hover:text-pulse-600">
                                {client.email}
                              </a>
                            </div>
                          )}
                          {client.phone && (
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${client.phone}`} className="hover:text-pulse-600">
                                {client.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          client.client_type === 'commercial' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {client.client_type === 'commercial' ? <Building className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                          {client.client_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          client.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/clients/${client.id}/edit`}
                            className="p-1 text-gray-400 hover:text-pulse-600 transition-colors"
                            title="Edit client"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/clients/${client.id}`}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View client dashboard"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(client.id, client.name)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Client Cards */}
            <div className="md:hidden">
              <div className="divide-y divide-gray-100">
                {filteredAndSortedClients.map((client) => (
                  <div 
                    key={client.id} 
                    className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors ${selectedClients.has(client.id) ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleSelectClient(client.id)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {selectedClients.has(client.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        {/* Client Name and Type */}
                        <div className="flex items-start justify-between mb-1">
                          <Link to={`/clients/${client.id}`} className="block">
                            <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">{client.name}</h3>
                          </Link>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium rounded-full ${
                              client.client_type === 'commercial' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {client.client_type === 'commercial' ? <Building className="w-2.5 h-2.5" /> : <Home className="w-2.5 h-2.5" />}
                              <span className="text-[10px]">{client.client_type}</span>
                            </span>
                            
                            <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                              client.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {client.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Contact Info */}
                        <div className="mt-2 space-y-1">
                          {client.address && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="truncate">{client.city && `${client.city}, `}{client.state}</span>
                            </div>
                          )}
                          {client.email && (
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <a href={`mailto:${client.email}`} className="truncate hover:text-pulse-600">
                                {client.email}
                              </a>
                            </div>
                          )}
                          {client.phone && (
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <a href={`tel:${client.phone}`} className="hover:text-pulse-600">
                                {client.phone}
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                          <div className="flex gap-3">
                            <Link
                              to={`/clients/${client.id}/edit`}
                              className="text-pulse-500"
                              title="Edit client"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(client.id, client.name)}
                              className="text-red-500"
                              title="Delete client"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <Link
                            to={`/clients/${client.id}`}
                            className="flex items-center text-xs text-gray-500 hover:text-pulse-600"
                          >
                            View Details
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!loading && filteredAndSortedClients.length > 0 && (
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center">
            Showing {filteredAndSortedClients.length} of {clients.length} clients
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Clients; 