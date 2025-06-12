declare module 'react-map-gl' {
  import * as React from 'react';
  
  // Map component
  export interface MapProps {
    mapboxAccessToken?: string;
    mapStyle?: string;
    attributionControl?: boolean;
    dragPan?: boolean;
    dragRotate?: boolean;
    doubleClickZoom?: boolean;
    scrollZoom?: boolean;
    longitude?: number;
    latitude?: number;
    zoom?: number;
    bearing?: number;
    pitch?: number;
    onMove?: (evt: any) => void;
    ref?: React.RefObject<any>;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  // We need to use class component declaration to make TypeScript recognize it as a valid JSX element
  export class Map extends React.Component<MapProps> {}
  
  // Marker component
  export interface MarkerProps {
    longitude: number;
    latitude: number;
    anchor?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export class Marker extends React.Component<MarkerProps> {}
  
  // NavigationControl component
  export interface NavigationControlProps {
    showCompass?: boolean;
    position?: string;
    [key: string]: any;
  }
  
  export class NavigationControl extends React.Component<NavigationControlProps> {}
  
  // GeolocateControl component
  export interface GeolocateControlProps {
    position?: string;
    trackUserLocation?: boolean;
    showUserLocation?: boolean;
    onGeolocate?: (position: {coords: {longitude: number, latitude: number}}) => void;
    [key: string]: any;
  }
  
  export class GeolocateControl extends React.Component<GeolocateControlProps> {}
}

declare module 'mapbox-gl/dist/mapbox-gl.css'; 