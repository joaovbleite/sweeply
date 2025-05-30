import React, { useState, useEffect, useMemo } from "react";
import { X, Save, User, Clock, DollarSign, Search, AlertTriangle, CheckCircle, Calendar, MapPin, Repeat, Info } from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";
import { clientsApi } from "@/lib/api/clients";
import { serviceTypesApi, ServiceType as ServiceTypeData } from "@/lib/api/service-types";
import { Job, CreateJobInput, ServiceType, PropertyType } from "@/types/job";
import { Client } from "@/types/client";
import { format, addHours, parseISO } from "date-fns";
import RecurringJobPattern, { RecurringPattern } from "@/components/RecurringJobPattern";

interface QuickJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedTime?: string;
  onJobCreated: () => void;
  existingJobs?: Job[]; // For conflict detection
}

const QuickJobModal: React.FC<QuickJobModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  onJobCreated,
  existingJobs = []
}) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [serviceTypeOptions, setServiceTypeOptions] = useState<ServiceTypeData[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>({
    is_recurring: false,
    frequency: 'weekly',
    endType: 'never'
  });

  const [formData, setFormData] = useState<CreateJobInput>({
    client_id: "",
    title: "",
    service_type: "regular",
    property_type: "residential",
    scheduled_date: "",
    scheduled_time: selectedTime || "",
    estimated_duration: 120,
    estimated_price: 120,
    description: "",
    special_instructions: "",
    access_instructions: "",
    address: "",
    is_recurring: false
  });

  // Load clients and service types when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
      resetForm();
    }
  }, [isOpen]);

  // Update form when date/time changes
  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
        scheduled_time: selectedTime || prev.scheduled_time
      }));
    }
  }, [selectedDate, selectedTime]);

  const loadData = async () => {
    try {
      setLoadingClients(true);
      const [clientsData, serviceTypesData] = await Promise.all([
        clientsApi.getAll(),
        serviceTypesApi.getActiveServiceTypes()
      ]);
      setClients(clientsData);
      setServiceTypeOptions(serviceTypesData);
      
      // Set default values from the first active service type if available
      if (serviceTypesData.length > 0) {
        const defaultService = serviceTypesData.find(s => s.service_order === 1) || serviceTypesData[0];
        setFormData(prev => ({
          ...prev,
          estimated_price: defaultService.default_price,
          estimated_duration: defaultService.default_duration
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Failed to load data");
    } finally {
      setLoadingClients(false);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      title: "",
      service_type: "regular",
      property_type: "residential",
      scheduled_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : "",
      scheduled_time: selectedTime || "",
      estimated_duration: 120,
      estimated_price: 120,
      description: "",
      special_instructions: "",
      access_instructions: "",
      address: "",
      is_recurring: false
    });
    setClientSearch("");
  };

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    return clients.filter(client => 
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.phone?.includes(clientSearch)
    );
  }, [clients, clientSearch]);

  // Check for scheduling conflicts
  const getConflicts = useMemo(() => {
    if (!formData.scheduled_date || !formData.scheduled_time || !formData.estimated_duration) {
      return [];
    }

    const jobDate = formData.scheduled_date;
    const jobStart = parseISO(`${jobDate}T${formData.scheduled_time}`);
    const jobEnd = addHours(jobStart, formData.estimated_duration / 60);

    return existingJobs.filter(job => {
      if (job.scheduled_date !== jobDate || !job.scheduled_time || !job.estimated_duration) {
        return false;
      }

      const existingStart = parseISO(`${job.scheduled_date}T${job.scheduled_time}`);
      const existingEnd = addHours(existingStart, job.estimated_duration / 60);

      return (jobStart < existingEnd && jobEnd > existingStart);
    });
  }, [formData.scheduled_date, formData.scheduled_time, formData.estimated_duration, existingJobs]);

  // Get suggested time slots
  const getSuggestedTimes = useMemo(() => {
    if (!selectedDate) return [];

    const suggestions = [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayJobs = existingJobs.filter(job => job.scheduled_date === dateStr);

    // Common time slots
    const commonTimes = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
    
    for (const time of commonTimes) {
      const timeStart = parseISO(`${dateStr}T${time}`);
      const timeEnd = addHours(timeStart, 2); // Assume 2 hour duration

      const hasConflict = dayJobs.some(job => {
        if (!job.scheduled_time || !job.estimated_duration) return false;
        const jobStart = parseISO(`${job.scheduled_date}T${job.scheduled_time}`);
        const jobEnd = addHours(jobStart, job.estimated_duration / 60);
        return (timeStart < jobEnd && timeEnd > jobStart);
      });

      if (!hasConflict) {
        suggestions.push(time);
      }
    }

    return suggestions.slice(0, 4); // Return top 4 suggestions
  }, [selectedDate, existingJobs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox' && name === 'is_recurring') {
      const isRecurring = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        is_recurring: isRecurring
      }));
      setRecurringPattern(prev => ({
        ...prev,
        is_recurring: isRecurring
      }));
    } else if (name === 'service_type') {
      const newServiceType = value as ServiceType;
      const selectedClient = clients.find(c => c.id === formData.client_id);
      
      // Find the corresponding service type data to get price and duration
      const serviceData = serviceTypeOptions.find(s => s.name.toLowerCase().includes(newServiceType.replace('_', ' ')));
      
      setFormData(prev => ({
        ...prev,
        service_type: newServiceType,
        estimated_price: serviceData ? serviceData.default_price : getDefaultPrice(newServiceType),
        estimated_duration: serviceData ? serviceData.default_duration : prev.estimated_duration,
        title: selectedClient ? `${getServiceTypeDisplay(newServiceType)} - ${selectedClient.name}` : prev.title
      }));
    } else if (name === 'estimated_price' || name === 'estimated_duration') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleClientSelect = (client: Client) => {
    const clientAddress = [
      client.address,
      client.city,
      client.state,
      client.zip
    ].filter(Boolean).join(', ');

    setFormData(prev => ({
      ...prev,
      client_id: client.id,
      address: clientAddress,
      title: `${getServiceTypeDisplay(prev.service_type)} - ${client.name}`
    }));
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({
      ...prev,
      scheduled_time: time
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id) {
      toast.error("Please select a client");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Job title is required");
      return;
    }
    if (!formData.scheduled_date) {
      toast.error("Scheduled date is required");
      return;
    }

    // Warn about conflicts
    if (getConflicts.length > 0) {
      const confirmed = confirm(
        `This job conflicts with ${getConflicts.length} existing job(s). Continue anyway?`
      );
      if (!confirmed) return;
    }

    setLoading(true);

    try {
      const jobData: CreateJobInput & Partial<RecurringPattern> = {
        client_id: formData.client_id,
        title: formData.title,
        service_type: formData.service_type,
        property_type: formData.property_type,
        scheduled_date: formData.scheduled_date,
        estimated_duration: formData.estimated_duration,
        estimated_price: formData.estimated_price,
        is_recurring: formData.is_recurring,
        // Optional fields
        description: formData.description?.trim() || undefined,
        scheduled_time: formData.scheduled_time || undefined,
        address: formData.address?.trim() || undefined,
        special_instructions: formData.special_instructions?.trim() || undefined,
        access_instructions: formData.access_instructions?.trim() || undefined,
      };

      // Add recurring fields if applicable
      if (formData.is_recurring && recurringPattern.is_recurring) {
        jobData.recurring_frequency = recurringPattern.frequency || recurringPattern.recurring_frequency;
        jobData.recurring_end_type = recurringPattern.endType || recurringPattern.recurring_end_type || 'never';
        jobData.recurring_end_date = recurringPattern.endDate || recurringPattern.recurring_end_date;
        jobData.recurring_occurrences = recurringPattern.occurrences || recurringPattern.recurring_occurrences;
        jobData.recurring_days_of_week = recurringPattern.daysOfWeek || recurringPattern.recurring_days_of_week;
        jobData.recurring_day_of_month = recurringPattern.dayOfMonth || recurringPattern.recurring_day_of_month;
      }

      if (formData.is_recurring) {
        await jobsApi.createRecurring(jobData as any);
      } else {
        await jobsApi.create(jobData);
      }
      
      toast.success(formData.is_recurring ? "Recurring job series created!" : "Job scheduled successfully!");
      onJobCreated();
      onClose();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error("Failed to schedule job");
    } finally {
      setLoading(false);
    }
  };

  const getServiceTypeDisplay = (serviceType: ServiceType) => {
    const types = {
      regular: 'Regular Cleaning',
      deep_clean: 'Deep Clean',
      move_in: 'Move-in Clean',
      move_out: 'Move-out Clean',
      post_construction: 'Post-Construction',
      one_time: 'One-time Clean'
    };
    return types[serviceType] || serviceType;
  };

  // Fallback default prices if service types aren't loaded from settings
  const getDefaultPrice = (serviceType: ServiceType) => {
    const prices = {
      regular: 120,
      deep_clean: 200,
      move_in: 250,
      move_out: 200,
      post_construction: 300,
      one_time: 150
    };
    return prices[serviceType] || 120;
  };

  if (!isOpen) return null;

  const selectedClient = clients.find(c => c.id === formData.client_id);

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Schedule a Job</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client *
            </label>
            {loadingClients ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                Loading clients...
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  />
                </div>
                
                {showClientDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredClients.length > 0 ? (
                      filteredClients.map(client => (
                        <div
                          key={client.id}
                          onClick={() => handleClientSelect(client)}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                        >
                          <div className="font-medium">{client.name}</div>
                          {client.email && <div className="text-sm text-gray-600">{client.email}</div>}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500">No clients found</div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {selectedClient && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Selected: {selectedClient.name}</span>
                </div>
                {selectedClient.email && (
                  <div className="text-sm text-green-700 mt-1">{selectedClient.email}</div>
                )}
              </div>
            )}
          </div>

          {/* Service Type and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
                Service Type *
              </label>
              <select
                id="service_type"
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              >
                <option value="regular">Regular Cleaning</option>
                <option value="deep_clean">Deep Clean</option>
                <option value="move_in">Move-in Clean</option>
                <option value="move_out">Move-out Clean</option>
                <option value="post_construction">Post-Construction</option>
                <option value="one_time">One-time Clean</option>
              </select>
              {serviceTypeOptions.length > 0 && (
                <div className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>Using prices from Services & Pricing settings</span>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="estimated_duration" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Duration (minutes)
              </label>
              <input
                type="number"
                id="estimated_duration"
                name="estimated_duration"
                min="30"
                step="15"
                value={formData.estimated_duration}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Scheduled Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date *
              </label>
              <input
                type="date"
                id="scheduled_date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="scheduled_time" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Time
              </label>
              <input
                type="time"
                id="scheduled_time"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Conflict Warning */}
          {getConflicts.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-medium text-red-800">Scheduling Conflict Detected</h3>
              </div>
              <p className="mt-1 text-sm text-red-700">
                This job overlaps with {getConflicts.length} existing job(s) on {format(new Date(formData.scheduled_date), 'MMM d, yyyy')}.
              </p>
            </div>
          )}
          
          {getSuggestedTimes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggested Available Times
              </label>
              <div className="flex flex-wrap gap-2">
                {getSuggestedTimes.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeSelect(time)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      formData.scheduled_time === time
                        ? 'bg-pulse-500 text-white border-pulse-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div>
            <label htmlFor="estimated_price" className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Estimated Price
            </label>
            <input
              type="number"
              id="estimated_price"
              name="estimated_price"
              min="0"
              step="0.01"
              value={formData.estimated_price}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Recurring Toggle */}
          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="is_recurring"
                name="is_recurring"
                checked={formData.is_recurring}
                onChange={handleChange}
                className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
              />
              <label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-700 font-medium">
                <Repeat className="inline w-4 h-4 mr-1" />
                Make this a recurring job
              </label>
            </div>

            {formData.is_recurring && (
              <div className="bg-blue-50 rounded-lg p-4">
                <RecurringJobPattern
                  pattern={recurringPattern}
                  onChange={setRecurringPattern}
                  startDate={formData.scheduled_date}
                />
              </div>
            )}
          </div>

          {/* Job Title and Description */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                placeholder="e.g. Regular Cleaning - Smith Residence"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                placeholder="Details about the job..."
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              placeholder="Full address..."
            />
          </div>

          {/* Special Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="special_instructions" className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                id="special_instructions"
                name="special_instructions"
                value={formData.special_instructions}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                placeholder="Any special requests..."
              />
            </div>
            <div>
              <label htmlFor="access_instructions" className="block text-sm font-medium text-gray-700 mb-2">
                Access Instructions
              </label>
              <textarea
                id="access_instructions"
                name="access_instructions"
                value={formData.access_instructions}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                placeholder="Gate codes, key location, etc..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Schedule Job</span>
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default QuickJobModal; 
 
 
 
 