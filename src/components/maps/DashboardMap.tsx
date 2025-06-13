import React, { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Import mapbox-gl as a regular JS import (not as a React component)
// We'll access it directly through the window object
interface DashboardMapProps {
  jobs: Array<{
    id: string;
    title: string;
    address?: string;
    scheduled_date: string;
  }>;
  className?: string;
}

// Define the Mapbox token - using public token (pk) for client-side usage
const MAPBOX_TOKEN = 'pk.eyJ1IjoianZsZWl0ZTE1MiIsImEiOiJjbWJzbTRyMGgwbXQ1MmtweHFsOXA1aHZsIn0.6mkwBGmb0wnelPMyIjZNpQ';

const DashboardMap: React.FC<DashboardMapProps> = ({ className = '', jobs = [] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [geocodedJobs, setGeocodedJobs] = useState<Array<any>>([]);
  const [isMapInitialized, setIsMapInitialized] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // Function to geocode addresses to coordinates
  const geocodeAddress = async (address: string) => {
    if (!address) return null;
    
    try {
      // Use Mapbox Geocoding API
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Return the first result's coordinates [longitude, latitude]
        return data.features[0].center;
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  // Effect to geocode job addresses
  useEffect(() => {
    const geocodeJobs = async () => {
      if (!jobs.length) return;
      
      const geocodedResults = await Promise.all(
        jobs.map(async (job) => {
          if (!job.address) return { ...job, coordinates: null };
          
          const coordinates = await geocodeAddress(job.address);
          return { ...job, coordinates };
        })
      );
      
      setGeocodedJobs(geocodedResults.filter(job => job.coordinates !== null));
    };
    
    geocodeJobs();
  }, [jobs]);

  // Helper to get the next job (today's job with the earliest time)
  const getNextJob = () => {
    if (!geocodedJobs.length) return null;
    // Filter jobs for today
    const today = new Date();
    const todayJobs = geocodedJobs.filter(job => {
      const jobDate = new Date(job.scheduled_date);
      return (
        jobDate.getFullYear() === today.getFullYear() &&
        jobDate.getMonth() === today.getMonth() &&
        jobDate.getDate() === today.getDate()
      );
    });
    if (!todayJobs.length) return null;
    // Sort by time if available, otherwise just pick the first
    return todayJobs[0];
  };

  // Effect to add job markers and center map
  useEffect(() => {
    if (!isMapInitialized || !mapInstance.current || !isMapLoaded) return;
    const mapboxgl = (window as any).mapboxgl;
    try {
      // Remove all existing markers
      if (mapInstance.current._markers) {
        mapInstance.current._markers.forEach((m: any) => m.remove());
      }
      mapInstance.current._markers = [];
      // Add markers for each geocoded job
      geocodedJobs.forEach(job => {
        if (!job.coordinates) return;
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 5px 0; font-weight: 600;">${job.title}</h3>
              <p style="margin: 0; font-size: 12px;">${job.address}</p>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">
                ${new Date(job.scheduled_date).toLocaleDateString()}
              </p>
            </div>
          `);
        const marker = new mapboxgl.Marker({ color: '#10b981' })
          .setLngLat(job.coordinates)
          .setPopup(popup)
          .addTo(mapInstance.current);
        mapInstance.current._markers.push(marker);
      });
      // Center logic
      const nextJob = getNextJob();
      if (nextJob && nextJob.coordinates) {
        mapInstance.current.flyTo({ center: nextJob.coordinates, zoom: 14, essential: true });
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            mapInstance.current.flyTo({ center: [longitude, latitude], zoom: 14, essential: true });
            // Add a marker for user's location
            const userMarker = new mapboxgl.Marker({ color: '#3b82f6' })
              .setLngLat([longitude, latitude])
              .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<p style="margin: 0; font-weight: 500;">Your Location</p>'))
              .addTo(mapInstance.current);
            mapInstance.current._markers.push(userMarker);
          },
          (error) => {},
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    } catch (error) {
      setMapError('Failed to add markers to map');
    }
  }, [isMapInitialized, geocodedJobs, isMapLoaded]);

  useEffect(() => {
    // Define inline styles for debug purposes
    const debugStyles = document.createElement('style');
    debugStyles.textContent = `
      .map-debug-info {
        position: absolute;
        bottom: 5px;
        left: 5px;
        background: rgba(255,255,255,0.8);
        padding: 5px;
        border-radius: 4px;
        font-size: 10px;
        z-index: 999;
      }
    `;
    document.head.appendChild(debugStyles);

    // Initialize the map
    const initializeMap = () => {
      if (!mapContainer.current) return;
      
      try {
        // Access mapboxgl through the window object
        const mapboxgl = (window as any).mapboxgl;
        
        if (!mapboxgl) {
          console.error('Mapbox GL JS failed to load');
          setMapError('Mapbox GL JS failed to load');
          return;
        }

        // Set the access token
        mapboxgl.accessToken = MAPBOX_TOKEN;
        
        // Initialize the map
        mapInstance.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-96.7, 39.8], // Default center (US)
          zoom: 3.5,
          attributionControl: false,
          preserveDrawingBuffer: true,
          antialias: true,
          dragPan: true,
          dragRotate: false,
          touchZoomRotate: true,
          doubleClickZoom: true,
          scrollZoom: true,
          boxZoom: true,
          keyboard: false
        });
        
        // Force map to be visible and responsive
        if (mapContainer.current) {
          mapContainer.current.style.width = '100%';
          mapContainer.current.style.height = '350px';
          mapContainer.current.style.display = 'block';
        }
        
        // Add map load event handler
        mapInstance.current.on('load', () => {
          console.log('Map loaded successfully');
          
          // Hide loading indicator when map is loaded
          const mapLoading = document.getElementById('map-loading');
          if (mapLoading) mapLoading.style.display = 'none';
          
          // Set map as initialized so we can add job markers
          setIsMapInitialized(true);
          setIsMapLoaded(true);
          
          // Force a resize to ensure the map renders correctly
          setTimeout(() => {
            if (mapInstance.current) {
              mapInstance.current.resize();
            }
          }, 200);
          
          // Try to get user's location after map is loaded
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { longitude, latitude } = position.coords;
                
                // Move map to user's location
                mapInstance.current.flyTo({
                  center: [longitude, latitude],
                  zoom: 12,
                  essential: true
                });
                
                // Add a marker at user's location
                new mapboxgl.Marker({
                  color: '#3b82f6' // Blue for user's location
                })
                  .setLngLat([longitude, latitude])
                  .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<p style="margin: 0; font-weight: 500;">Your Location</p>'))
                  .addTo(mapInstance.current);
              },
              (error) => {
                console.error('Error getting user location:', error);
                // Add debug info about geolocation error
                if (mapContainer.current) {
                  const debugInfo = document.createElement('div');
                  debugInfo.className = 'map-debug-info';
                  debugInfo.textContent = `Geolocation error: ${error.message}`;
                  mapContainer.current.appendChild(debugInfo);
                }
              },
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }
        });
        
        // Add map error event handler
        mapInstance.current.on('error', (e: any) => {
          console.error('Map error:', e);
          setMapError(`Map error: ${e.error?.message || 'Unknown error'}`);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(`Error initializing map: ${(error as Error).message}`);
      }
    };

    // Load Mapbox GL JS script dynamically
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.async = true;
    script.onload = initializeMap;
    script.onerror = () => {
      console.error('Failed to load Mapbox GL JS script');
      setMapError('Failed to load Mapbox GL JS script');
    };
    
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
      
      // Remove the script if it exists
      const scriptEl = document.querySelector('script[src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"]');
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
      
      // Remove debug styles
      if (debugStyles.parentNode) {
        document.head.removeChild(debugStyles);
      }
    };
  }, []);

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-sm border border-gray-100 ${className}`}>
      {/* Map container */}
      <div 
        ref={mapContainer} 
        className="w-full h-[350px] bg-gray-100"
        style={{ touchAction: 'pan-x pan-y' }} // Improve touch handling
      />
      
      {/* Loading indicator */}
      <div 
        id="map-loading"
        className="absolute inset-0 bg-gray-50 bg-opacity-80 flex items-center justify-center"
      >
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
      
      {/* Error message */}
      {mapError && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-500 font-medium mb-2">Map Error</p>
            <p className="text-sm text-gray-600">{mapError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded-md"
            >
              Reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMap; 