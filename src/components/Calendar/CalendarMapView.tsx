import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Navigation, 
  Calendar,
  Clock,
  DollarSign,
  User,
  Route,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  ChevronRight,
  Home,
  Target,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Job } from '@/types/job';

interface CalendarMapViewProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  darkMode?: boolean;
}

interface JobMarker {
  job: Job;
  position: { lat: number; lng: number };
}

const CalendarMapView: React.FC<CalendarMapViewProps> = ({
  jobs,
  onJobClick,
  darkMode = false
}) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [mapZoom, setMapZoom] = useState(12);
  const [showRouteOptimization, setShowRouteOptimization] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter jobs for selected date with addresses
  const jobsWithLocation = useMemo(() => {
    return jobs.filter(job => 
      job.address && 
      job.scheduled_date === filterDate
    );
  }, [jobs, filterDate]);

  // Group jobs by location (for now, group by city/area from address)
  const jobMarkers: JobMarker[] = useMemo(() => {
    // In a real implementation, you would geocode addresses to get lat/lng
    // For demo, we'll create random positions
    return jobsWithLocation.map((job, index) => ({
      job,
      position: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1, // NYC area
        lng: -74.0060 + (Math.random() - 0.5) * 0.1
      }
    }));
  }, [jobsWithLocation]);

  // Calculate optimal route order
  const optimizedRoute = useMemo(() => {
    if (!showRouteOptimization || jobMarkers.length <= 1) return jobMarkers;
    
    // Simple nearest neighbor algorithm for demo
    const route: JobMarker[] = [];
    const remaining = [...jobMarkers];
    
    if (remaining.length > 0) {
      route.push(remaining.shift()!);
      
      while (remaining.length > 0) {
        const last = route[route.length - 1];
        let nearestIndex = 0;
        let nearestDistance = Infinity;
        
        remaining.forEach((marker, index) => {
          const distance = Math.sqrt(
            Math.pow(marker.position.lat - last.position.lat, 2) +
            Math.pow(marker.position.lng - last.position.lng, 2)
          );
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });
        
        route.push(remaining.splice(nearestIndex, 1)[0]);
      }
    }
    
    return route;
  }, [jobMarkers, showRouteOptimization]);

  const getServiceTypeColor = (serviceType: string) => {
    const colors = {
      regular: '#3B82F6', // blue
      deep_clean: '#8B5CF6', // purple
      move_in: '#10B981', // green
      move_out: '#F97316', // orange
      post_construction: '#EF4444', // red
      one_time: '#6B7280' // gray
    };
    return colors[serviceType] || '#6B7280';
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-xl overflow-hidden`}>
      {/* Map Header */}
      <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-pulse-500" />
              <h3 className="font-semibold">Job Locations</h3>
            </div>
            
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={`px-3 py-1 text-sm rounded-lg ${
                darkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-100 text-gray-900 border-gray-300'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRouteOptimization(!showRouteOptimization)}
              className={`px-3 py-1 text-sm rounded-lg flex items-center gap-2 ${
                showRouteOptimization
                  ? 'bg-pulse-500 text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Route className="w-4 h-4" />
              Optimize Route
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMapZoom(Math.max(8, mapZoom - 1))}
                className={`p-1 rounded ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm px-2">{mapZoom}</span>
              <button
                onClick={() => setMapZoom(Math.min(18, mapZoom + 1))}
                className={`p-1 rounded ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pulse-500 rounded-full"></div>
            <span>{jobsWithLocation.length} jobs scheduled</span>
          </div>
          {showRouteOptimization && (
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">
                Optimized route saves ~25 min
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[600px]">
        {/* Placeholder Map Background */}
        <div className={`absolute inset-0 ${
          darkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
            : 'bg-gradient-to-br from-blue-50 to-blue-100'
        }`}>
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, ${
                darkMode ? '#fff' : '#000'
              } 40px, ${darkMode ? '#fff' : '#000'} 41px),
                repeating-linear-gradient(90deg, transparent, transparent 40px, ${
                darkMode ? '#fff' : '#000'
              } 40px, ${darkMode ? '#fff' : '#000'} 41px)`
            }}></div>
          </div>

          {/* Map Markers */}
          <div className="relative h-full">
            {optimizedRoute.map((marker, index) => (
              <motion.div
                key={marker.job.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute"
                style={{
                  left: `${(marker.position.lng + 74.0060) * 1000 + 50}%`,
                  top: `${(40.7128 - marker.position.lat) * 1000 + 50}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Route Line */}
                {showRouteOptimization && index > 0 && (
                  <svg
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '200px',
                      height: '200px',
                      pointerEvents: 'none'
                    }}
                  >
                    <line
                      x1="100"
                      y1="100"
                      x2={100 + (optimizedRoute[index - 1].position.lng - marker.position.lng) * 1000}
                      y2={100 - (optimizedRoute[index - 1].position.lat - marker.position.lat) * 1000}
                      stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  </svg>
                )}

                {/* Marker */}
                <button
                  onClick={() => handleJobSelect(marker.job)}
                  className={`relative group ${
                    selectedJob?.id === marker.job.id ? 'z-20' : 'z-10'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg transform transition-all ${
                      selectedJob?.id === marker.job.id ? 'scale-125' : 'group-hover:scale-110'
                    }`}
                    style={{ backgroundColor: getServiceTypeColor(marker.job.service_type) }}
                  >
                    {index + 1}
                  </div>
                  
                  {/* Tooltip */}
                  <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 ${
                    selectedJob?.id === marker.job.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } transition-opacity pointer-events-none`}>
                    <div className={`${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    } rounded-lg shadow-lg p-3 text-sm w-48`}>
                      <div className="font-semibold">{marker.job.client?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {marker.job.scheduled_time && format(new Date(`2000-01-01T${marker.job.scheduled_time}`), 'h:mm a')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {marker.job.address}
                      </div>
                    </div>
                    <div className={`w-2 h-2 ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    } transform rotate-45 -translate-y-1 mx-auto`}></div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Center marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Home className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Job Details Panel */}
        <AnimatePresence>
          {selectedJob && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className={`absolute right-0 top-0 bottom-0 w-80 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-2xl overflow-y-auto`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Job Details</h3>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className={`p-1 rounded ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Client Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Client</span>
                    </div>
                    <div className="font-semibold">{selectedJob.client?.name}</div>
                  </div>

                  {/* Service Type */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Service</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getServiceTypeColor(selectedJob.service_type) }}
                      />
                      <span className="capitalize">
                        {selectedJob.service_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Schedule</span>
                    </div>
                    <div className="text-sm">
                      <div>{format(new Date(selectedJob.scheduled_date), 'MMMM d, yyyy')}</div>
                      {selectedJob.scheduled_time && (
                        <div>{format(new Date(`2000-01-01T${selectedJob.scheduled_time}`), 'h:mm a')}</div>
                      )}
                      {selectedJob.estimated_duration && (
                        <div className="text-gray-500">Duration: {selectedJob.estimated_duration} min</div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <div className="text-sm">{selectedJob.address}</div>
                    <button className="mt-2 text-xs text-pulse-500 hover:text-pulse-600 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      Get Directions
                    </button>
                  </div>

                  {/* Price */}
                  {selectedJob.estimated_price && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Price</span>
                      </div>
                      <div className="text-lg font-semibold">
                        ${selectedJob.estimated_price}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => onJobClick(selectedJob)}
                    className="w-full py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Controls */}
        <div className={`absolute bottom-4 left-4 flex flex-col gap-2`}>
          <button className={`p-2 ${
            darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
          } rounded-lg shadow-lg`}>
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className={`p-2 ${
            darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
          } rounded-lg shadow-lg`}>
            <Target className="w-4 h-4" />
          </button>
          <button className={`p-2 ${
            darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
          } rounded-lg shadow-lg`}>
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className={`absolute top-4 left-4 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow-lg p-3`}>
          <h4 className="text-xs font-semibold mb-2">Service Types</h4>
          <div className="space-y-1">
            {Object.entries({
              regular: 'Regular',
              deep_clean: 'Deep Clean',
              move_in: 'Move-in',
              move_out: 'Move-out',
              post_construction: 'Post-Construction',
              one_time: 'One-time'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getServiceTypeColor(key) }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* No Jobs Message */}
      {jobsWithLocation.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No jobs with locations for this date</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Jobs need addresses to appear on the map
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarMapView; 