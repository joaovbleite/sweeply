import React, { useState, useEffect } from "react";
import { X, Save, User, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";
import { clientsApi } from "@/lib/api/clients";
import { CreateJobInput, ServiceType } from "@/types/job";
import { Client } from "@/types/client";
import { format } from "date-fns";

interface QuickJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedTime?: string;
  onJobCreated: () => void;
}

const QuickJobModal: React.FC<QuickJobModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  onJobCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const [formData, setFormData] = useState<CreateJobInput>({
    client_id: "",
    title: "",
    service_type: "regular",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'client_id') {
      const client = clients.find(c => c.id === value);
      if (client) {
        const clientAddress = [
          client.address,
          client.city,
          client.state,
          client.zip
        ].filter(Boolean).join(', ');

        setFormData(prev => ({
          ...prev,
          client_id: value,
          address: clientAddress,
          title: `${getServiceTypeDisplay(prev.service_type)} - ${client.name}`
        }));
      }
    } else if (name === 'service_type') {
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
      resetForm();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error("Failed to schedule job");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      title: "",
      service_type: "regular",
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Schedule Job</h2>
            {selectedDate && (
              <p className="text-sm text-gray-600 mt-1">
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Selection */}
          <div>
            <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
              Client *
            </label>
            {loadingClients ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                Loading clients...
              </div>
            ) : (
              <select
                id="client_id"
                name="client_id"
                required
                value={formData.client_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              >
                <option value="">Choose a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.email && `(${client.email})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Job Details */}
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