import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, MapPin, Phone, Mail, Plus, ChevronDown, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api/clients";
import { jobsApi } from "@/lib/api/jobs";
import { Client } from "@/types/client";
import { ServiceType, PropertyType } from "@/types/job";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { useLocale } from "@/hooks/useLocale";
import LineItemModal from "@/components/jobs/LineItemModal";

interface LineItem {
  description: string;
  price: number;
  quantity?: number;
}

const AddJob = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useLocale();
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [scheduleForLater, setScheduleForLater] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [remindToInvoice, setRemindToInvoice] = useState(false);
  const [showLineItemModal, setShowLineItemModal] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    clientId: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    jobTitle: "",
    instructions: "",
    salesperson: "victor leite",
    subtotal: 0
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

      // Create job data object
      const jobData = {
        client_id: formData.clientId,
        title: formData.jobTitle,
        description: formData.instructions,
        special_instructions: formData.instructions,
        service_type: 'regular' as ServiceType,
        property_type: 'residential' as PropertyType,
        scheduled_date: scheduledDate,
        estimated_price: formData.subtotal,
        line_items: lineItemsData, // This is custom data that will be stored as JSON
      };

      const createdJob = await jobsApi.create(jobData);

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
      const scheduledDate = selectedDate 
        ? new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            selectedDate
          ).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

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
        service_type: 'regular' as ServiceType,
        property_type: 'residential' as PropertyType,
        scheduled_date: scheduledDate,
        estimated_price: formData.subtotal,
        line_items: lineItemsData, // This is custom data that will be stored as JSON
        status: 'draft' as any // We're adding a custom status that's not in the type
      };

      const createdJob = await jobsApi.create(jobData);

      toast.success("Job saved as draft");
      navigate("/jobs");
    } catch (error) {
      console.error('Error saving job as draft:', error);
      toast.error("Failed to save draft. Please try again.");
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
    <AppLayout>
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
                <option value="victor leite">victor leite</option>
                <option value="john doe">John Doe</option>
                <option value="jane smith">Jane Smith</option>
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
        <h2 className="text-xl text-gray-700 font-medium mb-4">Service</h2>
        
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
            No items added yet. Click the + button to add line items.
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
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-gray-800">Schedule later</h3>
          <div 
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out ${scheduleForLater ? 'bg-blue-600' : 'bg-gray-300'}`}
            onClick={() => setScheduleForLater(!scheduleForLater)}
          >
            <div 
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${scheduleForLater ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-8">
          {/* Month and Year with navigation */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-[#1a2e35]">{formatMonthYear(currentMonth)}</h3>
            <div className="flex space-x-4">
              <button onClick={goToPrevMonth} className="text-blue-600">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={goToNextMonth} className="text-blue-600">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="text-lg font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-4 text-center">
            {generateCalendarDays().map((day, index) => (
              <div key={index} className="relative">
            <button 
                  onClick={() => day.currentMonth && handleDaySelect(day.day)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                    day.currentMonth 
                      ? selectedDate === day.day
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-900'
                      : 'text-gray-500 bg-gray-100'
                  } ${!day.currentMonth && !day.prevMonth ? 'bg-gray-100' : ''}`}
                  disabled={!day.currentMonth}
            >
                  {day.day}
            </button>
              </div>
            ))}
          </div>
        </div>

        {/* Separator with full width */}
        <div className="border-t w-full -mx-4 px-4 mb-4"></div>
          
        {/* Team Section */}
        <div className="flex items-center justify-between py-5 mb-8">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-gray-700 mr-3" />
            <div>
              <h3 className="text-xl font-medium text-gray-800">Team</h3>
              <p className="text-lg text-gray-800">{formData.salesperson}</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </div>

        {/* Separator with full width */}
        <div className="border-t w-full -mx-4 px-4 mb-4"></div>
        
        {/* Invoicing Section */}
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
    </AppLayout>
  );
};

export default AddJob; 
 
 
 
 