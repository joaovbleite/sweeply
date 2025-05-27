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
  Loader2,
  Home,
  Building2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";
import { clientsApi } from "@/lib/api/clients";
import { Job, UpdateJobInput, ServiceType, PropertyType, RecurringFrequency } from "@/types/job";
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
    property_type: "residential",
    scheduled_date: "",
    scheduled_time: "",
    estimated_duration: 120,
    estimated_price: 0,
    address: "",
    special_instructions: "",
    access_instructions: "",
    
    // Residential fields
    number_of_bedrooms: undefined,
    number_of_bathrooms: undefined,
    house_type: "",
    
    // Commercial fields
    square_footage: undefined,
    number_of_floors: undefined,
    building_type: "",
    
    is_recurring: false,
    recurring_frequency: undefined,
    recurring_end_date: ""
  });

  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>({
    is_recurring: false,
    frequency: 'weekly',
    endType: 'never'
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
          property_type: jobData.property_type || "residential",
          scheduled_date: jobData.scheduled_date,
          scheduled_time: jobData.scheduled_time || "",
          estimated_duration: jobData.estimated_duration || 120,
          estimated_price: jobData.estimated_price || 0,
          address: jobData.address || "",
          special_instructions: jobData.special_instructions || "",
          access_instructions: jobData.access_instructions || "",
          
          // Residential fields
          number_of_bedrooms: jobData.number_of_bedrooms,
          number_of_bathrooms: jobData.number_of_bathrooms,
          house_type: jobData.house_type || "",
          
          // Commercial fields
          square_footage: jobData.square_footage,
          number_of_floors: jobData.number_of_floors,
          building_type: jobData.building_type || "",
          
          is_recurring: jobData.is_recurring || false,
          recurring_frequency: jobData.recurring_frequency,
          recurring_end_date: jobData.recurring_end_date || "",
          status: jobData.status
        });

        // Set recurring pattern
        setRecurringPattern({
          is_recurring: jobData.is_recurring || false,
          frequency: jobData.recurring_frequency || 'weekly',
          endType: jobData.recurring_end_date ? 'date' : 'never',
          recurring_frequency: jobData.recurring_frequency,
          recurring_end_date: jobData.recurring_end_date,
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
    } else if (name === 'estimated_price' || name === 'estimated_duration' || name === 'number_of_bedrooms' || name === 'number_of_bathrooms' || name === 'square_footage' || name === 'number_of_floors') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePropertyTypeToggle = () => {
    const newPropertyType: PropertyType = formData.property_type === 'residential' ? 'commercial' : 'residential';
    setFormData(prev => ({
      ...prev,
      property_type: newPropertyType,
      // Clear property-specific fields when switching
      number_of_bedrooms: undefined,
      number_of_bathrooms: undefined,
      house_type: "",
      square_footage: undefined,
      number_of_floors: undefined,
      building_type: ""
    }));
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
        house_type: formData.house_type?.trim() || undefined,
        building_type: formData.building_type?.trim() || undefined,
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
            {/* Property Type Toggle */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                {formData.property_type === 'residential' ? <Home className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                Property Type
              </h3>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handlePropertyTypeToggle}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                    formData.property_type === 'residential'
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Residential</span>
                </button>
                
                <div className="flex items-center">
                  {formData.property_type === 'residential' ? (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  ) : (
                    <ToggleRight className="w-8 h-8 text-blue-500" />
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={handlePropertyTypeToggle}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                    formData.property_type === 'commercial'
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">Commercial</span>
                </button>
              </div>
            </div>

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

            {/* Property-Specific Fields */}
            {formData.property_type === 'residential' ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Residential Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="number_of_bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      id="number_of_bedrooms"
                      name="number_of_bedrooms"
                      min="0"
                      max="20"
                      value={formData.number_of_bedrooms || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label htmlFor="number_of_bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      id="number_of_bathrooms"
                      name="number_of_bathrooms"
                      min="0"
                      max="20"
                      value={formData.number_of_bathrooms || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label htmlFor="house_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      id="house_type"
                      name="house_type"
                      value={formData.house_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                      <option value="">Select type...</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="studio">Studio</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Commercial Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="square_footage" className="block text-sm font-medium text-gray-700 mb-2">
                      Square Footage
                    </label>
                    <input
                      type="number"
                      id="square_footage"
                      name="square_footage"
                      min="0"
                      value={formData.square_footage || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label htmlFor="number_of_floors" className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Floors
                    </label>
                    <input
                      type="number"
                      id="number_of_floors"
                      name="number_of_floors"
                      min="1"
                      max="100"
                      value={formData.number_of_floors || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label htmlFor="building_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Building Type
                    </label>
                    <select
                      id="building_type"
                      name="building_type"
                      value={formData.building_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                      <option value="">Select type...</option>
                      <option value="office">Office Building</option>
                      <option value="retail">Retail Store</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="medical">Medical Facility</option>
                      <option value="school">School/Educational</option>
                      <option value="gym">Gym/Fitness Center</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

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
                pattern={recurringPattern}
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
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.property_type === 'commercial' ? 'Commercial rates typically range from $200-500' : 'Residential rates typically range from $100-300'}
                  </p>
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
                    placeholder="123 Main St, City, State 12345"
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
                    placeholder="Any special requirements or notes for this cleaning..."
                  />
                </div>
                <div>
                  <label htmlFor="access_instructions" className="block text-sm font-medium text-gray-700 mb-2">
                    Access Instructions
                  </label>
                  <textarea
                    id="access_instructions"
                    name="access_instructions"
                    rows={2}
                    value={formData.access_instructions}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    placeholder="Key location, security codes, parking instructions..."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                to="/jobs"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-pulse-600 text-white rounded-lg hover:bg-pulse-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Job
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default EditJob; 