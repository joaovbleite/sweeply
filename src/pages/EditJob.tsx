import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, User, MapPin, Phone, Mail, Plus, ChevronDown, ChevronLeft, ChevronRight, Users, Loader2, X } from "lucide-react";
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
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
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

  // Add new state for arrival time
  const [showArrivalTimeModal, setShowArrivalTimeModal] = useState(false);
  const [arrivalWindowDuration, setArrivalWindowDuration] = useState<string>("1 hr");
  const [arrivalWindowStyle, setArrivalWindowStyle] = useState<"after" | "center">("after");
  const [startTime, setStartTime] = useState("18:30");
  const [applyToAllJobs, setApplyToAllJobs] = useState(false);

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
          setSelectedDates([scheduledDate.getDate()]);
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

    if (!selectedDates.length) {
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
      const scheduledDate = selectedDates.length
        ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDates[0]).toISOString().split('T')[0]
        : undefined;

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
    setSelectedDates(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Function to format time for display
  const formatTimeDisplay = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Calculate end time based on start time and window style
  const calculateEndTime = () => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let durationInMinutes = 0;
    
    if (arrivalWindowDuration === "15 min") durationInMinutes = 15;
    else if (arrivalWindowDuration === "30 min") durationInMinutes = 30;
    else if (arrivalWindowDuration === "1 hr") durationInMinutes = 60;
    else if (arrivalWindowDuration === "2 hr") durationInMinutes = 120;
    else if (arrivalWindowDuration === "3 hr") durationInMinutes = 180;
    
    let newHours = hours;
    let newMinutes = minutes;
    
    if (arrivalWindowStyle === "after") {
      newMinutes += durationInMinutes;
      while (newMinutes >= 60) {
        newHours += 1;
        newMinutes -= 60;
      }
      newHours = newHours % 24;
    } else if (arrivalWindowStyle === "center") {
      // For centered window, subtract half the duration from start time
      const halfDuration = Math.floor(durationInMinutes / 2);
      let adjustedHours = hours;
      let adjustedMinutes = minutes - halfDuration;
      
      while (adjustedMinutes < 0) {
        adjustedHours -= 1;
        adjustedMinutes += 60;
      }
      if (adjustedHours < 0) adjustedHours += 24;
      
      setStartTime(`${adjustedHours.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}`);
      
      // Calculate end time (start time + full duration)
      newMinutes = adjustedMinutes + durationInMinutes;
      newHours = adjustedHours;
      while (newMinutes >= 60) {
        newHours += 1;
        newMinutes -= 60;
      }
      newHours = newHours % 24;
    }
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  // Handle saving arrival window settings
  const handleSaveArrivalWindow = () => {
    const endTime = calculateEndTime();
    setFormData(prev => ({
      ...prev,
      startTime,
      endTime,
      arrivalWindow: arrivalWindowDuration
    }));
    setShowArrivalTimeModal(false);
  };

  // Handle opening the arrival time modal
  const handleOpenArrivalTimeModal = () => {
    // Initialize with current form data values if they exist
    if (formData.startTime) {
      setStartTime(formData.startTime);
    }
    
    if (formData.arrivalWindow) {
      setArrivalWindowDuration(formData.arrivalWindow);
    }
    
    setShowArrivalTimeModal(true);
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

        {/* Worker Section (formerly Salesperson) - Restore original */}
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-gray-700 font-medium">Service</h2>
          <button 
            className="text-blue-600"
            onClick={() => setShowLineItemModal(true)}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        
        {/* Service Type */}
        <div className="mb-4 relative">
          <label className="text-sm text-gray-700 font-medium mb-1 block">Service Type</label>
          <div className="relative">
            <select
              value={formData.service_type}
              onChange={(e) => {
                handleInputChange('service_type', e.target.value as ServiceType);
                // Add a default line item based on the selected service type if no line items exist
                if (lineItems.length === 0) {
                  if (e.target.value === 'regular') {
                    handleAddLineItem({ description: "Regular Service", price: 120 });
                  } else if (e.target.value === 'deep_clean') {
                    handleAddLineItem({ description: "Deep Clean", price: 200 });
                  } else if (e.target.value === 'move_in_out') {
                    handleAddLineItem({ description: "Move In/Out Clean", price: 250 });
                  }
                }
              }}
              className="w-full p-4 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
              style={{ position: 'relative', zIndex: 10 }}
            >
              <option value="regular">Regular Service - $120</option>
              <option value="deep_clean">Deep Clean - $200</option>
              <option value="move_in_out">Move In/Out - $250</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-700" />
            </div>
          </div>
        </div>
        
        {/* Property Type */}
        <div className="mb-4 relative">
          <label className="text-sm text-gray-700 font-medium mb-1 block">Property Type</label>
          <div className="relative">
            <select
              value={formData.property_type}
              onChange={(e) => handleInputChange('property_type', e.target.value as PropertyType)}
              className="w-full p-4 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-700" />
            </div>
          </div>
        </div>
        
        {/* Display Line Items */}
        <div className="border-t pt-4 mb-4"></div>

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
                      className="w-12 h-8 text-center border-t border-b border-gray-300 text-sm" 
                    />
                    <button 
                      onClick={() => handleQuantityChange(index, (item.quantity || 1) + 1)}
                      className="w-8 h-8 flex items-center justify-center text-blue-600 border border-gray-300 rounded-r-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-medium text-gray-900">
                    {formatCurrency(item.price * (item.quantity || 1))}
                  </span>
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
          <div className="mb-4 p-6 bg-gray-50 rounded-lg text-center text-gray-500">
            No services added yet. Click the + button to add services.
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
                className={
                  `h-10 rounded-full flex items-center justify-center text-sm
                  ${day.currentMonth ? 'hover:bg-gray-100 text-gray-900' : 'text-gray-500'}
                  ${day.currentMonth && selectedDates.includes(day.day) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`
                }
                disabled={!day.currentMonth}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>
        
        {/* Arrival Time Section - Moved above Recurring */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm text-gray-700 font-medium mb-1 block">Arrival Time</label>
            <button 
              className="text-blue-600"
              onClick={handleOpenArrivalTimeModal}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {formData.startTime && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-900">
                {formatTimeDisplay(formData.startTime)} - {formatTimeDisplay(formData.endTime || calculateEndTime())}
                {formData.arrivalWindow && formData.arrivalWindow !== "none" && ` (${formData.arrivalWindow} window)`}
              </p>
            </div>
          )}
        </div>

        {/* Recurring Job Option */}
        {selectedDates.length === 1 && (
          <div className="mb-8">
            <label className="text-sm text-gray-700 font-medium mb-1 block">Recurring</label>
            <select
              value={formData.repeating}
              onChange={e => handleInputChange('repeating', e.target.value)}
              className="w-full p-4 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
            >
              <option value="none">One-time job</option>
              <option value="recurring">Recurring job</option>
            </select>
          </div>
        )}

        {/* Invoicing Section - No divider before this */}
        <h2 className="text-xl text-gray-700 font-medium mb-4">Invoicing</h2>
        
        <div className="flex items-center justify-between mb-8">
          <div className="w-3/4 pr-4">
            <h3 className="text-xl font-medium text-gray-800">Remind me to invoice when I close the job</h3>
          </div>
          <div 
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out ${remindToInvoice ? 'bg-blue-600' : 'bg-gray-300'}`}
            onClick={() => setRemindToInvoice(!remindToInvoice)}
          >
            <div 
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${remindToInvoice ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </div>
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

      {/* Arrival Time Modal */}
      {showArrivalTimeModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center">
          <div 
            className="bg-white w-full rounded-t-[20px] shadow-lg transform transition-transform duration-300 ease-in-out animate-slide-up"
            style={{
              maxHeight: '90vh',
              overflowY: 'auto',
              paddingBottom: 'env(safe-area-inset-bottom, 24px)'
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#0C1B1F]">Arrival window</h2>
                <button 
                  onClick={() => setShowArrivalTimeModal(false)}
                  className="p-2"
                >
                  <X className="w-6 h-6 text-[#0C1B1F]" />
                </button>
              </div>
              
              <div className="mb-8">
                <p className="text-2xl font-bold text-center text-[#0C1B1F]">
                  {formatTimeDisplay(startTime)} – {formatTimeDisplay(calculateEndTime())}
                </p>
                
                {/* Time Picker */}
                <div className="mt-4 flex justify-center">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="p-2 border border-[#DADADA] rounded-lg text-center"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex flex-wrap gap-3 justify-center">
                  {["None", "15 min", "30 min", "1 hr", "2 hr", "3 hr"].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setArrivalWindowDuration(duration.toLowerCase())}
                      className={`py-2 px-4 rounded-full text-sm font-medium ${
                        arrivalWindowDuration === duration.toLowerCase() 
                          ? 'bg-[#002E3D] text-white' 
                          : 'bg-[#EDEDED] text-[#0C1B1F]'
                      }`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4 text-[#0C1B1F]">Arrival window style</h3>
                
                <div className="space-y-4">
                  <div 
                    className="flex items-center justify-between p-4 rounded-lg border border-[#DADADA]"
                    onClick={() => setArrivalWindowStyle("after")}
                  >
                    <div className="flex items-center">
                      <div className="mr-4 text-[#0C1B1F]">
                        <span className="inline-block w-6 h-6 text-center">↦</span>
                      </div>
                      <div>
                        <p className="font-medium text-[#0C1B1F]">Add window after start time</p>
                        <p className="text-sm text-[#5C6C74]">{formatTimeDisplay(startTime)} – {formatTimeDisplay(calculateEndTime())}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      arrivalWindowStyle === "after" 
                        ? 'border-[#1E6F42] bg-white' 
                        : 'border-[#CCCCCC] bg-white'
                    }`}>
                      {arrivalWindowStyle === "after" && (
                        <div className="w-3 h-3 rounded-full bg-[#1E6F42]" />
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center justify-between p-4 rounded-lg border border-[#DADADA]"
                    onClick={() => setArrivalWindowStyle("center")}
                  >
                    <div className="flex items-center">
                      <div className="mr-4 text-[#0C1B1F]">
                        <span className="inline-block w-6 h-6 text-center">⟷</span>
                      </div>
                      <div>
                        <p className="font-medium text-[#0C1B1F]">Center window on start time</p>
                        <p className="text-sm text-[#5C6C74]">6:00 PM – 7:00 PM</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      arrivalWindowStyle === "center" 
                        ? 'border-[#1E6F42] bg-white' 
                        : 'border-[#CCCCCC] bg-white'
                    }`}>
                      {arrivalWindowStyle === "center" && (
                        <div className="w-3 h-3 rounded-full bg-[#1E6F42]" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <div 
                  className="flex items-center justify-between p-4"
                  onClick={() => setApplyToAllJobs(!applyToAllJobs)}
                >
                  <p className="font-medium text-[#0C1B1F]">Apply to all current and future jobs</p>
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${
                    applyToAllJobs ? 'bg-[#1E6F42]' : 'bg-[#D9D9D9]'
                  }`}>
                    {applyToAllJobs && (
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSaveArrivalWindow}
                className="w-full py-4 bg-[#1E6F42] text-white rounded-xl font-bold text-base mb-4"
              >
                Next
              </button>
              
              <button
                onClick={() => setShowArrivalTimeModal(false)}
                className="w-full py-4 text-[#0C1B1F] font-medium text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default EditJob; 