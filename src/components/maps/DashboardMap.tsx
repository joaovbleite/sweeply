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

// Define the Mapbox token
const MAPBOX_TOKEN = 'sk.eyJ1IjoianZsZWl0ZTE1MiIsImEiOiJjbWJzbTdycWcwNWl0MmtxMnkzNzJxdGI2In0.1w3Q_bm1TrjXQWkZkOkm0A';

const DashboardMap: React.FC<DashboardMapProps> = ({ className = '' }) => {
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
          },
          (error) => {
            console.error('Error getting user location:', error);
          },
          { enableHighAccuracy: true }
        );
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
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default DashboardMap; 