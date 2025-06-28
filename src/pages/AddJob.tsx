import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useBeforeUnload } from "react-router-dom";
import { Search, User, MapPin, Phone, Mail, Plus, ChevronDown, ChevronLeft, ChevronRight, Users, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api/clients";
import { jobsApi } from "@/lib/api/jobs";
import { Client } from "@/types/client";
import { ServiceType, PropertyType, RecurringFrequency } from "@/types/job";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { useLocale } from "@/hooks/useLocale";
import LineItemModal from "@/components/jobs/LineItemModal";
import { teamManagementApi, TeamMember } from "@/lib/api/team-management";
import { serviceTypesApi, ServiceType as CustomServiceType } from "@/lib/api/service-types";
import { RecurringPattern } from "@/components/RecurringJobPattern";

interface LineItem {
  description: string;
  price: number;
  quantity?: number;
}

const AddJob = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formatCurrency } = useLocale();
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [scheduleForLater, setScheduleForLater] = useState(false);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [remindToInvoice, setRemindToInvoice] = useState(false);
  const [showLineItemModal, setShowLineItemModal] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [endTime, setEndTime] = useState<string>("");
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [customServiceTypes, setCustomServiceTypes] = useState<CustomServiceType[]>([]);
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(true);

  const [formData, setFormData] = useState({
    clientId: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    jobTitle: "",
    instructions: "",
    worker: "victor leite",
    subtotal: 0,
    startTime: '',
    endTime: '',
    arrivalWindow: '',
    repeating: 'none',
    service_type: 'regular' as ServiceType,
    property_type: 'residential' as PropertyType,
    custom_service_type_id: '',
    recurring_pattern: {
      is_recurring: false,
      frequency: 'weekly' as RecurringFrequency,
      daysOfWeek: [] as number[],
      endType: 'never' as 'never' | 'date' | 'occurrences',
    } as RecurringPattern,
  });

  // Add new state for arrival time
  const [showArrivalTimeModal, setShowArrivalTimeModal] = useState(false);
  const [arrivalWindowDuration, setArrivalWindowDuration] = useState<string>("1 hr");
  const [arrivalWindowStyle, setArrivalWindowStyle] = useState<"after" | "center">("after");
  const [startTime, setStartTime] = useState(() => {
    // Get current time rounded to the nearest hour or half-hour
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Round to nearest half hour
    let roundedHours = hours;
    if (minutes >= 45) {
      // Round up to next hour
      roundedHours = (hours + 1) % 24;
      return `${roundedHours.toString().padStart(2, '0')}:00`;
    } else if (minutes >= 15 && minutes < 45) {
      // Round to half hour
      return `${hours.toString().padStart(2, '0')}:30`;
    } else {
      // Round down to current hour
      return `${hours.toString().padStart(2, '0')}:00`;
    }
  });
  const [applyToAllJobs, setApplyToAllJobs] = useState(false);

  // Add state to track if form has been modified
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<any>(null);

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

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const members = await teamManagementApi.getActiveTeamMembers();
        setTeamMembers(members);
      } catch (error) {
        console.error('Failed to load team members', error);
      }
    };
    fetchTeamMembers();
  }, []);

  // Load custom service types
  useEffect(() => {
    const loadCustomServiceTypes = async () => {
      try {
        // Get all service types, not just active ones
        const serviceTypes = await serviceTypesApi.getServiceTypes();
        setCustomServiceTypes(serviceTypes);
      } catch (error) {
        console.error('Error loading service types:', error);
      } finally {
        setLoadingServiceTypes(false);
      }
    };

    loadCustomServiceTypes();
  }, []);

  // Initialize form data
  useEffect(() => {
    // Set the initial form data to detect changes later
    const initialData = {
      clientId: "",
      firstName: "",
      lastName: "",
      address: "",
      phone: "",
      email: "",
      jobTitle: "",
      instructions: "",
      worker: "victor leite",
      subtotal: 0,
      startTime: startTime, // Use the rounded time
      endTime: '',
      arrivalWindow: '',
      repeating: 'none',
      service_type: 'regular' as ServiceType,
      property_type: 'residential' as PropertyType,
      custom_service_type_id: '',
      recurring_pattern: {
        is_recurring: false,
        frequency: 'weekly' as RecurringFrequency,
        daysOfWeek: [] as number[],
        endType: 'never' as 'never' | 'date' | 'occurrences',
      } as RecurringPattern,
    };
    
    setFormData(initialData);
    setInitialFormData(initialData);
  }, [startTime]); // Add startTime as a dependency

  // Auto-set end time when start time changes
  useEffect(() => {
    if (startTime) {
      // Calculate end time 1 hour after start time
      const [hours, minutes] = startTime.split(':').map(Number);
      let newHours = (hours + 1) % 24;
      const newEndTime = `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      setEndTime(newEndTime);
      setFormData(prev => ({
        ...prev,
        endTime: newEndTime
      }));
    }
  }, [startTime]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      firstName: client.name.split(' ')[0] || '',
      lastName: client.name.split(' ').slice(1).join(' ') || '',
      address: client.address || '',
      phone: client.phone || '',
      email: client.email || ''
    }));
  };

  // Function to check if form is dirty (modified)
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
      ...prev,
      [field]: value
      };
      setIsFormDirty(true);
      return newData;
    });
  };

  // Handle browser back/refresh with beforeunload event
  useBeforeUnload(
    useCallback((event) => {
      if (isFormDirty) {
        event.preventDefault();
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    }, [isFormDirty])
  );

  // Handle in-app navigation
  useEffect(() => {
    const handleBeforeNavigate = (to: string) => {
      if (isFormDirty) {
        setShowUnsavedModal(true);
        setPendingNavigation(to);
        return false;
      }
      return true;
    };

    // Clean up function to reset form dirty state when component unmounts
    return () => {
      setIsFormDirty(false);
    };
  }, [isFormDirty, navigate]);

  // Function to handle continuing navigation after prompt
  const handleContinueNavigation = () => {
    setIsFormDirty(false);
    setShowUnsavedModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  // Function to cancel navigation and stay on page
  const handleCancelNavigation = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
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

    try {
      setIsSubmitting(true);

      // Format the date for the API (use the first selected date)
      const scheduledDate = selectedDates.length
        ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDates[0]).toISOString().split('T')[0]
        : undefined;

      // Prepare line items data
      const lineItemsData = lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity || 1,
        price: item.price
      }));

      // Create job data object
      const jobData = {
        client_id: formData.clientId,
        title: formData.jobTitle,
        description: formData.instructions,
        special_instructions: formData.instructions,
        service_type: formData.service_type,
        property_type: formData.property_type,
        scheduled_date: scheduledDate,
        estimated_price: formData.subtotal,
        line_items: lineItemsData, // This is custom data that will be stored as JSON
        
        // Add recurring job data if applicable
        is_recurring: formData.recurring_pattern.is_recurring,
        recurring_frequency: formData.recurring_pattern.frequency,
        recurring_days_of_week: formData.recurring_pattern.daysOfWeek,
        recurring_day_of_month: formData.recurring_pattern.dayOfMonth,
        recurring_end_type: formData.recurring_pattern.endType,
        recurring_end_date: formData.recurring_pattern.endDate,
        recurring_occurrences: formData.recurring_pattern.occurrences,
      };

      const createdJob = await jobsApi.create(jobData);

      // Reset form dirty state after successful submission
      setIsFormDirty(false);
      toast.success("Job created successfully!");
      navigate("/jobs");
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error("Failed to create job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    // Similar to handleSubmit but with draft status
    try {
      setIsSubmitting(true);

      // Format the date for the API (use current date if none selected)
      const scheduledDate = selectedDates.length > 0 ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDates[0]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      // Prepare line items data
      const lineItemsData = lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity || 1,
        price: item.price
      }));

      // Create job data object
      const jobData = {
        client_id: formData.clientId || (clients.length > 0 ? clients[0].id : ''),
        title: formData.jobTitle || 'Draft Job',
        description: formData.instructions,
        special_instructions: formData.instructions,
        service_type: formData.service_type,
        property_type: formData.property_type,
        scheduled_date: scheduledDate,
        estimated_price: formData.subtotal,
        line_items: lineItemsData, // This is custom data that will be stored as JSON
        status: 'draft' as any, // We're adding a custom status that's not in the type
        
        // Add recurring job data if applicable
        is_recurring: formData.recurring_pattern.is_recurring,
        recurring_frequency: formData.recurring_pattern.frequency,
        recurring_days_of_week: formData.recurring_pattern.daysOfWeek,
        recurring_day_of_month: formData.recurring_pattern.dayOfMonth,
        recurring_end_type: formData.recurring_pattern.endType,
        recurring_end_date: formData.recurring_pattern.endDate,
        recurring_occurrences: formData.recurring_pattern.occurrences
      };

      const createdJob = await jobsApi.create(jobData);

      // Reset form dirty state after successful draft save
      setIsFormDirty(false);
      toast.success("Draft saved successfully!");
      navigate("/jobs");
    } catch (error) {
      console.error('Error saving job as draft:', error);
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark form as dirty when line items change
  const handleAddLineItem = (item: { description: string; price: number }) => {
    const newLineItems = [...lineItems, { ...item, quantity: 1 }];
    setLineItems(newLineItems);
    
    // Update subtotal
    const newSubtotal = newLineItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    setFormData(prev => {
      const newData = {
      ...prev,
      subtotal: newSubtotal
      };
      setIsFormDirty(true);
      return newData;
    });
  };

  // Mark form as dirty when removing line items
  const handleRemoveLineItem = (index: number) => {
    const newLineItems = [...lineItems];
    newLineItems.splice(index, 1);
    setLineItems(newLineItems);
    
    // Update subtotal
    const newSubtotal = newLineItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    setFormData(prev => {
      const newData = {
      ...prev,
      subtotal: newSubtotal
      };
      setIsFormDirty(true);
      return newData;
    });
  };

  // Mark form as dirty when quantity changes
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
    setFormData(prev => {
      const newData = {
      ...prev,
      subtotal: newSubtotal
      };
      setIsFormDirty(true);
      return newData;
    });
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

  // Update handleDaySelect to toggle days
  const handleDaySelect = (day: number) => {
    setSelectedDates(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Function to format time for display
  const formatTimeDisplay = (time: string) => {
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
      // Simply add the duration to the start time
      newMinutes += durationInMinutes;
      while (newMinutes >= 60) {
        newHours += 1;
        newMinutes -= 60;
      }
      newHours = newHours % 24;
    } else if (arrivalWindowStyle === "center") {
      // For centered window, add half the duration to start time
      // We don't modify the start time here, only calculate the end time
      const halfDuration = Math.floor(durationInMinutes / 2);
      newMinutes = minutes + halfDuration;
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
    // Calculate arrival window based on settings
    let arrivalWindowText = arrivalWindowDuration;
    
    // Set the arrival window in the form data
    setFormData(prev => ({
      ...prev,
      arrivalWindow: arrivalWindowDuration
    }));
    
    // Close the modal
    setShowArrivalTimeModal(false);
  };

  // Directly set arrival window without showing modal
  const handleOpenArrivalTimeModal = () => {
    // Instead of showing the modal, directly set a 1 hr arrival window
    setArrivalWindowDuration("1 hr");
    setFormData(prev => ({
      ...prev,
      arrivalWindow: "1 hr"
    }));
    setIsFormDirty(true);
  };

  // Handle service type selection including custom types
  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    // Clear existing line items when changing service type
    setLineItems([]);
    
    if (!value) {
      // Handle empty selection
      handleInputChange('service_type', 'custom' as ServiceType);
      handleInputChange('custom_service_type_id', '');
      return;
    }
    
    // All service types are now custom (format: "custom_ID")
    if (value.startsWith('custom_')) {
      const serviceTypeId = value.replace('custom_', '');
      const customType = customServiceTypes.find(type => type.id === serviceTypeId);
      
      if (customType) {
        handleInputChange('service_type', 'custom' as ServiceType);
        handleInputChange('custom_service_type_id', serviceTypeId);
        
        // Add a line item for this custom service type
        handleAddLineItem({ 
          description: customType.name, 
          price: customType.default_price 
        });
      }
    }
  };

  // Control body scroll when modal is open
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (showArrivalTimeModal) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      return true;
    };

    // Prevent body scrolling when modal is open
    if (showArrivalTimeModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
      
      // Add event listeners to prevent all scrolling
      document.addEventListener('wheel', handleScroll, { passive: false });
      document.addEventListener('touchmove', handleScroll, { passive: false });
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
      
      // Remove event listeners
      document.removeEventListener('wheel', handleScroll);
      document.removeEventListener('touchmove', handleScroll);
    }
    
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.removeEventListener('wheel', handleScroll);
      document.removeEventListener('touchmove', handleScroll);
    };
  }, [showArrivalTimeModal]);

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

  // Reset form data
  const resetForm = () => {
    setFormData({
      clientId: "",
      firstName: "",
      lastName: "",
      address: "",
      phone: "",
      email: "",
      jobTitle: "",
      instructions: "",
      worker: "victor leite",
      subtotal: 0,
      startTime: '',
      endTime: '',
      arrivalWindow: '',
      repeating: 'none',
      service_type: 'regular',
      property_type: 'residential',
      custom_service_type_id: '',
      recurring_pattern: {
        is_recurring: false,
        frequency: 'weekly' as RecurringFrequency,
        daysOfWeek: [] as number[],
        endType: 'never' as 'never' | 'date' | 'occurrences',
      } as RecurringPattern,
    });
    setSelectedClient(null);
    setSelectedDates([]);
    setLineItems([]);
  };

  // Function to get current day name
  const getCurrentDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    return days[today.getDay()];
  };

  // Handle recurring pattern change
  const handleRecurringPatternChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        recurring_pattern: {
          ...prev.recurring_pattern,
          [field]: value
        }
      };
      
      // If we're setting is_recurring to true, initialize with current day of week
      if (field === 'is_recurring' && value === true) {
        const today = new Date();
        newData.recurring_pattern.daysOfWeek = [today.getDay()];
        newData.recurring_pattern.recurring_days_of_week = [today.getDay()];
      }
      
      setIsFormDirty(true);
      return newData;
    });
  };

  // Handle recurring option selection
  const handleRecurringOptionChange = (option: string) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    if (option === 'none') {
      // One-time job
      handleInputChange('repeating', 'none');
      handleRecurringPatternChange('is_recurring', false);
    } else if (option === 'weekly') {
      // Weekly on current day
      handleInputChange('repeating', 'recurring');
      handleRecurringPatternChange('is_recurring', true);
      handleRecurringPatternChange('frequency', 'weekly');
      handleRecurringPatternChange('daysOfWeek', [dayOfWeek]);
      handleRecurringPatternChange('recurring_days_of_week', [dayOfWeek]);
    } else if (option === 'biweekly') {
      // Biweekly on current day
      handleInputChange('repeating', 'recurring');
      handleRecurringPatternChange('is_recurring', true);
      handleRecurringPatternChange('frequency', 'biweekly');
      handleRecurringPatternChange('daysOfWeek', [dayOfWeek]);
      handleRecurringPatternChange('recurring_days_of_week', [dayOfWeek]);
    } else if (option === 'monthly') {
      // Monthly on same day
      handleInputChange('repeating', 'recurring');
      handleRecurringPatternChange('is_recurring', true);
      handleRecurringPatternChange('frequency', 'monthly');
      handleRecurringPatternChange('dayOfMonth', today.getDate());
      handleRecurringPatternChange('recurring_day_of_month', today.getDate());
    } else if (option === 'quarterly') {
      // Quarterly on same day
      handleInputChange('repeating', 'recurring');
      handleRecurringPatternChange('is_recurring', true);
      handleRecurringPatternChange('frequency', 'quarterly');
      handleRecurringPatternChange('dayOfMonth', today.getDate());
      handleRecurringPatternChange('recurring_day_of_month', today.getDate());
    } else if (option === 'custom') {
      // Custom recurring pattern
      handleInputChange('repeating', 'recurring');
      handleRecurringPatternChange('is_recurring', true);
    }
  };

  return (
    <AppLayout hideBottomNav>
      {/* Page Header with Save button on the right */}
      <PageHeader 
        title="New job" 
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
                value={formData.worker}
                onChange={(e) => handleInputChange('worker', e.target.value)}
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
        
        {/* Service Section (renamed from Product / Service) */}
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
              value={formData.custom_service_type_id ? `custom_${formData.custom_service_type_id}` : ''}
              onChange={handleServiceTypeChange}
              className="w-full p-4 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
              style={{ position: 'relative', zIndex: 10 }}
              disabled={loadingServiceTypes}
            >
              <option value="">Select a service</option>
              {customServiceTypes.map(type => (
                <option key={type.id} value={`custom_${type.id}`}>
                  {type.name} - {formatCurrency(type.default_price)}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {loadingServiceTypes ? (
                <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-700" />
              )}
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
              <option value="other">Other</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-700" />
            </div>
          </div>
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
          </div>
        ) : (
          <div className="mb-4 p-6 bg-gray-50 rounded-lg text-center text-gray-500">
            No services added yet. Click the + button to add services.
          </div>
        )}

        {/* Subtotal Section */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-medium text-gray-800">Subtotal</h3>
          <span className="text-xl text-gray-800">{formatCurrency(formData.subtotal)}</span>
        </div>

        {/* Separator */}
        <div className="w-full h-3 bg-gray-100 -mx-4 px-4 mb-8"></div>
        
        {/* Schedule Section */}
        <h2 className="text-xl text-gray-700 font-medium mb-4">Schedule</h2>
        
        {/* Schedule for later toggle */}
        <div className="mb-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="scheduleForLater"
            checked={scheduleForLater}
            onChange={() => setScheduleForLater(v => !v)}
            className="accent-[#1E6F42] w-5 h-5 rounded"
          />
          <label htmlFor="scheduleForLater" className="text-base font-medium text-gray-700 select-none">Schedule for later</label>
        </div>

        {/* Only show calendar if not scheduling for later */}
        {!scheduleForLater && (
          <div className="mb-4">
        {/* Calendar */}
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
        )}

        {/* Time and Arrival Window Section */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-2 text-[#0C1B1F]">Time</h3>
          <div className="flex flex-col gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Start time</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => setShowStartTimePicker(!showStartTimePicker)}
                >
                  {formatTimeDisplay(startTime)}
                </button>
                {showStartTimePicker && (
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => { setStartTime(e.target.value); setShowStartTimePicker(false); }}
                    onBlur={() => setShowStartTimePicker(false)}
                    className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                    autoFocus
                  />
                )}
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">End time</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                >
                  {formatTimeDisplay(endTime)}
                </button>
                {showEndTimePicker && (
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => { setEndTime(e.target.value); setShowEndTimePicker(false); }}
                    onBlur={() => setShowEndTimePicker(false)}
                    className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                    autoFocus
                  />
                )}
              </div>
            </div>

            {/* Arrival Window */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-600">Arrival window</label>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 focus:outline-none"
                  onClick={handleOpenArrivalTimeModal}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="border border-gray-300 rounded-md py-2 px-3 text-gray-700">
                {formData.startTime && formData.arrivalWindow && formData.arrivalWindow !== "none" && (
                  <span>
                    {formatTimeDisplay(startTime)}
                    {formData.arrivalWindow && formData.arrivalWindow !== "none" && ` (${formData.arrivalWindow} window)`}
                  </span>
                )}
                {(!formData.startTime || !formData.arrivalWindow || formData.arrivalWindow === "none") && (
                  <span className="text-gray-400">Not set</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recurring Job Option - Enhanced */}
        {selectedDates.length === 1 && (
          <div className="mb-8">
            <label className="text-sm text-gray-700 font-medium mb-1 block">Recurring</label>
            <select
              value={formData.repeating === 'none' ? 'none' : 
                     formData.recurring_pattern.frequency === 'weekly' ? 'weekly' :
                     formData.recurring_pattern.frequency === 'biweekly' ? 'biweekly' :
                     formData.recurring_pattern.frequency === 'monthly' ? 'monthly' :
                     formData.recurring_pattern.frequency === 'quarterly' ? 'quarterly' : 'custom'}
              onChange={e => handleRecurringOptionChange(e.target.value)}
              className="w-full p-4 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
            >
              <option value="none">One-time job</option>
              <option value="weekly">Every week on {getCurrentDayName()}</option>
              <option value="biweekly">Every 2 weeks on {getCurrentDayName()}</option>
              <option value="monthly">Every month on day {new Date().getDate()}</option>
              <option value="quarterly">Every 3 months on day {new Date().getDate()}</option>
              <option value="custom">Custom recurring pattern...</option>
            </select>

            {/* Show custom recurring options if custom is selected */}
            {formData.repeating === 'recurring' && formData.recurring_pattern.is_recurring && 
             (formData.recurring_pattern.frequency !== 'weekly' && 
              formData.recurring_pattern.frequency !== 'biweekly' && 
              formData.recurring_pattern.frequency !== 'monthly' && 
              formData.recurring_pattern.frequency !== 'quarterly' || 
              formData.recurring_pattern.daysOfWeek?.length !== 1) && (
              <div className="mt-4">
                {/* This is where we would show the RecurringJobPattern component */}
                <button
                  onClick={() => {
                    // In a real implementation, we would show a modal with the RecurringJobPattern component
                    toast.info("Custom recurring pattern editor would open here");
                  }}
                  className="text-blue-600 text-sm flex items-center"
                >
                  <span>Edit custom recurring pattern</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
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
        
        {/* Draft Button */}
          <button
          onClick={handleSaveAsDraft}
          className="w-full border border-blue-600 text-blue-600 py-4 rounded-xl font-medium mb-20 disabled:opacity-50"
          disabled={isSubmitting}
          >
          {isSubmitting ? 'Saving...' : 'Draft'}
          </button>
      </div>

      {/* Line Item Modal */}
      <LineItemModal 
        isOpen={showLineItemModal}
        onClose={() => setShowLineItemModal(false)}
        onAddItem={handleAddLineItem}
      />

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Unsaved Changes</h2>
            <p className="mb-6">You have unsaved changes. Would you like to save your changes before leaving?</p>
            <div className="flex justify-end gap-4">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={handleCancelNavigation}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={() => {
                  setIsFormDirty(false);
                  handleContinueNavigation();
                }}
              >
                Discard Changes
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => {
                  handleSubmit();
                  setShowUnsavedModal(false);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default AddJob; 
 
 
 
 