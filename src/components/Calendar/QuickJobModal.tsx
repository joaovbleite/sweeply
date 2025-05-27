import React, { useState, useEffect, useMemo } from "react";
import { X, Save, User, Clock, DollarSign, Search, AlertTriangle, CheckCircle, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";
import { clientsApi } from "@/lib/api/clients";
import { Job, CreateJobInput, ServiceType, PropertyType } from "@/types/job";
import { Client } from "@/types/client";
import { format, addHours, parseISO } from "date-fns";

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
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

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

  // Load clients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadClients();
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

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error("Failed to load clients");
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
    const { name, value } = e.target;
    
    if (name === 'service_type') {
      const newServiceType = value as ServiceType;
      const selectedClient = clients.find(c => c.id === formData.client_id);
      setFormData(prev => ({
        ...prev,
        service_type: newServiceType,
        estimated_price: getDefaultPrice(newServiceType),
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

    // Warn about conflicts
    if (getConflicts.length > 0) {
      const confirmed = confirm(
        `This job conflicts with ${getConflicts.length} existing job(s). Continue anyway?`
      );
      if (!confirmed) return;
    }

    setLoading(true);

    try {
      const jobData: CreateJobInput = {
        ...formData,
        description: formData.description?.trim() || undefined,
        scheduled_time: formData.scheduled_time || undefined,
        address: formData.address?.trim() || undefined,
        special_instructions: formData.special_instructions?.trim() || undefined,
        access_instructions: formData.access_instructions?.trim() || undefined,
      };

      await jobsApi.create(jobData);
      toast.success("Job scheduled successfully!");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Schedule Job</h2>
            {selectedDate && (
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                {selectedTime && ` at ${format(new Date(`2000-01-01T${selectedTime}`), 'h:mm a')}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflicts Warning */}
        {getConflicts.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Scheduling Conflict Detected</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              This time slot conflicts with {getConflicts.length} existing job(s). Consider choosing a different time.
            </p>
          </div>
        )}

        {/* Form */}
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
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredClients.length === 0 ? (
                      <div className="p-3 text-gray-500 text-center">
                        No clients found
                      </div>
                    ) : (
                      filteredClients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleClientSelect(client)}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{client.name}</div>
                          {client.email && (
                            <div className="text-sm text-gray-600">{client.email}</div>
                          )}
                          {client.address && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {client.city}, {client.state}
                            </div>
                          )}
                        </button>
                      ))
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
            </div>
            <div>
              <label htmlFor="estimated_duration" className="block text-sm font-medium text-gray-700 mb-2">
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

          {/* Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                id="scheduled_date"
                name="scheduled_date"
                required
                value={formData.scheduled_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="scheduled_time" className="block text-sm font-medium text-gray-700 mb-2">
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

          {/* Suggested Times */}
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
              Estimated Price ($)
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
            />
          </div>

          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              placeholder="e.g., Regular Cleaning - John Doe"
            />
          </div>

          {/* Special Instructions */}
          <div>
            <label htmlFor="special_instructions" className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              id="special_instructions"
              name="special_instructions"
              rows={3}
              value={formData.special_instructions}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              placeholder="Any special requirements or notes..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading || clients.length === 0}
              className="flex-1 sm:flex-none px-6 py-3 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Scheduling...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Schedule Job
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickJobModal; 
 
 
 
 