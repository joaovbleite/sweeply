import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Repeat, 
  Info,
  CalendarDays,
  CalendarRange,
  Clock
} from "lucide-react";
import { RecurringFrequency } from "@/types/job";
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek } from "date-fns";

interface RecurringJobPatternProps {
  isRecurring: boolean;
  frequency?: RecurringFrequency;
  endDate?: string;
  startDate: string;
  dayOfWeek?: number[];
  dayOfMonth?: number;
  occurrences?: number;
  onChange: (pattern: RecurringPattern) => void;
}

export interface RecurringPattern {
  is_recurring: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_end_date?: string;
  recurring_days_of_week?: number[];
  recurring_day_of_month?: number;
  recurring_occurrences?: number;
  recurring_end_type?: 'never' | 'date' | 'occurrences';
}

const RecurringJobPattern: React.FC<RecurringJobPatternProps> = ({
  isRecurring,
  frequency = 'weekly',
  endDate,
  startDate,
  dayOfWeek = [],
  dayOfMonth = 1,
  occurrences = 10,
  onChange
}) => {
  const [pattern, setPattern] = useState<RecurringPattern>({
    is_recurring: isRecurring,
    recurring_frequency: frequency,
    recurring_end_date: endDate,
    recurring_days_of_week: dayOfWeek,
    recurring_day_of_month: dayOfMonth,
    recurring_occurrences: occurrences,
    recurring_end_type: endDate ? 'date' : 'never'
  });

  const [previewDates, setPreviewDates] = useState<Date[]>([]);

  useEffect(() => {
    onChange(pattern);
    if (pattern.is_recurring && startDate) {
      generatePreviewDates();
    }
  }, [pattern, startDate]);

  const generatePreviewDates = () => {
    const dates: Date[] = [];
    const start = new Date(startDate);
    let currentDate = start;
    let count = 0;
    const maxPreview = 5;

    while (dates.length < maxPreview && count < 100) { // Safety limit
      if (pattern.recurring_frequency === 'weekly') {
        if (pattern.recurring_days_of_week && pattern.recurring_days_of_week.length > 0) {
          // For weekly with specific days
          const weekStart = startOfWeek(currentDate);
          pattern.recurring_days_of_week.forEach(day => {
            const date = addDays(weekStart, day);
            if (date >= start && dates.length < maxPreview) {
              if (shouldIncludeDate(date)) {
                dates.push(date);
              }
            }
          });
          currentDate = addWeeks(currentDate, 1);
        } else {
          // Weekly on the same day
          if (shouldIncludeDate(currentDate)) {
            dates.push(currentDate);
          }
          currentDate = addWeeks(currentDate, 1);
        }
      } else if (pattern.recurring_frequency === 'biweekly') {
        if (shouldIncludeDate(currentDate)) {
          dates.push(currentDate);
        }
        currentDate = addWeeks(currentDate, 2);
      } else if (pattern.recurring_frequency === 'monthly') {
        if (shouldIncludeDate(currentDate)) {
          dates.push(currentDate);
        }
        currentDate = addMonths(currentDate, 1);
      } else if (pattern.recurring_frequency === 'quarterly') {
        if (shouldIncludeDate(currentDate)) {
          dates.push(currentDate);
        }
        currentDate = addMonths(currentDate, 3);
      }
      count++;
    }

    setPreviewDates(dates);
  };

  const shouldIncludeDate = (date: Date): boolean => {
    if (pattern.recurring_end_type === 'date' && pattern.recurring_end_date) {
      return date <= new Date(pattern.recurring_end_date);
    }
    return true;
  };

  const updatePattern = (updates: Partial<RecurringPattern>) => {
    setPattern(prev => ({ ...prev, ...updates }));
  };

  const weekDays = [
    { value: 0, label: 'Sun', short: 'S' },
    { value: 1, label: 'Mon', short: 'M' },
    { value: 2, label: 'Tue', short: 'T' },
    { value: 3, label: 'Wed', short: 'W' },
    { value: 4, label: 'Thu', short: 'T' },
    { value: 5, label: 'Fri', short: 'F' },
    { value: 6, label: 'Sat', short: 'S' }
  ];

  return (
    <div className="space-y-4">
      {/* Enable Recurring */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_recurring"
          checked={pattern.is_recurring}
          onChange={(e) => updatePattern({ is_recurring: e.target.checked })}
          className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
        />
        <label htmlFor="is_recurring" className="ml-2 block text-sm font-medium text-gray-900">
          This is a recurring job
        </label>
      </div>

      {pattern.is_recurring && (
        <div className="pl-6 space-y-4">
          {/* Frequency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat Every
            </label>
            <select
              value={pattern.recurring_frequency}
              onChange={(e) => updatePattern({ 
                recurring_frequency: e.target.value as RecurringFrequency,
                recurring_days_of_week: e.target.value === 'weekly' ? [new Date(startDate).getDay()] : []
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
            >
              <option value="weekly">Week</option>
              <option value="biweekly">2 Weeks</option>
              <option value="monthly">Month</option>
              <option value="quarterly">3 Months (Quarterly)</option>
            </select>
          </div>

          {/* Weekly Day Selection */}
          {pattern.recurring_frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat on
              </label>
              <div className="flex gap-2">
                {weekDays.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => {
                      const days = pattern.recurring_days_of_week || [];
                      if (days.includes(day.value)) {
                        updatePattern({ 
                          recurring_days_of_week: days.filter(d => d !== day.value) 
                        });
                      } else {
                        updatePattern({ 
                          recurring_days_of_week: [...days, day.value].sort() 
                        });
                      }
                    }}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                      pattern.recurring_days_of_week?.includes(day.value)
                        ? 'bg-pulse-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Day Selection */}
          {pattern.recurring_frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Month
              </label>
              <select
                value={pattern.recurring_day_of_month}
                onChange={(e) => updatePattern({ recurring_day_of_month: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* End Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ends
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="never"
                  checked={pattern.recurring_end_type === 'never'}
                  onChange={(e) => updatePattern({ 
                    recurring_end_type: 'never',
                    recurring_end_date: undefined,
                    recurring_occurrences: undefined
                  })}
                  className="h-4 w-4 text-pulse-600 focus:ring-pulse-500"
                />
                <span className="ml-2 text-sm text-gray-700">Never</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  value="date"
                  checked={pattern.recurring_end_type === 'date'}
                  onChange={(e) => updatePattern({ recurring_end_type: 'date' })}
                  className="h-4 w-4 text-pulse-600 focus:ring-pulse-500"
                />
                <span className="ml-2 text-sm text-gray-700">On date</span>
                {pattern.recurring_end_type === 'date' && (
                  <input
                    type="date"
                    value={pattern.recurring_end_date || ''}
                    onChange={(e) => updatePattern({ recurring_end_date: e.target.value })}
                    min={startDate}
                    className="ml-3 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pulse-500"
                  />
                )}
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  value="occurrences"
                  checked={pattern.recurring_end_type === 'occurrences'}
                  onChange={(e) => updatePattern({ recurring_end_type: 'occurrences' })}
                  className="h-4 w-4 text-pulse-600 focus:ring-pulse-500"
                />
                <span className="ml-2 text-sm text-gray-700">After</span>
                {pattern.recurring_end_type === 'occurrences' && (
                  <>
                    <input
                      type="number"
                      value={pattern.recurring_occurrences || 10}
                      onChange={(e) => updatePattern({ recurring_occurrences: parseInt(e.target.value) })}
                      min="1"
                      max="100"
                      className="ml-3 w-16 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pulse-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">occurrences</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Preview</span>
            </div>
            <div className="text-sm text-blue-800">
              {previewDates.length > 0 ? (
                <>
                  <p className="mb-1">Next occurrences:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {previewDates.map((date, index) => (
                      <li key={index}>
                        {format(date, 'EEEE, MMMM d, yyyy')}
                      </li>
                    ))}
                  </ul>
                  {previewDates.length === 5 && (
                    <p className="mt-2 text-blue-600">And more...</p>
                  )}
                </>
              ) : (
                <p>No occurrences scheduled</p>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">About Recurring Jobs</p>
                <p>Recurring jobs will automatically create individual job instances based on your pattern. You can edit or cancel individual occurrences without affecting the entire series.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringJobPattern; 