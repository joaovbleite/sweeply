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

// Define the Mapbox token - using public token instead of secret token for client-side usage
const MAPBOX_TOKEN = 'pk.eyJ1IjoianZsZWl0ZTE1MiIsImEiOiJjbWJzbTM5aG8wMTFpMnN0YzF2dmduM3d5In0.40-SMQFHyUf7XSw9YQL-Jw';

const DashboardMap: React.FC<DashboardMapProps> = ({ className = '', jobs = [] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
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
        return;
      }
      
      // Set the access token
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      // Initialize the map
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-96.7, 39.8], // Default center (US)
        zoom: 3.5,
        attributionControl: false
      });
      
      // Add navigation controls
      mapInstance.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false
        }),
        'top-right'
      );
      
      // Add some CSS to ensure map loads correctly
      const mapElement = mapContainer.current;
      if (mapElement) {
        mapElement.style.width = '100%';
        mapElement.style.height = '100%';
        mapElement.style.minHeight = '350px';
      }
      
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            
            // Move map to user's location
            mapInstance.current.flyTo({
              center: [longitude, latitude],
              zoom: 10,
              essential: true
            });
            
            // Add a marker at user's location
            new mapboxgl.Marker({
              element: createCustomMarker('blue')
            })
              .setLngLat([longitude, latitude])
              .addTo(mapInstance.current);
              
            // Force a resize event to ensure map renders correctly
            setTimeout(() => {
              if (mapInstance.current) {
                mapInstance.current.resize();
              }
            }, 100);
          },
          (error) => {
            console.error('Error getting user location:', error);
          },
          { enableHighAccuracy: true }
        );
      }
    };
    
    document.head.appendChild(script);
    
    // Add CSS to ensure proper map display
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .mapboxgl-map {
        width: 100% !important;
        height: 100% !important;
        min-height: 350px !important;
      }
    `;
    document.head.appendChild(styleEl);
    
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
      
      // Remove style element
      if (styleEl.parentNode) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);
  
  // Helper function to create custom markers
  const createCustomMarker = (color: string) => {
    const el = document.createElement('div');
    el.style.width = '15px';
    el.style.height = '15px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = color === 'blue' ? '#3b82f6' : '#ef4444';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    return el;
  };

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-sm border border-gray-100 ${className}`} style={{ height: '350px' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%', minHeight: '350px' }} />
      {!mapInstance.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default DashboardMap; 