import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Repeat, X } from 'lucide-react';

export interface RecurringPattern {
  is_recurring: boolean;
  
  // Frontend fields (these will be mapped to database fields)
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number; // 1-31 for monthly
  endType?: 'never' | 'date' | 'occurrences';
  endDate?: string;
  occurrences?: number;
  
  // Database fields (these are the actual fields stored in Supabase)
  recurring_frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  recurring_days_of_week?: number[];
  recurring_day_of_month?: number;
  recurring_end_type?: 'never' | 'date' | 'occurrences';
  recurring_end_date?: string;
  recurring_occurrences?: number;
}

interface RecurringJobPatternProps {
  pattern: RecurringPattern;
  onChange: (pattern: RecurringPattern) => void;
  startDate: string;
  isRecurring?: boolean;
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  endDate?: string;
}

const RecurringJobPattern: React.FC<RecurringJobPatternProps> = ({
  pattern,
  onChange,
  startDate,
  isRecurring,
  frequency,
  endDate
}) => {
  const [preview, setPreview] = useState<string[]>([]);

  // Use props or pattern properties
  const currentFrequency = frequency || pattern.frequency || pattern.recurring_frequency || 'weekly';
  const currentIsRecurring = isRecurring !== undefined ? isRecurring : pattern.is_recurring;
  const currentEndDate = endDate || pattern.endDate || pattern.recurring_end_date;

  // Generate preview of next occurrences
  useEffect(() => {
    if (!currentIsRecurring) {
      setPreview([]);
      return;
    }

    const generatePreview = () => {
      const dates: string[] = [];
      const start = new Date(startDate);
      let current = new Date(start);
      let count = 0;
      const maxPreview = 5;

      while (dates.length < maxPreview && count < 100) {
        if (shouldCreateInstance(current)) {
          dates.push(current.toISOString().split('T')[0]);
        }

        // Move to next potential date
        switch (currentFrequency) {
          case 'weekly':
            current.setDate(current.getDate() + 7);
            break;
          case 'biweekly':
            current.setDate(current.getDate() + 14);
            break;
          case 'monthly':
            current.setMonth(current.getMonth() + 1);
            break;
          case 'quarterly':
            current.setMonth(current.getMonth() + 3);
            break;
        }
        count++;
      }

      setPreview(dates);
    };

    const shouldCreateInstance = (date: Date): boolean => {
      // Check end conditions
      if (pattern.endType === 'date' && currentEndDate && date > new Date(currentEndDate)) {
        return false;
      }

      // For weekly with specific days
      if (currentFrequency === 'weekly' && (pattern.daysOfWeek?.length || pattern.recurring_days_of_week?.length)) {
        const daysOfWeek = pattern.daysOfWeek || pattern.recurring_days_of_week || [];
        return daysOfWeek.includes(date.getDay());
      }

      // For monthly with specific day
      if (currentFrequency === 'monthly' && (pattern.dayOfMonth || pattern.recurring_day_of_month)) {
        const dayOfMonth = pattern.dayOfMonth || pattern.recurring_day_of_month;
        return date.getDate() === dayOfMonth;
      }

      return true;
    };

    generatePreview();
  }, [pattern, startDate, currentFrequency, currentIsRecurring, currentEndDate]);

  const handleFrequencyChange = (frequency: RecurringPattern['frequency']) => {
    const today = new Date(startDate);
    onChange({
      ...pattern,
      // Frontend fields
      frequency,
      daysOfWeek: frequency === 'weekly' ? [today.getDay()] : undefined,
      dayOfMonth: frequency === 'monthly' ? today.getDate() : undefined,
      
      // Database fields (matched to frontend fields)
      recurring_frequency: frequency,
      recurring_days_of_week: frequency === 'weekly' ? [today.getDay()] : undefined,
      recurring_day_of_month: frequency === 'monthly' ? today.getDate() : undefined,
    });
  };

  const handleDaysOfWeekChange = (day: number, checked: boolean) => {
    const currentDays = pattern.daysOfWeek || pattern.recurring_days_of_week || [];
    const newDays = checked
      ? [...currentDays, day].sort()
      : currentDays.filter(d => d !== day);
    
    onChange({
      ...pattern,
      // Update both frontend and database fields
      daysOfWeek: newDays.length > 0 ? newDays : undefined,
      recurring_days_of_week: newDays.length > 0 ? newDays : undefined
    });
  };

  const handleDayOfMonthChange = (day: number) => {
    onChange({
      ...pattern,
      // Update both frontend and database fields
      dayOfMonth: day,
      recurring_day_of_month: day
    });
  };

  const handleEndTypeChange = (endType: RecurringPattern['endType']) => {
    // Setup default values
    let endDate = pattern.endDate || pattern.recurring_end_date;
    let occurrences = pattern.occurrences || pattern.recurring_occurrences || 10;
    
    // If we don't have an end date and the endType is 'date', set a default
    if (endType === 'date' && !endDate) {
      const defaultEndDate = new Date(startDate);
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 3); // Default to 3 months
      endDate = defaultEndDate.toISOString().split('T')[0];
    }
    
    onChange({
      ...pattern,
      // Update both frontend and database fields
      endType,
      recurring_end_type: endType,
      // Set values based on end type
      endDate: endType === 'date' ? endDate : undefined,
      recurring_end_date: endType === 'date' ? endDate : undefined,
      occurrences: endType === 'occurrences' ? occurrences : undefined,
      recurring_occurrences: endType === 'occurrences' ? occurrences : undefined
    });
  };

  const handleEndDateChange = (date: string) => {
    onChange({
      ...pattern,
      // Update both frontend and database fields
      endDate: date,
      recurring_end_date: date
    });
  };

  const handleOccurrencesChange = (occurrences: number) => {
    onChange({
      ...pattern,
      // Update both frontend and database fields
      occurrences,
      recurring_occurrences: occurrences
    });
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!currentIsRecurring) {
    return null;
  }

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-2">
        <Repeat className="w-5 h-5 text-pulse-600" />
        <h3 className="text-lg font-medium text-gray-900">Recurring Pattern</h3>
      </div>

      {/* Frequency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Repeat every
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'weekly', label: 'Week' },
            { value: 'biweekly', label: '2 Weeks' },
            { value: 'monthly', label: 'Month' },
            { value: 'quarterly', label: '3 Months' }
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleFrequencyChange(value as RecurringPattern['frequency'])}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                currentFrequency === value
                  ? 'bg-pulse-500 text-white border-pulse-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Days Selection */}
      {currentFrequency === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            On these days
          </label>
          <div className="flex gap-1">
            {dayNames.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDaysOfWeekChange(index, !(pattern.daysOfWeek?.includes(index) || pattern.recurring_days_of_week?.includes(index)))}
                className={`w-10 h-10 text-xs rounded-full border transition-colors ${
                  (pattern.daysOfWeek?.includes(index) || pattern.recurring_days_of_week?.includes(index))
                    ? 'bg-pulse-500 text-white border-pulse-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Day Selection */}
      {currentFrequency === 'monthly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            On day of month
          </label>
          <input
            type="number"
            min="1"
            max="31"
            value={(pattern.dayOfMonth || pattern.recurring_day_of_month) || ''}
            onChange={(e) => handleDayOfMonthChange(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
            placeholder="Day"
          />
        </div>
      )}

      {/* End Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ends
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="endType"
              value="never"
              checked={(pattern.endType || pattern.recurring_end_type) === 'never'}
              onChange={() => handleEndTypeChange('never')}
              className="text-pulse-500 focus:ring-pulse-500"
            />
            <span className="text-sm text-gray-700">Never</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="endType"
              value="date"
              checked={(pattern.endType || pattern.recurring_end_type) === 'date'}
              onChange={() => handleEndTypeChange('date')}
              className="text-pulse-500 focus:ring-pulse-500"
            />
            <span className="text-sm text-gray-700">On date</span>
            {(pattern.endType || pattern.recurring_end_type) === 'date' && (
              <input
                type="date"
                value={currentEndDate || ''}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pulse-500"
              />
            )}
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="endType"
              value="occurrences"
              checked={(pattern.endType || pattern.recurring_end_type) === 'occurrences'}
              onChange={() => handleEndTypeChange('occurrences')}
              className="text-pulse-500 focus:ring-pulse-500"
            />
            <span className="text-sm text-gray-700">After</span>
            {(pattern.endType || pattern.recurring_end_type) === 'occurrences' && (
              <>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={(pattern.occurrences || pattern.recurring_occurrences) || ''}
                  onChange={(e) => handleOccurrencesChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pulse-500"
                />
                <span className="text-sm text-gray-700">occurrences</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Next {preview.length} occurrences
          </label>
          <div className="space-y-1">
            {preview.map((date, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringJobPattern; 