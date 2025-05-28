import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Home,
  Building2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";
import { clientsApi } from "@/lib/api/clients";
import { CreateJobInput, ServiceType, PropertyType, RecurringFrequency } from "@/types/job";
import { Client } from "@/types/client";
import AppLayout from "@/components/AppLayout";
import RecurringJobPattern, { RecurringPattern } from "@/components/RecurringJobPattern";

const AddJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<CreateJobInput>({
    client_id: "",
    title: "",
    description: "",
    service_type: "regular",
    property_type: "residential",
    scheduled_date: "",
    scheduled_time: "",
    estimated_duration: 120, // 2 hours default
    estimated_price: 120,
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
    recurring_end_date: undefined
  });

  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>({
    is_recurring: false,
    frequency: 'weekly',
    endType: 'never'
  });

  // Load clients on component mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await clientsApi.getAll();
        setClients(data);
      } catch (error) {
        console.error('Error loading clients:', error);
        toast.error("Failed to load clients");
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  // Update selected client when client_id changes
  useEffect(() => {
    const client = clients.find(c => c.id === formData.client_id);
    setSelectedClient(client || null);
    
    // Auto-generate title when client is selected
    if (client && !formData.title) {
      const serviceDisplay = getServiceTypeDisplay(formData.service_type);
      setFormData(prev => ({
        ...prev,
        title: `${serviceDisplay} - ${client.name}`
      }));
    }
  }, [formData.client_id, clients]);

  // Update price based on property details
  useEffect(() => {
    let basePrice = getBasePrice(formData.service_type);
    
    if (formData.property_type === 'residential') {
      // Adjust price based on bedrooms and bathrooms
      const bedrooms = formData.number_of_bedrooms || 0;
      const bathrooms = formData.number_of_bathrooms || 0;
      
      // Add $20 per bedroom after the first 2
      if (bedrooms > 2) {
        basePrice += (bedrooms - 2) * 20;
      }
      
      // Add $15 per bathroom after the first 1
      if (bathrooms > 1) {
        basePrice += (bathrooms - 1) * 15;
      }
    } else if (formData.property_type === 'commercial') {
      // Adjust price based on square footage
      const sqft = formData.square_footage || 0;
      
      // Base price covers up to 2000 sqft, add $0.05 per additional sqft
      if (sqft > 2000) {
        basePrice += (sqft - 2000) * 0.05;
      }
      
      // Add for multiple floors
      const floors = formData.number_of_floors || 1;
      if (floors > 1) {
        basePrice += (floors - 1) * 50;
      }
    }
    
    // Round to nearest $5
    basePrice = Math.round(basePrice / 5) * 5;
    
    setFormData(prev => ({
      ...prev,
      estimated_price: basePrice
    }));
  }, [formData.service_type, formData.property_type, formData.number_of_bedrooms, 
      formData.number_of_bathrooms, formData.square_footage, formData.number_of_floors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle client change specifically
    if (name === 'client_id') {
      const client = clients.find(c => c.id === value);
      if (client) {
        // Build client address
        const clientAddress = [
          client.address,
          client.city,
          client.state,
          client.zip
        ].filter(Boolean).join(', ');
        
        setFormData(prev => ({
          ...prev,
          client_id: value,
          address: clientAddress || prev.address
        }));
        return;
      }
    }
    
    // Convert number inputs
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
    
    // Validation
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

    // Validate recurring job settings
    if (recurringPattern.is_recurring) {
      if (!recurringPattern.frequency) {
        toast.error("Please select a recurring frequency");
        return;
      }
      if (recurringPattern.endType === 'date' && !recurringPattern.endDate) {
        toast.error("Please select an end date for the recurring job");
        return;
      }
      if (recurringPattern.endType === 'occurrences' && !recurringPattern.occurrences) {
        toast.error("Please specify the number of occurrences");
        return;
      }
    }

    setLoading(true);

    try {
      // Clean up the data before sending
      const jobData: CreateJobInput = {
        ...formData,
        // Remove empty strings and convert to undefined
        description: formData.description?.trim() || undefined,
        scheduled_time: formData.scheduled_time || undefined,
        address: formData.address?.trim() || undefined,
        special_instructions: formData.special_instructions?.trim() || undefined,
        access_instructions: formData.access_instructions?.trim() || undefined,
        house_type: formData.house_type?.trim() || undefined,
        building_type: formData.building_type?.trim() || undefined,
        is_recurring: recurringPattern.is_recurring,
        recurring_frequency: recurringPattern.is_recurring ? recurringPattern.frequency : undefined,
        recurring_end_date: recurringPattern.is_recurring && recurringPattern.endType === 'date' ? recurringPattern.endDate : undefined,
      };

      // Check for scheduling conflicts
      const conflicts = await jobsApi.checkSchedulingConflicts(
        jobData.scheduled_date,
        jobData.scheduled_time
      );

      if (conflicts.length > 0) {
        const conflictNames = conflicts.map(job => job.client?.name || 'Unknown').join(', ');
        const proceed = confirm(
          `There are potential scheduling conflicts with: ${conflictNames}. Do you want to proceed anyway?`
        );
        if (!proceed) {
          setLoading(false);
          return;
        }
      }

      // If it's a recurring job, use the createRecurring method
      if (recurringPattern.is_recurring) {
        const recurringJobData = {
          ...jobData,
          ...recurringPattern,
          recurring_frequency: recurringPattern.frequency,
          recurring_end_type: recurringPattern.endType,
          recurring_end_date: recurringPattern.endDate,
          recurring_occurrences: recurringPattern.occurrences,
          recurring_days_of_week: recurringPattern.daysOfWeek,
          recurring_day_of_month: recurringPattern.dayOfMonth
        };
        
        await jobsApi.createRecurring(recurringJobData);
        
        // Show info about recurring job creation
        toast.success(
          `Recurring job created! ${
            recurringPattern.endType === 'never' 
              ? 'This job will repeat indefinitely.' 
              : recurringPattern.endType === 'date'
              ? `This job will repeat until ${recurringPattern.endDate}.`
              : `This job will repeat ${recurringPattern.occurrences} times.`
          }`,
          { duration: 5000 }
        );
      } else {
        await jobsApi.create(jobData);
        toast.success("Job created successfully!");
      }
      
      navigate("/jobs");
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error("Failed to create job");
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

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getBasePrice = (serviceType: ServiceType) => {
    const prices = {
      regular: 120,
      deep_clean: 200,
      move_in: 250,
      move_out: 250,
      post_construction: 350,
      one_time: 150
    };
    return prices[serviceType] || 120;
  };

  // Handle service type change to update title
  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newServiceType = e.target.value as ServiceType;
    handleChange(e);
    
    // Update title if client is selected
    if (selectedClient) {
      const serviceDisplay = getServiceTypeDisplay(newServiceType);
      setFormData(prev => ({
        ...prev,
        title: `${serviceDisplay} - ${selectedClient.name}`
      }));
    }
  };

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
              <h1 className="text-3xl font-display font-bold text-gray-900">Create New Job</h1>
              <p className="mt-1 text-gray-600">Schedule a cleaning service for your client</p>
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

            {/* Client Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Client *
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
                  {clients.length === 0 && !loadingClients && (
                    <p className="mt-2 text-sm text-gray-500">
                      No clients found. <Link to="/clients/new" className="text-pulse-600 hover:text-pulse-700">Create a client first</Link>.
                    </p>
                  )}
                </div>
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
                    placeholder="e.g., Regular Cleaning - John Doe"
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
                    placeholder="120"
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
                    min={getMinDate()}
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Repeat className="w-5 h-5" />
                  Recurring Job
                </h3>
                <button
                  type="button"
                  onClick={() => setRecurringPattern(prev => ({ ...prev, is_recurring: !prev.is_recurring }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    recurringPattern.is_recurring ? 'bg-pulse-600' : 'bg-gray-200'
                  }`}
                >
                  <span className="sr-only">Enable recurring</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      recurringPattern.is_recurring ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {recurringPattern.is_recurring && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-purple-700 mb-4">
                    This job will automatically repeat based on your selected pattern
                  </p>
                  <RecurringJobPattern
                    pattern={recurringPattern}
                    onChange={setRecurringPattern}
                    startDate={formData.scheduled_date || getMinDate()}
                  />
                </div>
              )}
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
                    placeholder="120.00"
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Job
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

export default AddJob; 
 
 
 
 