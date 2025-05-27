import React from 'react';
import { 
  Filter, 
  X, 
  Users, 
  DollarSign, 
  Clock, 
  MapPin,
  Tag,
  Calendar,
  AlertCircle,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceType } from '@/types/job';

interface FilterOptions {
  serviceTypes: ServiceType[];
  status: string[];
  clients: string[];
  dateRange: { start: string; end: string };
  priceRange: { min: number; max: number };
  search: string;
  employees: string[];
  priority: 'all' | 'high' | 'medium' | 'low';
  duration: 'all' | 'short' | 'medium' | 'long';
  hasConflicts: boolean;
  isRecurring: boolean;
}

interface CalendarFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  clients: Array<{ id: string; name: string }>;
  employees?: Array<{ id: string; name: string }>;
  darkMode?: boolean;
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  clients,
  employees = [],
  darkMode = false
}) => {
  const serviceTypes: Array<{ value: ServiceType; label: string; color: string }> = [
    { value: 'regular', label: 'Regular Cleaning', color: 'bg-blue-500' },
    { value: 'deep_clean', label: 'Deep Clean', color: 'bg-purple-500' },
    { value: 'move_in', label: 'Move-in', color: 'bg-green-500' },
    { value: 'move_out', label: 'Move-out', color: 'bg-orange-500' },
    { value: 'post_construction', label: 'Post-Construction', color: 'bg-red-500' },
    { value: 'one_time', label: 'One-time', color: 'bg-gray-500' }
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: 'text-blue-600 bg-blue-100' },
    { value: 'in_progress', label: 'In Progress', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'completed', label: 'Completed', color: 'text-green-600 bg-green-100' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-600 bg-red-100' }
  ];

  const handleServiceTypeToggle = (serviceType: ServiceType) => {
    const newServiceTypes = filters.serviceTypes.includes(serviceType)
      ? filters.serviceTypes.filter(t => t !== serviceType)
      : [...filters.serviceTypes, serviceType];
    onFiltersChange({ ...filters, serviceTypes: newServiceTypes });
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleClientToggle = (clientId: string) => {
    const newClients = filters.clients.includes(clientId)
      ? filters.clients.filter(c => c !== clientId)
      : [...filters.clients, clientId];
    onFiltersChange({ ...filters, clients: newClients });
  };

  const handleReset = () => {
    onFiltersChange({
      serviceTypes: [],
      status: [],
      clients: [],
      dateRange: { start: '', end: '' },
      priceRange: { min: 0, max: 1000 },
      search: '',
      employees: [],
      priority: 'all',
      duration: 'all',
      hasConflicts: false,
      isRecurring: false
    });
  };

  const activeFiltersCount = 
    filters.serviceTypes.length + 
    filters.status.length + 
    filters.clients.length + 
    (filters.dateRange.start ? 1 : 0) +
    (filters.priceRange.min > 0 || filters.priceRange.max < 1000 ? 1 : 0) +
    (filters.search ? 1 : 0) +
    (filters.priority !== 'all' ? 1 : 0) +
    (filters.duration !== 'all' ? 1 : 0) +
    (filters.hasConflicts ? 1 : 0) +
    (filters.isRecurring ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white'
            } rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-pulse-500" />
                <h2 className="text-xl font-semibold">Advanced Filters</h2>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-1 bg-pulse-100 text-pulse-600 text-xs rounded-full">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Reset All
                </button>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Search className="w-4 h-4 inline mr-2" />
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                  placeholder="Search by job title, notes, address..."
                  className={`w-full px-4 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300'
                  } border focus:outline-none focus:ring-2 focus:ring-pulse-500`}
                />
              </div>

              {/* Service Types */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Service Types
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {serviceTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleServiceTypeToggle(type.value)}
                      className={`p-3 rounded-lg transition-all flex items-center gap-2 ${
                        filters.serviceTypes.includes(type.value)
                          ? `${type.color} text-white shadow-md`
                          : darkMode
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${type.color}`} />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Job Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusToggle(status.value)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        filters.status.includes(status.value)
                          ? status.color + ' font-medium'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">From</label>
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, start: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-300'
                      } border`}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">To</label>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, end: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-300'
                      } border`}
                    />
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Min ($)</label>
                    <input
                      type="number"
                      value={filters.priceRange.min}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                      })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-300'
                      } border`}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Max ($)</label>
                    <input
                      type="number"
                      value={filters.priceRange.max}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                      })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-300'
                      } border`}
                    />
                  </div>
                </div>
              </div>

              {/* Clients */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  <Users className="w-4 h-4 inline mr-2" />
                  Clients
                </label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2 ${
                  darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                }">
                  {clients.map((client) => (
                    <label key={client.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.clients.includes(client.id)}
                        onChange={() => handleClientToggle(client.id)}
                        className="rounded text-pulse-500"
                      />
                      <span className="text-sm">{client.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      priority: e.target.value as any
                    })}
                    className={`w-full px-3 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-50 border-gray-300'
                    } border`}
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <select
                    value={filters.duration}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      duration: e.target.value as any
                    })}
                    className={`w-full px-3 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-50 border-gray-300'
                    } border`}
                  >
                    <option value="all">All Durations</option>
                    <option value="short">Short (&lt; 2 hours)</option>
                    <option value="medium">Medium (2-4 hours)</option>
                    <option value="long">Long (&gt; 4 hours)</option>
                  </select>
                </div>
              </div>

              {/* Special Filters */}
              <div>
                <label className="block text-sm font-medium mb-3">Special Filters</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasConflicts}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        hasConflicts: e.target.checked
                      })}
                      className="rounded text-pulse-500"
                    />
                    <span className="text-sm">Show only jobs with scheduling conflicts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.isRecurring}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        isRecurring: e.target.checked
                      })}
                      className="rounded text-pulse-500"
                    />
                    <span className="text-sm">Show only recurring jobs</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between p-6 border-t ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="text-sm text-gray-500">
                {activeFiltersCount > 0 
                  ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied`
                  : 'No filters applied'
                }
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CalendarFilters; 