import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, MapPinned } from 'lucide-react';

// Define the Mapbox token
const MAPBOX_TOKEN = 'sk.eyJ1IjoianZsZWl0ZTE1MiIsImEiOiJjbWJzbTdycWcwNWl0MmtxMnkzNzJxdGI2In0.1w3Q_bm1TrjXQWkZkOkm0A';

interface JobLocation {
  id: string;
  title: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface DashboardMapProps {
  jobs: Array<{
    id: string;
    title: string;
    address?: string;
    scheduled_date: string;
  }>;
  className?: string;
}

const DashboardMap: React.FC<DashboardMapProps> = ({ jobs, className = '' }) => {
  const [viewState, setViewState] = useState({
    longitude: -96.7,        // Center of US by default
    latitude: 39.8,          // Center of US by default
    zoom: 3.5,
    bearing: 0,
    pitch: 0
  });
  
  const [jobLocations, setJobLocations] = useState<JobLocation[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          setViewState(prev => ({
            ...prev,
            longitude,
            latitude,
            zoom: 11 // Zoom closer to user location
          }));
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setIsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  }, []);

  // Function to geocode an address to coordinates
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].center as [number, number];
      }
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  // Geocode job addresses to get coordinates
  useEffect(() => {
    const geocodeJobs = async () => {
      if (!jobs || jobs.length === 0) return;

      // Filter jobs for today
      const today = new Date().toISOString().split('T')[0];
      const todaysJobs = jobs.filter(job => 
        job.scheduled_date === today && job.address
      );

      // Geocode each job's address
      const jobsWithCoordinates: JobLocation[] = [];
      
      for (const job of todaysJobs) {
        if (job.address) {
          const coordinates = await geocodeAddress(job.address);
          if (coordinates) {
            jobsWithCoordinates.push({
              id: job.id,
              title: job.title,
              address: job.address,
              coordinates
            });
          }
        }
      }
      
      setJobLocations(jobsWithCoordinates);
    };

    geocodeJobs();
  }, [jobs]);

  // Handle view state changes - only allow zoom, not panning
  const handleViewStateChange = (newViewState: any) => {
    // Only update zoom, keep the center fixed
    if (userLocation) {
      setViewState({
        ...newViewState,
        longitude: userLocation[0],
        latitude: userLocation[1],
      });
    } else {
      setViewState(newViewState);
    }
  };

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-sm border border-gray-100 ${className}`} style={{ height: '350px' }}>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pulse-600"></div>
        </div>
      ) : (
        <Map
          {...viewState}
          ref={mapRef}
          onMove={evt => handleViewStateChange(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
          dragPan={false}  // Disable panning
          dragRotate={false} // Disable rotation
          doubleClickZoom={true}
          scrollZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl showCompass={false} />
          <GeolocateControl 
            position="top-right"
            trackUserLocation={true}
            showUserLocation={true}
            onGeolocate={(position) => {
              const { longitude, latitude } = position.coords;
              setUserLocation([longitude, latitude]);
            }}
          />

          {/* User's current location */}
          {userLocation && (
            <Marker 
              longitude={userLocation[0]} 
              latitude={userLocation[1]}
              anchor="bottom"
            >
              <div className="relative">
                <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white relative z-10"></div>
              </div>
            </Marker>
          )}

          {/* Job locations */}
          {jobLocations.map((job) => (
            <Marker 
              key={job.id}
              longitude={job.coordinates[0]} 
              latitude={job.coordinates[1]}
              anchor="bottom"
            >
              <div className="flex flex-col items-center">
                <MapPin className="w-8 h-8 text-pulse-600 drop-shadow-md" fill="#f8fafc" />
                <div className="bg-white text-gray-800 px-2 py-1 rounded-md text-xs font-medium shadow-md max-w-[150px] truncate">
                  {job.title}
                </div>
              </div>
            </Marker>
          ))}
        </Map>
      )}
    </div>
  );
};

export default DashboardMap; 