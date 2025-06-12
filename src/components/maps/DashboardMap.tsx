import React, { useEffect, useRef } from 'react';
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

    // Load Mapbox GL JS script dynamically
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.async = true;
    
    script.onload = () => {
      if (!mapContainer.current) return;
      
      // Access mapboxgl through the window object
      const mapboxgl = (window as any).mapboxgl;
      
      if (!mapboxgl) {
        console.error('Mapbox GL JS failed to load');
        // Add debug info to the map container
        if (mapContainer.current) {
          const debugInfo = document.createElement('div');
          debugInfo.className = 'map-debug-info';
          debugInfo.textContent = 'Error: Mapbox GL JS failed to load';
          mapContainer.current.appendChild(debugInfo);
        }
        return;
      }

      try {
        // Set the access token
        mapboxgl.accessToken = MAPBOX_TOKEN;
        
        // Initialize the map
        mapInstance.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-96.7, 39.8], // Default center (US)
          zoom: 3.5,
          attributionControl: true
        });
        
        // Add navigation controls
        mapInstance.current.addControl(
          new mapboxgl.NavigationControl({
            showCompass: true
          }),
          'top-right'
        );
        
        // Force map to be visible and responsive
        if (mapContainer.current) {
          mapContainer.current.style.width = '100%';
          mapContainer.current.style.height = '350px';
          mapContainer.current.style.display = 'block';
        }
        
        // Try to get user's location
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
                color: '#3b82f6'
              })
                .setLngLat([longitude, latitude])
                .addTo(mapInstance.current);
                
              // Force a resize after map loads
              setTimeout(() => {
                if (mapInstance.current) {
                  mapInstance.current.resize();
                }
              }, 500);
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
        
        // Add map load event handler
        mapInstance.current.on('load', () => {
          console.log('Map loaded successfully');
          
          // Add debug info when map loads
          if (mapContainer.current) {
            const debugInfo = document.createElement('div');
            debugInfo.className = 'map-debug-info';
            debugInfo.textContent = 'Map loaded successfully';
            mapContainer.current.appendChild(debugInfo);
            
            // Remove the debug info after 3 seconds
            setTimeout(() => {
              if (debugInfo.parentNode) {
                debugInfo.parentNode.removeChild(debugInfo);
              }
            }, 3000);
          }
          
          // Hide loading indicator when map is loaded
          const mapLoading = document.getElementById('map-loading');
          if (mapLoading) mapLoading.style.display = 'none';
        });
        
        // Add map error event handler
        mapInstance.current.on('error', (e: any) => {
          console.error('Map error:', e);
          
          // Add debug info about map error
          if (mapContainer.current) {
            const debugInfo = document.createElement('div');
            debugInfo.className = 'map-debug-info';
            debugInfo.textContent = `Map error: ${e.error?.message || 'Unknown error'}`;
            mapContainer.current.appendChild(debugInfo);
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        
        // Add debug info about initialization error
        if (mapContainer.current) {
          const debugInfo = document.createElement('div');
          debugInfo.className = 'map-debug-info';
          debugInfo.textContent = `Error initializing map: ${(error as Error).message}`;
          mapContainer.current.appendChild(debugInfo);
        }
      }
    };
    
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
      
      // Remove the script if it exists
      const scriptEl = document.querySelector('script[src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"]');
      if (scriptEl) {
        document.head.removeChild(scriptEl);
      }
      
      // Remove debug styles
      if (debugStyles.parentNode) {
        document.head.removeChild(debugStyles);
      }
    };
  }, []);

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-sm border border-gray-100 ${className}`} style={{ height: '350px', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%', minHeight: '350px', position: 'relative' }} />
      {/* Loading indicator */}
      <div id="map-loading" className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardMap; 