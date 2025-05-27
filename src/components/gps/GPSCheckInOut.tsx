import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Navigation,
  Timer,
  User,
  MessageSquare,
  X,
  Phone,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { gpsService, LocationCheckResult } from '@/lib/gps-service';
import { checkInsApi, CheckIn } from '@/lib/api/checkins';
import { Job } from '@/types/job';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface GPSCheckInOutProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (status: 'checked_in' | 'checked_out') => void;
}

const GPSCheckInOut: React.FC<GPSCheckInOutProps> = ({
  job,
  isOpen,
  onClose,
  onStatusChange
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [locationResult, setLocationResult] = useState<LocationCheckResult | null>(null);
  const [activeCheckIn, setActiveCheckIn] = useState<CheckIn | null>(null);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [notes, setNotes] = useState('');
  const [completionStatus, setCompletionStatus] = useState<'completed' | 'partial' | 'cancelled'>('completed');
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied'>('checking');

  // Check location permission on mount
  useEffect(() => {
    if (isOpen) {
      checkLocationPermission();
      loadActiveCheckIn();
    }
  }, [isOpen, job.id]);

  // Update elapsed time for active check-ins
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeCheckIn && !activeCheckIn.check_out_time) {
      interval = setInterval(() => {
        const checkInTime = new Date(activeCheckIn.check_in_time);
        const now = new Date();
        const diff = now.getTime() - checkInTime.getTime();
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCheckIn]);

  const checkLocationPermission = async () => {
    try {
      const permission = await gpsService.checkLocationPermission();
      setPermissionStatus(permission === 'granted' ? 'granted' : 'denied');
    } catch (error) {
      setPermissionStatus('denied');
    }
  };

  const loadActiveCheckIn = async () => {
    if (!user?.id) return;
    
    try {
      const activeCheckInData = await checkInsApi.getActiveCheckIn(job.id, user.id);
      setActiveCheckIn(activeCheckInData);
      
      if (activeCheckInData) {
        setCheckInTime(new Date(activeCheckInData.check_in_time));
      }
    } catch (error) {
      console.error('Error loading active check-in:', error);
    }
  };

  const requestLocationPermission = async () => {
    setLoading(true);
    try {
      const granted = await gpsService.requestLocationPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      
      if (granted) {
        toast.success('Location permission granted');
      } else {
        toast.error('Location permission denied');
      }
    } catch (error) {
      setPermissionStatus('denied');
      toast.error('Failed to request location permission');
    } finally {
      setLoading(false);
    }
  };

  const verifyLocation = async () => {
    if (!job.address) {
      toast.error('Job address not available for verification');
      return;
    }

    setLoading(true);
    try {
      const result = await gpsService.verifyLocationForJob(job.address);
      setLocationResult(result);
      
      if (!result.success) {
        toast.error(result.error || 'Location verification failed');
      } else if (!result.withinRange) {
        toast.warning(`You are ${gpsService.formatDistance(result.distance || 0)} away from the job location`);
      } else {
        toast.success('Location verified successfully');
      }
    } catch (error) {
      toast.error('Location verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    if (!locationResult?.coordinates) {
      toast.error('Please verify your location first');
      return;
    }

    if (!locationResult.withinRange) {
      const confirmCheckIn = window.confirm(
        `You are ${gpsService.formatDistance(locationResult.distance || 0)} away from the job location. Are you sure you want to check in?`
      );
      if (!confirmCheckIn) return;
    }

    setLoading(true);
    try {
      const checkInData = {
        jobId: job.id,
        employeeId: user.id,
        location: locationResult.coordinates,
        timestamp: Date.now(),
        address: job.address || 'Unknown address',
        notes: notes.trim() || undefined
      };

      const newCheckIn = await checkInsApi.checkIn(checkInData);
      setActiveCheckIn(newCheckIn);
      setCheckInTime(new Date(newCheckIn.check_in_time));
      setNotes('');
      
      toast.success('Successfully checked in');
      onStatusChange?.('checked_in');
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeCheckIn || !user?.id) {
      toast.error('No active check-in found');
      return;
    }

    if (!locationResult?.coordinates) {
      toast.error('Please verify your location first');
      return;
    }

    setLoading(true);
    try {
      const checkInTime = new Date(activeCheckIn.check_in_time);
      const checkOutTime = Date.now();
      const duration = Math.floor((checkOutTime - checkInTime.getTime()) / (1000 * 60)); // Duration in minutes

      const checkOutData = {
        jobId: job.id,
        employeeId: user.id,
        location: locationResult.coordinates,
        timestamp: checkOutTime,
        checkInId: activeCheckIn.id,
        duration,
        notes: notes.trim() || undefined,
        completionStatus
      };

      await checkInsApi.checkOut(checkOutData);
      setActiveCheckIn(null);
      setCheckInTime(null);
      setElapsedTime('00:00:00');
      setNotes('');
      setLocationResult(null);
      
      toast.success('Successfully checked out');
      onStatusChange?.('checked_out');
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error('Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {activeCheckIn ? 'Check Out' : 'Check In'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Job Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{job.title || job.service_type}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{job.client?.name || 'Unknown Client'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{job.address || 'No address provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(job.scheduled_date), 'MMM d, yyyy')} at {job.scheduled_time || 'TBD'}</span>
              </div>
            </div>
          </div>

          {/* Active Check-in Status */}
          {activeCheckIn && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Currently Checked In</span>
              </div>
              <div className="text-sm text-green-800">
                <p>Started: {format(new Date(activeCheckIn.check_in_time), 'h:mm a')}</p>
                <p className="font-mono text-lg mt-1">Time Elapsed: {elapsedTime}</p>
              </div>
            </div>
          )}

          {/* Location Permission */}
          {permissionStatus === 'checking' && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Checking location permissions...</span>
            </div>
          )}

          {permissionStatus === 'denied' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Location Permission Required</p>
                  <p className="text-sm text-red-700">Please allow location access to use check-in/check-out</p>
                </div>
              </div>
              <button
                onClick={requestLocationPermission}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                Enable Location Access
              </button>
            </div>
          )}

          {/* Location Verification */}
          {permissionStatus === 'granted' && (
            <div className="space-y-4">
              <button
                onClick={verifyLocation}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                Verify Location
              </button>

              {locationResult && (
                <div className={`p-4 rounded-lg border ${
                  locationResult.success
                    ? locationResult.withinRange
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {locationResult.success ? (
                      locationResult.withinRange ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      locationResult.success
                        ? locationResult.withinRange
                          ? 'text-green-900'
                          : 'text-yellow-900'
                        : 'text-red-900'
                    }`}>
                      {locationResult.success
                        ? locationResult.withinRange
                          ? 'Location Verified'
                          : 'Outside Job Location'
                        : 'Location Error'
                      }
                    </span>
                  </div>
                  {locationResult.success && locationResult.distance !== undefined && (
                    <p className={`text-sm ${
                      locationResult.withinRange ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      Distance: {gpsService.formatDistance(locationResult.distance)}
                    </p>
                  )}
                  {!locationResult.success && locationResult.error && (
                    <p className="text-sm text-red-800">{locationResult.error}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeCheckIn ? 'Check-out Notes' : 'Check-in Notes'} (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={activeCheckIn ? 'Any issues or completed work...' : 'Any observations or notes...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Completion Status (for check-out) */}
          {activeCheckIn && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Status
              </label>
              <select
                value={completionStatus}
                onChange={(e) => setCompletionStatus(e.target.value as 'completed' | 'partial' | 'cancelled')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="completed">Completed</option>
                <option value="partial">Partially Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          {locationResult?.success && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={activeCheckIn ? handleCheckOut : handleCheckIn}
                disabled={loading || (!locationResult?.withinRange && !activeCheckIn)}
                className={`flex-1 px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2 ${
                  activeCheckIn
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : activeCheckIn ? (
                  <>
                    <Timer className="w-4 h-4" />
                    Check Out
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Check In
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GPSCheckInOut; 