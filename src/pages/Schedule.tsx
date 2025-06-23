import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar as CalendarIcon, Search, Settings, Plus, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, addMonths, subMonths, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { jobsApi } from '../lib/api/jobs';
import { Job } from '../types/job';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import ViewOptionsModal, { ViewOptionsState } from '../components/schedule/ViewOptionsModal';
import MonthSelector from '../components/Calendar/MonthSelector';
import { AnimatePresence, motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';

// Add an interface for the HTMLDivElement with scrollTimeout
interface DivWithScrollTimeout extends HTMLDivElement {
  scrollTimeout?: number;
}

const Schedule = () => {
  const { t } = useTranslation(['calendar', 'common']);
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewOptionsModalOpen, setIsViewOptionsModalOpen] = useState(false);
  const [weekDirection, setWeekDirection] = useState<'left' | 'right' | null>(null);
  const [animatingWeekChange, setAnimatingWeekChange] = useState(false);
  
  // Ref for week day scroll container
  const weekDaysRef = useRef<HTMLDivElement>(null);
  
  // Touch handling for swipe detection
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // View options state
  const [viewOptions, setViewOptions] = useState<ViewOptionsState>({
    view: 'Day',
    showUnscheduledAppointments: false,
    showWeekends: true,
    selectedTeamMembers: ['1'] // Default to victor leite selected
  });
  
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
  
  // Get week dates for display - show 3 weeks for scrolling (prev, current, next)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const prevWeekStart = subWeeks(weekStart, 1);
  const nextWeekStart = addWeeks(weekStart, 1);
  
  // Create an array with 21 days (3 weeks)
  const allWeekDays = [
    ...Array.from({ length: 7 }, (_, i) => addDays(prevWeekStart, i)),
    ...Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    ...Array.from({ length: 7 }, (_, i) => addDays(nextWeekStart, i))
  ];
  
  // Current week days (for other parts of the app that use this)
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
  const handleDateSelect = (date: Date, index?: number) => {
    setCurrentDate(date);
    
    // If selected day is in prev/next week, update current date for proper week display
    if (index !== undefined) {
      if (index < 7) {
        // Previous week selection
        setWeekDirection('left');
        setCurrentDate(subWeeks(date, 1));
      } else if (index >= 14) {
        // Next week selection
        setWeekDirection('right');
        setCurrentDate(addWeeks(date, 1));
      }
    }
  };

  // Handle week navigation with improved animation
  const navigateWeek = (direction: 'prev' | 'next') => {
    if (animatingWeekChange) return; // Prevent multiple animations at once
    
    setAnimatingWeekChange(true);
    setWeekDirection(direction === 'prev' ? 'left' : 'right');
    
    // First animate visually
    setTimeout(() => {
      // Then update the actual data
      const newDate = direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
      setCurrentDate(newDate);
      setAnimatingWeekChange(false);
    }, 300); // Match this with the animation duration
  };

  // Go to today
  const goToToday = () => {
    // If we're already on today, don't animate
    if (isSameDay(currentDate, new Date())) return;
    
    // Determine which direction to animate based on current date vs today
    const today = new Date();
    const direction = today > currentDate ? 'right' : 'left';
    setWeekDirection(direction);
    setAnimatingWeekChange(true);
    
    // First animate visually
    setTimeout(() => {
      // Then update the actual data
      setCurrentDate(today);
      setAnimatingWeekChange(false);
    }, 300);
  };

  // Handling touch events for swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      navigateWeek('next');
    }
    
    if (isRightSwipe) {
      navigateWeek('prev');
    }
  };

  // Handle wheel event handler for desktop scrolling
  const handleWheel = (e: React.WheelEvent) => {
    // Prevent default browser scroll behavior
    e.preventDefault();
    
    // Check scroll direction
    if (e.deltaX > 50) {
      // Scrolling right (next week)
      navigateWeek('next');
    } else if (e.deltaX < -50) {
      // Scrolling left (previous week)
      navigateWeek('prev');
    }
  };

  // Open view options modal
  const openViewOptionsModal = () => {
    setIsViewOptionsModalOpen(true);
  };

  // Close view options modal
  const closeViewOptionsModal = () => {
    setIsViewOptionsModalOpen(false);
  };

  // Apply view options
  const applyViewOptions = (options: ViewOptionsState) => {
    setViewOptions(options);
  };

  // Render week day selector with the new design
  const renderHorizontalDayScroller = () => {
    return (
      <div className="px-4 pb-4 border-b border-gray-200">
        {/* Month display */}
        <div className="mb-3 text-center">
          <h2 className="text-lg font-medium text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        
        {/* Day/Week/Month headers - Horizontal scrollable area */}
        <div 
          className="overflow-x-auto scrollbar-hide pb-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          ref={weekDaysRef}
        >
          <div className="flex min-w-max">
            {/* Day initials */}
            <div className="grid grid-cols-7 text-center mb-2 min-w-full">
              <div className="text-sm text-gray-700 font-semibold">S</div>
              <div className="text-sm text-gray-700 font-semibold">M</div>
              <div className="text-sm text-gray-700 font-semibold">T</div>
              <div className="text-sm text-gray-700 font-semibold">W</div>
              <div className="text-sm text-gray-700 font-semibold">T</div>
              <div className="text-sm text-gray-700 font-semibold">F</div>
              <div className="text-sm text-gray-700 font-semibold">S</div>
            </div>
          </div>
          
          {/* Day numbers - Horizontally scrollable */}
          <div className="flex min-w-max">
            {allWeekDays.map((day, index) => {
              const isSelected = isSameDay(day, currentDate);
              const isDayToday = isToday(day);
              const dayNumber = format(day, 'd');
              
              return (
                <div key={index} className="flex-1 min-w-[50px] text-center">
                  <button
                    onClick={() => handleDateSelect(day, index)}
                    className="flex flex-col items-center justify-center w-full"
                  >
                    <div 
                      className={`flex items-center justify-center w-10 h-10 rounded-full 
                        ${isSelected 
                          ? 'bg-green-600 text-white' 
                          : isDayToday
                            ? 'border-b-2 border-green-600 text-gray-800'
                            : 'text-gray-800'
                        }
                      `}
                    >
                      <span className={`text-xl font-semibold ${isDayToday && !isSelected ? 'text-green-600' : ''}`}>
                        {dayNumber}
                      </span>
                    </div>
                    {isDayToday && !isSelected && (
                      <div className="w-1 h-1 bg-green-600 rounded-full mt-1"></div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Day View with updated styling
  const renderDayView = () => {
    // Generate hours from 7 AM to 10 PM
    const hours = Array.from({ length: 16 }, (_, i) => i + 7);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate position for current time indicator
    const currentTimePosition = ((currentHour * 60 + currentMinute) - (7 * 60)) / (16 * 60) * 100;
    
    return (
      <div className="flex flex-col h-full">
        {/* User row */}
        <div className="flex items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="text-lg font-semibold text-gray-800">
            {user?.user_metadata?.full_name || 'Joao'}
          </div>
          <div className="ml-auto text-sm font-medium text-gray-500">
            0/1
          </div>
        </div>
        
        {/* Scrollable hours container */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative">
            {/* Current time indicator */}
            {isToday(currentDate) && (
              <div 
                className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                style={{ top: `${currentTimePosition}%` }}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 ml-4"></div>
                <div className="h-0.5 bg-blue-500 flex-1"></div>
              </div>
            )}
            
            {/* Hours */}
            {hours.map((hour) => (
              <div key={hour} className="flex border-t border-gray-200 first:border-t-0">
                {/* Time column */}
                <div className="w-16 py-6 px-2 text-right text-gray-600 font-medium">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                
                {/* Content column */}
                <div className="flex-1 min-h-[80px]">
                  {dayJobs.filter(job => {
                    if (!job.scheduled_date) return false;
                    const jobDate = new Date(job.scheduled_date);
                    return jobDate.getHours() === hour;
                  }).map((job) => (
                    <Link 
                      key={job.id} 
                      to={`/jobs/${job.id}`}
                      className="block bg-blue-100 border-l-4 border-blue-500 p-2 m-1 rounded"
                    >
                      <div className="font-medium text-blue-800">{job.client?.name}</div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(job.scheduled_date), 'h:mm a')}
                      </div>
                      {job.address && (
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.address.split(',')[0]}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render List View with updated styling
  const renderListView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (dayJobs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-[#f8f8f6]">
          <p className="text-gray-600 font-medium">No visits scheduled today</p>
        </div>
      );
    }

    return (
      <div className="bg-[#f8f8f6] p-4 flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold text-gray-800">
            {user?.user_metadata?.full_name || 'Joao'}
          </div>
          <div className="text-sm font-medium text-gray-500">
            {`0/${dayJobs.length}`}
          </div>
        </div>
        
        {dayJobs.map(job => (
          <Link 
            key={job.id} 
            to={`/jobs/${job.id}`}
            className="block bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
          >
            <div className="flex">
              {/* Green vertical line */}
              <div className="w-1.5 bg-green-600 self-stretch"></div>
              
              <div className="p-4 flex-1">
                <h3 className="text-lg font-bold text-gray-900">{job.title || 'Untitled Job'}</h3>
                <p className="text-base text-gray-800 mt-1">{job.client?.name || 'Unknown Client'}</p>
                <p className="text-base text-gray-700 mt-2">
                  {job.scheduled_time 
                    ? `${format(new Date(`2000-01-01T${job.scheduled_time}`), 'h:mm a')} - ${format(new Date(`2000-01-01T${job.scheduled_time}`).setHours(new Date(`2000-01-01T${job.scheduled_time}`).getHours() + 2), 'h:mm a')}`
                    : 'No time specified'}
                </p>
                <p className="text-base text-gray-700 mt-1">{job.address || 'No address'}</p>
                {job.description && (
                  <p className="text-base text-gray-700 mt-2">{job.description}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // Render map view content
  const renderMapView = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    
    // Initialize map when component mounts
    useEffect(() => {
      // Ensure the map container has proper dimensions
      if (mapContainerRef.current) {
        mapContainerRef.current.style.width = '100%';
        mapContainerRef.current.style.height = '100%';
        mapContainerRef.current.style.minHeight = '500px';
      }
      
      // Load Mapbox script if it's not already loaded
      if (!(window as any).mapboxgl) {
        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js';
        script.async = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
        
        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      } else {
        initializeMap();
      }
      
      // Cleanup function
      return () => {
        if ((window as any).map) {
          (window as any).map.remove();
        }
      };
    }, [viewOptions.view === 'Map']);
    
    // Initialize the map
    const initializeMap = () => {
      if (!mapContainerRef.current || mapInitialized) return;
      
      try {
        const mapboxgl = (window as any).mapboxgl;
        if (!mapboxgl) return;
        
        // Define the Mapbox token - using public token (pk) for client-side usage
        const MAPBOX_TOKEN = 'pk.eyJ1IjoianZsZWl0ZTE1MiIsImEiOiJjbWJzbTRyMGgwbXQ1MmtweHFsOXA1aHZsIn0.6mkwBGmb0wnelPMyIjZNpQ';
        mapboxgl.accessToken = MAPBOX_TOKEN;
        
        // Force map container to have proper dimensions
        if (mapContainerRef.current) {
          mapContainerRef.current.style.width = '100%';
          mapContainerRef.current.style.height = '100%';
          mapContainerRef.current.style.minHeight = '500px';
        }
        
        // Initialize the map
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-96.7, 39.8], // Default center (US)
          zoom: 10,
          attributionControl: false,
          preserveDrawingBuffer: true
        });
        
        // Store map instance on window for cleanup
        (window as any).map = map;
        
        // Add map load event handler
        map.on('load', () => {
          console.log('Map loaded successfully');
          setMapInitialized(true);
          
          // Force resize to ensure proper rendering
          setTimeout(() => map.resize(), 0);
          
          // Get user's location and center map
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { longitude, latitude } = position.coords;
                
                // Move map to user's location
                map.flyTo({
                  center: [longitude, latitude],
                  zoom: 12,
                  essential: true
                });
                
                // Add a marker for user's location
                new mapboxgl.Marker({ color: '#3b82f6' })
                  .setLngLat([longitude, latitude])
                  .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<p style="margin: 0; font-weight: 500;">Your Location</p>'))
                  .addTo(map);
                
                // Add markers for jobs
                addJobMarkers(map);
              },
              (error) => {
                console.error('Error getting location:', error);
                // If we can't get user location, just add job markers
                addJobMarkers(map);
              },
              { enableHighAccuracy: true, timeout: 10000 }
            );
          } else {
            // If geolocation is not available, just add job markers
            addJobMarkers(map);
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };
    
    // Add markers for jobs
    const addJobMarkers = async (map: any) => {
      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl || !map) return;
      
      // Filter jobs for the selected day
      const selectedDayJobs = jobs.filter(job => {
        if (!job.scheduled_date) return false;
        return isSameDay(new Date(job.scheduled_date), currentDate);
      });
      
      // Geocode and add markers for each job
      for (const job of selectedDayJobs) {
        if (!job.address) continue;
        
        try {
          // Geocode the address
          const coordinates = await geocodeAddress(job.address);
          if (!coordinates) continue;
          
          // Create popup content
          const popupContent = `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 5px 0; font-weight: 600;">${job.title || 'Untitled Job'}</h3>
              <p style="margin: 0; font-size: 12px;">${job.address}</p>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">
                ${format(new Date(job.scheduled_date), 'h:mm a')}
              </p>
            </div>
          `;
          
          // Create and add the marker
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);
          new mapboxgl.Marker({ color: '#10b981' })
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map);
        } catch (error) {
          console.error('Error adding marker for job:', error);
        }
      }
    };
    
    // Function to geocode addresses to coordinates
    const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
      if (!address) return null;
      
      try {
        // Use Mapbox Geocoding API
        const encodedAddress = encodeURIComponent(address);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${(window as any).mapboxgl.accessToken}`
        );
        
        if (!response.ok) {
          throw new Error(`Geocoding error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          // Return the first result's coordinates [longitude, latitude]
          return data.features[0].center as [number, number];
        }
        
        return null;
      } catch (error) {
        console.error('Error geocoding address:', error);
        return null;
      }
    };
    
    return (
      <div className="flex flex-col h-full" style={{ minHeight: '500px' }}>
        <div className="p-4 bg-white border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {format(currentDate, 'EEEE, MMMM d')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {dayJobs.length} {dayJobs.length === 1 ? 'job' : 'jobs'} scheduled
          </p>
        </div>
        
        <div 
          ref={mapContainerRef} 
          className="flex-1"
          style={{ 
            width: '100%', 
            height: '100%', 
            minHeight: '500px',
            position: 'relative'
          }}
        >
          {!mapInitialized && (
            <div className="absolute inset-0 flex justify-center items-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <AppLayout>
      {/* Page Header with Month Selector */}
      <PageHeader
        title={t('calendar:schedule')}
        rightElement={
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              aria-label="Calendar"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
            <button
              onClick={openViewOptionsModal}
              className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              aria-label={t('calendar:settings')}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* View selector tabs */}
      <div className="px-4 py-2">
        <div className="w-full bg-gray-100 p-1 rounded-full flex">
          {['Day', 'List'].map(view => (
            <button 
              key={view}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
                viewOptions.view === view 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600'
              }`}
              onClick={() => setViewOptions(prev => ({ ...prev, view: view as 'Day' | 'List' }))}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 flex flex-col">
        {/* Render the horizontal day scroller */}
        {renderHorizontalDayScroller()}

        {/* Render the appropriate view based on viewOptions */}
        <div className="flex-1 overflow-y-auto">
          {viewOptions.view === 'Day' && renderDayView()}
          {viewOptions.view === 'List' && renderListView()}
        </div>
      </div>

      {/* View Options Modal */}
      <ViewOptionsModal
        isOpen={isViewOptionsModalOpen}
        onClose={closeViewOptionsModal}
        onApply={applyViewOptions}
        initialOptions={viewOptions}
      />
    </AppLayout>
  );
};

export default Schedule; 