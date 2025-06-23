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

const serviceTypes: ServiceType[] = [
  'regular', 
  'deep_clean', 
  'move_in', 
  'move_out', 
  'post_construction', 
  'one_time'
];

// Helper for form sections
const FormSection: React.FC<{title: string; icon?: React.ElementType; children: React.ReactNode;}> = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="p-4 sm:p-5 border-b border-gray-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-gray-500" />}
        {title}
      </h3>
    </div>
    <div className="p-4 sm:p-5 space-y-4">
      {children}
    </div>
  </div>
);

// Helper for form fields
const FormField: React.FC<{label: string; children: React.ReactNode;}> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
  </div>
);

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
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-pulse-500" />
        </div>
      </AppLayout>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white">
          <div className="flex items-center justify-between px-4 pt-2 pb-2 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                to="/jobs"
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Job</h1>
                <p className="text-sm text-gray-600 mt-0.5">Update details for job #{job?.id.substring(0, 8)}</p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center gap-2 transition-colors disabled:bg-pulse-300"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-4 pb-20 space-y-8">
          {/* Job Details Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-gray-500" /> Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                  placeholder="e.g., Regular House Cleaning"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Type</label>
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500 bg-white"
                >
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>{getServiceTypeDisplay(type)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                placeholder="Any specific details about the job..."
              />
            </div>
          </section>

          {/* Client Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-gray-500" /> Client</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Client</label>
              <select
                value={selectedClient?.id || ""}
                onChange={(e) => {
                  const client = clients.find(c => c.id === e.target.value);
                  setSelectedClient(client || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500 bg-white"
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Schedule & Pricing Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-gray-500" /> Schedule & Pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Scheduled Date</label>
                <input
                  type="date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Scheduled Time</label>
                <input
                  type="time"
                  name="scheduled_time"
                  value={formData.scheduled_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  name="estimated_duration"
                  value={formData.estimated_duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Estimated Price ($)</label>
                <input
                  type="number"
                  name="estimated_price"
                  value={formData.estimated_price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                />
              </div>
            </div>
          </section>

          {/* Property Details Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-gray-500" /> Property Details</h2>
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, property_type: 'residential' }))}
                className={`w-full py-1.5 rounded-md text-sm font-medium transition-colors ${
                  formData.property_type === 'residential' ? 'bg-white shadow-sm text-pulse-600' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Home className="w-4 h-4 inline-block mr-1.5" />
                Residential
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, property_type: 'commercial' }))}
                className={`w-full py-1.5 rounded-md text-sm font-medium transition-colors ${
                  formData.property_type === 'commercial' ? 'bg-white shadow-sm text-pulse-600' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Building2 className="w-4 h-4 inline-block mr-1.5" />
                Commercial
              </button>
            </div>

            {formData.property_type === 'residential' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bedrooms</label>
                  <input
                    type="number"
                    name="number_of_bedrooms"
                    value={formData.number_of_bedrooms || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bathrooms</label>
                  <input
                    type="number"
                    name="number_of_bathrooms"
                    value={formData.number_of_bathrooms || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                  />
                </div>
              </div>
            )}

            {formData.property_type === 'commercial' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Square Footage</label>
                  <input
                    type="number"
                    name="square_footage"
                    value={formData.square_footage || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Floors</label>
                  <input
                    type="number"
                    name="number_of_floors"
                    value={formData.number_of_floors || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Instructions Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-gray-500" /> Instructions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                  placeholder="Enter the full address for the job"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Access Instructions</label>
                <textarea
                  name="access_instructions"
                  value={formData.access_instructions}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                  placeholder="e.g., Key under the mat, gate code #1234"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instructions</label>
              <textarea
                name="special_instructions"
                value={formData.special_instructions}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pulse-500 focus:border-pulse-500"
                placeholder="e.g., Pet-friendly cleaning products, focus on kitchen"
              />
            </div>
          </section>
          
          {/* Recurring Job Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><Repeat className="w-5 h-5 text-gray-500" /> Recurring Job</h2>
            <RecurringJobPattern
              pattern={recurringPattern}
              isRecurring={recurringPattern.is_recurring}
              frequency={recurringPattern.recurring_frequency}
              endDate={recurringPattern.recurring_end_date}
              startDate={formData.scheduled_date}
              onChange={handleRecurringPatternChange}
            />
          </section>
        </form>
      </div>
    </AppLayout>
  );
};

export default EditJob; 