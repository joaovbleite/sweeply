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
      className="bg-[#307842] text-white px-4 py-1.5 rounded-lg text-sm font-medium"
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

      <div className="px-4 pt-3 pb-24 flex-1 overflow-y-auto bg-white">
        {/* Title and Description Fields */}
        <div className="space-y-3 mb-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Title"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent text-base"
          />
          
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Description"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent text-base"
            rows={3}
          />
        </div>

        {/* Separator */}
        <div className="w-full h-2 bg-gray-100 -mx-4 px-4 mb-3"></div>
        
        {/* Client Section */}
        <div className="flex items-center justify-between py-3 mb-2">
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-700 mr-2" />
            <h3 className="text-base font-medium text-gray-800">Client</h3>
          </div>
          <button className="text-green-600">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Separator */}
        <div className="w-full h-2 bg-gray-100 -mx-4 px-4 mb-3"></div>

        {/* Schedule Section */}
        <h2 className="text-base text-gray-700 font-medium mb-3">Schedule</h2>
        
        {/* Date Selection */}
        <div className="mb-4 border border-gray-300 rounded-lg p-3 flex items-center">
          <Calendar className="w-5 h-5 text-gray-700 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-gray-800">Date</h3>
            <p className="text-base text-gray-800">Unscheduled</p>
          </div>
        </div>

        {/* Team Section */}
        <div className="flex items-center justify-between py-3 mb-4">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-gray-700 mr-2" />
            <div>
              <h3 className="text-base font-medium text-gray-800">Team</h3>
              <p className="text-base text-gray-800">{selectedTeam}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-green-600" />
        </div>
        
        {/* Save Button (Fixed at bottom) */}
        <div className="fixed bottom-4 left-0 right-0 px-4">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#307842] text-white py-3 rounded-lg font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddTask; 