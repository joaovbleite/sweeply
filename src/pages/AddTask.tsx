import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Users, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { useLocale } from "@/hooks/useLocale";

const AddTask = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useLocale();
  
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTeam, setSelectedTeam] = useState<string>("Unassigned");

  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.title) {
      toast.error("Task title is required");
      return;
    }

    toast.success("Task created successfully!");
    navigate("/tasks");
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
      className="bg-[#307842] text-white px-5 py-2.5 rounded-xl font-medium"
    >
      Save
    </button>
  );

  return (
    <AppLayout>
      <PageHeader 
        title="New task" 
        onBackClick={() => navigate(-1)}
        rightElement={SaveButton}
      />

      <div className="px-4 pt-7 pb-32 flex-1 overflow-y-auto min-h-screen bg-white">
        {/* Title and Description Fields */}
        <div className="space-y-4 mb-8">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Title"
            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Description"
            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Separator */}
        <div className="w-full h-3 bg-gray-100 -mx-4 px-4 mb-4"></div>
        
        {/* Client Section */}
        <div className="flex items-center justify-between py-5 mb-4">
          <div className="flex items-center">
            <User className="w-6 h-6 text-gray-700 mr-3" />
            <h3 className="text-xl font-medium text-gray-800">Client</h3>
          </div>
          <button className="text-green-600">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Separator */}
        <div className="w-full h-3 bg-gray-100 -mx-4 px-4 mb-4"></div>

        {/* Schedule Section */}
        <h2 className="text-xl text-gray-700 font-medium mb-4">Schedule</h2>
        
        {/* Date Selection */}
        <div className="mb-8 border border-gray-300 rounded-xl p-4 flex items-center">
          <Calendar className="w-6 h-6 text-gray-700 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-800">Date</h3>
            <p className="text-lg text-gray-800">Unscheduled</p>
          </div>
        </div>

        {/* Team Section */}
        <div className="flex items-center justify-between py-5 mb-8">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-gray-700 mr-3" />
            <div>
              <h3 className="text-xl font-medium text-gray-800">Team</h3>
              <p className="text-lg text-gray-800">{selectedTeam}</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-green-600" />
        </div>
      </div>
    </AppLayout>
  );
};

export default AddTask; 