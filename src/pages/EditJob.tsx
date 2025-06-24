import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, User, MapPin, Phone, Mail, Plus, ChevronDown, ChevronLeft, ChevronRight, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api/clients";
import { jobsApi } from "@/lib/api/jobs";
import { Client } from "@/types/client";
import { Job, ServiceType, PropertyType, UpdateJobInput } from "@/types/job";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { useLocale } from "@/hooks/useLocale";
import LineItemModal from "@/components/jobs/LineItemModal";
import { teamManagementApi, TeamMember } from "@/lib/api/team-management";

interface LineItem {
  description: string;
  price: number;
  quantity?: number;
}

const EditJob = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { formatCurrency } = useLocale();
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingJob, setLoadingJob] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [scheduleForLater, setScheduleForLater] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [remindToInvoice, setRemindToInvoice] = useState(false);
  const [showLineItemModal, setShowLineItemModal] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [job, setJob] = useState<Job | null>(null);

  const [formData, setFormData] = useState({
    clientId: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    jobTitle: "",
    instructions: "",
    salesperson: "",
    subtotal: 0,
    startTime: '',
    endTime: '',
    arrivalWindow: '',
    repeating: 'none',
    service_type: 'regular' as ServiceType,
    property_type: 'residential' as PropertyType,
  });

  // Load job, clients, and team members on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate("/jobs");
        return;
      }
      
      try {
        // Load job data
        const jobData = await jobsApi.getById(id);
        if (!jobData) {
          toast.error("Job not found");
          navigate("/jobs");
          return;
        }
        setJob(jobData);
        
        // Load clients
        const clientsData = await clientsApi.getAll();
        setClients(clientsData);
        
        // Find the client for this job
        const client = clientsData.find(c => c.id === jobData.client_id);
        setSelectedClient(client || null);
        
        // Set up line items from job data
        if (jobData.line_items && Array.isArray(jobData.line_items)) {
          setLineItems(jobData.line_items.map(item => ({
            description: item.description,
            price: item.price,
            quantity: item.quantity
          })));
        }
        
        // Set selected date from job's scheduled date
        if (jobData.scheduled_date) {
          const scheduledDate = new Date(jobData.scheduled_date);
          setCurrentMonth(scheduledDate);
          setSelectedDate(scheduledDate.getDate());
        }
        
        // Set form data from job
        setFormData({
          clientId: jobData.client_id || "",
          firstName: client?.name?.split(' ')[0] || '',
          lastName: client?.name?.split(' ').slice(1).join(' ') || '',
          address: client?.address || jobData.address || "",
          phone: client?.phone || "",
          email: client?.email || "",
          jobTitle: jobData.title || "",
          instructions: jobData.special_instructions || jobData.description || "",
          salesperson: "",
          subtotal: jobData.estimated_price || 0,
          startTime: jobData.scheduled_time || '',
          endTime: '',
          arrivalWindow: '',
          repeating: jobData.is_recurring ? 'recurring' : 'none',
          service_type: jobData.service_type || 'regular',
          property_type: jobData.property_type || 'residential',
        });
        
        // Load team members
        const members = await teamManagementApi.getActiveTeamMembers();
        setTeamMembers(members);
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

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      ...formData,
      clientId: client.id,
      firstName: client.name.split(' ')[0] || '',
      lastName: client.name.split(' ').slice(1).join(' ') || '',
      address: client.address || '',
      phone: client.phone || '',
      email: client.email || ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.jobTitle) {
      toast.error("Job title is required");
      return;
    }

    if (!formData.clientId) {
      toast.error("Client selection is required");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a scheduled date");
      return;
    }

    if (!id || !job) {
      toast.error("Job ID is missing");
      return;
    }

    try {
      setIsSubmitting(true);

      // Format the date for the API
      const scheduledDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        selectedDate
      ).toISOString().split('T')[0];

      // Prepare line items data
      const lineItemsData = lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity || 1,
        price: item.price
      }));

      // Create update data object
      const updateData: UpdateJobInput = {
        title: formData.jobTitle,
        description: formData.instructions,
        special_instructions: formData.instructions,
        service_type: formData.service_type,
        property_type: formData.property_type,
        scheduled_date: scheduledDate,
        estimated_price: formData.subtotal,
        line_items: lineItemsData, // This is custom data that will be stored as JSON
        is_recurring: formData.repeating === 'recurring',
      };

      await jobsApi.update(id, updateData);

      toast.success("Job updated successfully!");
      navigate("/jobs");
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error("Failed to update job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLineItem = (item: { description: string; price: number }) => {
    const newLineItems = [...lineItems, { ...item, quantity: 1 }];
    setLineItems(newLineItems);
    
    // Update subtotal
    const newSubtotal = newLineItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    setFormData(prev => ({
      ...prev,
      subtotal: newSubtotal
    }));
  };

  // Add function to handle removing a line item
  const handleRemoveLineItem = (index: number) => {
    const newLineItems = [...lineItems];
    newLineItems.splice(index, 1);
    setLineItems(newLineItems);
    
    // Update subtotal
    const newSubtotal = newLineItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    setFormData(prev => ({
      ...prev,
      subtotal: newSubtotal
    }));
  };

  // Add function to handle quantity changes
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1
    
    const newLineItems = [...lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      quantity: newQuantity
    };
    setLineItems(newLineItems);
    
    // Update subtotal
    const newSubtotal = newLineItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    setFormData(prev => ({
      ...prev,
      subtotal: newSubtotal
    }));
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Get days from previous month to fill the calendar
    const daysFromPrevMonth = firstDayOfMonth === 0 ? 0 : firstDayOfMonth;
    
    // Get days from next month to fill the calendar
    const totalSlots = Math.ceil((daysInMonth + daysFromPrevMonth) / 7) * 7;
    const daysFromNextMonth = totalSlots - daysInMonth - daysFromPrevMonth;
    
    // Create array for all days to display
    const calendarDays = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
      calendarDays.push({ day: i, currentMonth: false, prevMonth: true });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({ day: i, currentMonth: true, prevMonth: false });
    }
    
    // Add days from next month
    for (let i = 1; i <= daysFromNextMonth; i++) {
      calendarDays.push({ day: i, currentMonth: false, prevMonth: false });
    }
    
    return calendarDays;
  };

  // Navigate to previous month
  const goToPrevMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() - 1);
      return newMonth;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() + 1);
      return newMonth;
    });
  };

  // Format month and year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Handle day selection
  const handleDaySelect = (day: number) => {
    setSelectedDate(day);
  };

  if (loadingJob) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AppLayout>
    );
  }

  // Save button component for the header
  const SaveButton = (
    <button
      onClick={handleSubmit}
      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Saving...' : 'Save'}
    </button>
  );

  return (
    <AppLayout hideBottomNav>
      {/* Page Header with Save button on the right */}
      <PageHeader 
        title="Edit job" 
        onBackClick={() => navigate(-1)}
        rightElement={SaveButton}
      />

      <div className="px-4 pt-7 pb-32 flex-1 overflow-y-auto min-h-screen bg-white">
        {/* Overview Section */}
        <h2 className="text-xl text-gray-700 font-medium mb-4">Overview</h2>
        
        <div className="space-y-4 mb-8">
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="Job title"
                className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
          
          <textarea
            value={formData.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            placeholder="Instructions"
                className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            rows={4}
              />
        </div>

        {/* Client Selection Section */}
        <div className="mb-8">
          <h2 className="text-xl text-gray-700 font-medium mb-4">Client</h2>
          
          {loadingClients ? (
            <div className="p-4 text-center text-gray-500">Loading clients...</div>
          ) : clients.length > 0 ? (
            <div className="border rounded-xl overflow-hidden">
              <select
                value={formData.clientId}
                onChange={(e) => {
                  const client = clients.find(c => c.id === e.target.value);
                  if (client) handleClientSelect(client);
                }}
                className="w-full p-4 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No clients found.</div>
          )}
        </div>

        {/* Worker Section (formerly Salesperson) */}
        <div className="mb-8">
          <div className="relative mb-4">
            <label className="text-sm text-gray-700 font-medium mb-1 block">Worker</label>
            <div className="relative">
              <select
                value={formData.salesperson}
                onChange={(e) => handleInputChange('salesperson', e.target.value)}
                className="w-full p-4 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
              >
                <option value="">Please select</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.member_name || member.member_email || member.id}>
                    {member.member_name || member.member_email || 'Team Member'}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-3 bg-gray-100 -mx-4 px-4 mb-8"></div>
        
        {/* Service Section */}
        <h2 className="text-xl text-gray-700 font-medium mb-4">Service</h2>
        
        {/* Service Type */}
        <div className="mb-4">
          <label className="text-sm text-gray-700 font-medium mb-1 block">Service Type</label>
          <select
            value={formData.service_type}
            onChange={(e) => handleInputChange('service_type', e.target.value as ServiceType)}
            className="w-full p-4 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
          >
            <option value="regular">Regular Cleaning</option>
            <option value="deep_clean">Deep Clean</option>
            <option value="move_in">Move-in Clean</option>
            <option value="move_out">Move-out Clean</option>
            <option value="post_construction">Post-Construction</option>
            <option value="one_time">One-time Clean</option>
          </select>
        </div>
        
        {/* Property Type */}
        <div className="mb-4">
          <label className="text-sm text-gray-700 font-medium mb-1 block">Property Type</label>
          <select
            value={formData.property_type}
            onChange={(e) => handleInputChange('property_type', e.target.value as PropertyType)}
            className="w-full p-4 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        
        {/* Line items Section */}
        <div className="flex items-center justify-between border-t border-b py-4 mb-4">
          <h3 className="text-xl font-medium text-gray-800">Line items</h3>
          <button 
            className="text-blue-600"
            onClick={() => setShowLineItemModal(true)}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Display Line Items */}
        {lineItems.length > 0 ? (
          <div className="mb-4 space-y-3">
            {lineItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.description}</h4>
                  <div className="flex items-center mt-1">
                    <button 
                      onClick={() => handleQuantityChange(index, (item.quantity || 1) - 1)}
                      className="w-8 h-8 flex items-center justify-center text-blue-600 border border-gray-300 rounded-l-lg"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity || 1} 
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                      className="w-12 h-8 border-y border-gray-300 text-center"
                    />
                    <button 
                      onClick={() => handleQuantityChange(index, (item.quantity || 1) + 1)}
                      className="w-8 h-8 flex items-center justify-center text-blue-600 border border-gray-300 rounded-r-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-900 font-medium">{formatCurrency(item.price * (item.quantity || 1))}</div>
                  <button 
                    onClick={() => handleRemoveLineItem(index)}
                    className="text-red-500 text-sm mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg font-medium">
              <span>Total</span>
              <span>{formatCurrency(formData.subtotal)}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg mb-4">
            No line items added yet. Click the + button to add items.
          </div>
        )}

        {/* Separator */}
        <div className="w-full h-3 bg-gray-100 -mx-4 px-4 mb-8"></div>

        {/* Schedule Section */}
        <h2 className="text-xl text-gray-700 font-medium mb-4">Schedule</h2>
        
        {/* Calendar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={goToPrevMonth} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h3 className="text-lg font-medium text-gray-800">{formatMonthYear(currentMonth)}</h3>
            <button onClick={goToNextMonth} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm text-gray-500 font-medium py-1">
                {day}
              </div>
            ))}
            
            {generateCalendarDays().map((day, index) => (
              <button
                key={index}
                onClick={() => day.currentMonth && handleDaySelect(day.day)}
                className={`
                  h-10 rounded-full flex items-center justify-center text-sm
                  ${day.currentMonth ? 'hover:bg-gray-100' : 'text-gray-400'}
                  ${day.currentMonth && selectedDate === day.day ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                `}
                disabled={!day.currentMonth}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>
        
        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-700 font-medium mb-1 block">Start Time</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 font-medium mb-1 block">End Time</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
        </div>
        
        {/* Recurring Job Option */}
        <div className="mb-4">
          <label className="text-sm text-gray-700 font-medium mb-1 block">Recurring</label>
          <select
            value={formData.repeating}
            onChange={(e) => handleInputChange('repeating', e.target.value)}
            className="w-full p-4 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
          >
            <option value="none">One-time job</option>
            <option value="recurring">Recurring job</option>
          </select>
        </div>
      </div>

      {/* Line Item Modal */}
      {showLineItemModal && (
        <LineItemModal
          isOpen={showLineItemModal}
          onClose={() => setShowLineItemModal(false)}
          onAddItem={handleAddLineItem}
        />
      )}
    </AppLayout>
  );
};

export default EditJob; 