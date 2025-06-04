import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar as CalendarIcon, Search, Settings, Plus } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { jobsApi } from '@/lib/api/jobs';
import { Job } from '@/types/job';
import { useTranslation } from 'react-i18next';

const Schedule = () => {
  const { t } = useTranslation(['calendar', 'common']);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'day' | 'list' | 'map'>('day');
  
  // Load jobs data
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await jobsApi.getAllWithInstances();
        setJobs(jobsData);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
  }, []);
  
  // Get week dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Get jobs for the selected day
  const dayJobs = jobs.filter(job => {
    if (!job.scheduled_date) return false;
    return isSameDay(new Date(job.scheduled_date), currentDate);
  });
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
  };
  
  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-gray-50 pt-12">
        {/* Header with month selector */}
        <div className="flex justify-between items-center px-4 py-3">
          <button className="flex items-center text-2xl font-bold">
            {format(currentDate, 'MMMM')}
            <ChevronDown className="ml-2 w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2">
              <CalendarIcon className="w-6 h-6" />
            </button>
            <button className="p-2">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* View selector tabs */}
        <div className="bg-gray-100 rounded-lg mx-4 p-1 flex">
          <button 
            className={`flex-1 py-3 rounded-md text-center ${activeView === 'day' ? 'bg-white shadow' : ''}`}
            onClick={() => setActiveView('day')}
          >
            Day
          </button>
          <button 
            className={`flex-1 py-3 rounded-md text-center ${activeView === 'list' ? 'bg-white shadow' : ''}`}
            onClick={() => setActiveView('list')}
          >
            List
          </button>
          <button 
            className={`flex-1 py-3 rounded-md text-center ${activeView === 'map' ? 'bg-white shadow' : ''}`}
            onClick={() => setActiveView('map')}
          >
            Map
          </button>
        </div>
        
        {/* Week day selector */}
        <div className="flex justify-between px-2 mt-4 text-center">
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, currentDate);
            
            return (
              <button
                key={index}
                className="flex flex-col items-center"
                onClick={() => handleDateSelect(day)}
              >
                <div className="text-sm text-gray-500 uppercase">
                  {format(day, 'EEE').charAt(0)}
                </div>
                <div 
                  className={`w-10 h-10 flex items-center justify-center rounded-full mt-1 text-lg
                    ${isSelected ? 'bg-green-500 text-white' : isToday ? 'text-green-500' : 'text-gray-800'}`}
                >
                  {format(day, 'd')}
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Client filter/search */}
        <div className="mx-4 mt-6 mb-2 flex items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="ml-2 text-gray-500 text-sm">
            {dayJobs.length} {dayJobs.length === 1 ? 'job' : 'jobs'}
          </div>
        </div>
        
        {/* Jobs list */}
        <div className="flex-1 overflow-y-auto pb-20">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : dayJobs.length > 0 ? (
            <div className="px-4">
              {dayJobs.map(job => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="block bg-white rounded-lg shadow mb-3 overflow-hidden"
                >
                  <div className="border-l-4 border-green-500 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{job.client?.name || 'Unknown Client'}</h3>
                        <p className="text-sm text-gray-600 mt-1">{job.address || 'No address'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {job.scheduled_time ? format(new Date(`2000-01-01T${job.scheduled_time}`), 'h:mm a') : 'No time'}
                        </div>
                        <div className="text-sm text-green-600 font-medium mt-1">
                          ${job.estimated_price || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <CalendarIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No scheduled appointments</p>
              <Link
                to="/jobs/new"
                className="text-green-600 font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Schedule a job
              </Link>
            </div>
          )}
        </div>
        
        {/* Floating action button */}
        <div className="fixed bottom-24 right-6">
          <Link
            to="/jobs/new"
            className="bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default Schedule; 