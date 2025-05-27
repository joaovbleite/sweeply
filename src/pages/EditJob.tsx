import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Briefcase, 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  FileText,
  Repeat,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";
import { clientsApi } from "@/lib/api/clients";
import { Job, UpdateJobInput, ServiceType, RecurringFrequency } from "@/types/job";
import { Client } from "@/types/client";
import AppLayout from "@/components/AppLayout";
import RecurringJobPattern, { RecurringPattern } from "@/components/RecurringJobPattern";

const EditJob = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<UpdateJobInput>({
    title: "",
    description: "",
    service_type: "regular",
    scheduled_date: "",
    scheduled_time: "",
    estimated_duration: 120,
    estimated_price: 0,
    address: "",
    special_instructions: "",
    access_instructions: "",
    is_recurring: false,
    recurring_frequency: undefined,
    recurring_end_date: ""
  });

  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>({
    is_recurring: false
  });

  // Load job and clients on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate("/jobs");
        return;
      }

      try {
        // Load job
        const jobData = await jobsApi.getById(id);
        if (!jobData) {
          toast.error("Job not found");
          navigate("/jobs");
          return;
        }
        setJob(jobData);
        
        // Set form data from job
        setFormData({
          title: jobData.title || "",
          description: jobData.description || "",
          service_type: jobData.service_type,
          scheduled_date: jobData.scheduled_date,
          scheduled_time: jobData.scheduled_time || "",
          estimated_duration: jobData.estimated_duration || 120,
          estimated_price: jobData.estimated_price || 0,
          address: jobData.address || "",
          special_instructions: jobData.special_instructions || "",
          access_instructions: jobData.access_instructions || "",
          is_recurring: jobData.is_recurring || false,
          recurring_frequency: jobData.recurring_frequency,
          recurring_end_date: jobData.recurring_end_date || "",
          status: jobData.status
        });

        // Set recurring pattern
        setRecurringPattern({
          is_recurring: jobData.is_recurring || false,
          recurring_frequency: jobData.recurring_frequency,
          recurring_end_date: jobData.recurring_end_date || undefined,
          recurring_end_type: jobData.recurring_end_date ? 'date' : 'never'
        });

        // Load clients
        const clientsData = await clientsApi.getAll();
        setClients(clientsData);
        
        // Set selected client
        const client = clientsData.find(c => c.id === jobData.client_id);
        setSelectedClient(client || null);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error("Failed to load job data");
        navigate("/jobs");
      } finally {
        setLoadingJob(false);
        setLoadingClients(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
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

  const handleRecurringPatternChange = (pattern: RecurringPattern) => {
    setRecurringPattern(pattern);
    setFormData(prev => ({
      ...prev,
      is_recurring: pattern.is_recurring,
      recurring_frequency: pattern.recurring_frequency,
      recurring_end_date: pattern.recurring_end_date
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job || !id) return;

    // Validation
    if (!formData.title?.trim()) {
      toast.error("Job title is required");
      return;
    }
    if (!formData.scheduled_date) {
      toast.error("Scheduled date is required");
      return;
    }

    // Validate recurring job settings
    if (recurringPattern.is_recurring && !recurringPattern.recurring_frequency) {
      toast.error("Please select a recurring frequency");
      return;
    }

    setLoading(true);

    try {
      // Clean up the data before sending
      const updateData: UpdateJobInput = {
        ...formData,
        // Remove empty strings and convert to undefined
        description: formData.description?.trim() || undefined,
        scheduled_time: formData.scheduled_time || undefined,
        address: formData.address?.trim() || undefined,
        special_instructions: formData.special_instructions?.trim() || undefined,
        access_instructions: formData.access_instructions?.trim() || undefined,
        recurring_frequency: recurringPattern.is_recurring ? recurringPattern.recurring_frequency : undefined,
        recurring_end_date: recurringPattern.is_recurring && recurringPattern.recurring_end_date ? recurringPattern.recurring_end_date : undefined,
      };

      await jobsApi.update(id, updateData);
      
      if (recurringPattern.is_recurring && job.is_recurring !== recurringPattern.is_recurring) {
        toast.success("Job updated and converted to recurring job!");
      } else {
        toast.success("Job updated successfully!");
      }
      
      navigate("/jobs");
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error("Failed to update job");
    } finally {
      setLoading(false);
    }
  };

  // Get service type display name
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

  // Update price when service type changes
  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newServiceType = e.target.value as ServiceType;
    setFormData(prev => ({
      ...prev,
      service_type: newServiceType
    }));
  };

  if (loadingJob) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-pulse-500" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/jobs"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">Edit Job</h1>
              <p className="mt-1 text-gray-600">Update job details for {selectedClient?.name}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Client Information (Read-only) */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{selectedClient?.name}</p>
                {selectedClient?.email && <p className="text-sm text-gray-600">{selectedClient.email}</p>}
                {selectedClient?.phone && <p className="text-sm text-gray-600">{selectedClient.phone}</p>}
              </div>
            </div>

            {/* Job Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
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
                  />
                </div>
                <div>
                  <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    id="service_type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleServiceTypeChange}
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
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status || job.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="estimated_duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (minutes)
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
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    placeholder="Additional details about this cleaning job..."
                  />
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduling
              </h3>
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
            </div>

            {/* Recurring Job Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Repeat className="w-5 h-5" />
                Recurring Job
              </h3>
              <RecurringJobPattern
                isRecurring={recurringPattern.is_recurring}
                frequency={recurringPattern.recurring_frequency}
                endDate={recurringPattern.recurring_end_date}
                startDate={formData.scheduled_date}
                onChange={handleRecurringPatternChange}
              />
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>

            {/* Location & Instructions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location & Instructions
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    placeholder="Address where the service will be performed"
                  />
                </div>
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
                    placeholder="Pet considerations, areas to focus on, client preferences, etc."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-3 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating Job...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Job
                  </>
                )}
              </button>
              <Link
                to="/jobs"
                className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default EditJob; 