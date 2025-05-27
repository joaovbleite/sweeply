export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface LocationCheckResult {
  success: boolean;
  distance?: number;
  coordinates?: LocationCoordinates;
  error?: string;
  withinRange: boolean;
}

export interface CheckInData {
  jobId: string;
  employeeId: string;
  location: LocationCoordinates;
  timestamp: number;
  address: string;
  notes?: string;
}

export interface CheckOutData {
  jobId: string;
  employeeId: string;
  location: LocationCoordinates;
  timestamp: number;
  checkInId: string;
  duration: number;
  notes?: string;
  completionStatus: 'completed' | 'partial' | 'cancelled';
}

class GPSService {
  private readonly LOCATION_TIMEOUT = 15000; // 15 seconds
  private readonly MAX_AGE = 60000; // 1 minute
  private readonly ACCEPTABLE_DISTANCE = 100; // 100 meters

  /**
   * Get current location using browser's geolocation API
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: this.LOCATION_TIMEOUT,
        maximumAge: this.MAX_AGE
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          });
        },
        (error) => {
          let errorMessage = 'Unknown location error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      // Using OpenStreetMap Nominatim API (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Verify if current location is within acceptable range of job address
   */
  async verifyLocationForJob(jobAddress: string): Promise<LocationCheckResult> {
    try {
      // Get current location
      const currentLocation = await this.getCurrentLocation();

      // Geocode job address
      const jobCoordinates = await this.geocodeAddress(jobAddress);
      
      if (!jobCoordinates) {
        return {
          success: false,
          error: 'Unable to locate job address',
          withinRange: false,
          coordinates: currentLocation
        };
      }

      // Calculate distance
      const distance = this.calculateDistance(currentLocation, jobCoordinates);
      const withinRange = distance <= this.ACCEPTABLE_DISTANCE;

      return {
        success: true,
        distance,
        coordinates: currentLocation,
        withinRange
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Location verification failed',
        withinRange: false
      };
    }
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }

  /**
   * Check if location permissions are granted
   */
  async checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!navigator.permissions) {
      return 'prompt';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      return 'prompt';
    }
  }

  /**
   * Request location permission
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      await this.getCurrentLocation();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start watching location for continuous tracking
   */
  watchLocation(
    onLocationUpdate: (location: LocationCoordinates) => void,
    onError: (error: string) => void
  ): number | null {
    if (!navigator.geolocation) {
      onError('Geolocation not supported');
      return null;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: this.LOCATION_TIMEOUT,
      maximumAge: 30000 // 30 seconds for watch
    };

    return navigator.geolocation.watchPosition(
      (position) => {
        onLocationUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        });
      },
      (error) => {
        let errorMessage = 'Location tracking error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location timeout';
            break;
        }
        onError(errorMessage);
      },
      options
    );
  }

  /**
   * Stop watching location
   */
  stopWatchingLocation(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }
}

export const gpsService = new GPSService(); 