declare module 'react-map-gl' {
  import * as React from 'react';
  
  // Map component
  export interface MapProps {
    [key: string]: any;
  }
  
  export const Map: React.FC<MapProps>;
  
  // Marker component
  export interface MarkerProps {
    [key: string]: any;
  }
  
  export const Marker: React.FC<MarkerProps>;
  
  // NavigationControl component
  export interface NavigationControlProps {
    [key: string]: any;
  }
  
  export const NavigationControl: React.FC<NavigationControlProps>;
  
  // GeolocateControl component
  export interface GeolocateControlProps {
    [key: string]: any;
  }
  
  export const GeolocateControl: React.FC<GeolocateControlProps>;
}

declare module 'mapbox-gl/dist/mapbox-gl.css'; 