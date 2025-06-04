import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar as CalendarIcon, Search, Settings, Plus } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { jobsApi } from '@/lib/api/jobs';
import { Job } from '@/types/job';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

const Schedule = () => {
  const { t } = useTranslation(['calendar', 'common']);
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'day' | 'list' | 'map'>('day');
  const [searchTerm, setSearchTerm] = useState('');
  
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
    const matches = isSameDay(new Date(job.scheduled_date), currentDate);
    
    if (searchTerm && job.client?.name) {
      return matches && job.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return matches;
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
          <button className="flex items-center text-2xl font-bold text-gray-800">
            {format(currentDate, 'MMMM')}
            <ChevronDown className="ml-2 w-6 h-6" />
          </button>
          <div className="flex items-center gap-5">
            <button className="p-2">
              <CalendarIcon className="w-6 h-6 text-gray-800" />
            </button>
            <button className="p-2">
              <Settings className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>
        
        {/* View selector tabs */}
        <div className="bg-gray-100 rounded-lg mx-4 p-1.5 flex">
          <button 
            className={`flex-1 py-3 rounded-md text-center font-medium ${activeView === 'day' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
            onClick={() => setActiveView('day')}
          >
            Day
          </button>
          <button 
            className={`flex-1 py-3 rounded-md text-center font-medium ${activeView === 'list' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
            onClick={() => setActiveView('list')}
          >
            List
          </button>
          <button 
            className={`flex-1 py-3 rounded-md text-center font-medium ${activeView === 'map' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
            onClick={() => setActiveView('map')}
          >
            Map
          </button>
        </div>
        
        {/* Week day selector */}
        <div className="flex justify-between px-4 mt-4 text-center">
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, currentDate);
            
            return (
              <button
                key={index}
                className="flex flex-col items-center"
                onClick={() => handleDateSelect(day)}
              >
                <div className="text-sm text-gray-500 uppercase font-medium">
                  {format(day, 'EEE').charAt(0)}
                </div>
                <div 
                  className={`w-10 h-10 flex items-center justify-center rounded-full mt-1 text-lg
                    ${isSelected ? 'bg-pulse-500 text-white' : isToday ? 'text-pulse-500' : 'text-gray-800'}`}
                >
                  {format(day, 'd')}
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Client filter/search */}
        <div className="mx-4 mt-6 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-gray-800 font-medium text-lg">
                {user ? (user.email?.split('@')[0] || 'All clients') : 'All clients'}
              </span>
            </div>
            <div className="bg-gray-200 rounded-lg px-3 py-1 text-gray-800 font-medium">
              {dayJobs.length} {dayJobs.length === 1 ? 'job' : 'jobs'}
            </div>
          </div>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 bg-white"
            />
          </div>
        </div>
        
        {/* Jobs list */}
        <div className="flex-1 overflow-y-auto pb-20 mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500"></div>
            </div>
          ) : dayJobs.length > 0 ? (
            <div className="px-4">
              {dayJobs.map(job => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="block bg-white rounded-lg shadow mb-3 overflow-hidden"
                >
                  <div className="border-l-4 border-pulse-500 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{job.client?.name || 'Unknown Client'}</h3>
                        <p className="text-sm text-gray-600 mt-1">{job.address || 'No address'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {job.scheduled_time ? format(new Date(`2000-01-01T${job.scheduled_time}`), 'h:mm a') : 'No time'}
                        </div>
                        <div className="text-sm text-pulse-500 font-medium mt-1">
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
              <div className="text-dark-900 mb-4">
                <CalendarIcon className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-gray-700 text-lg mb-2 font-medium">No scheduled appointments</p>
              <Link
                to="/jobs/new"
                className="text-pulse-500 font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Schedule a job
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Schedule; 