import React, { useState, useEffect } from "react";
import { 
  Calendar,
  Repeat,
  X,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  CalendarX,
  CalendarCheck
} from "lucide-react";
import { Job, JobStatus } from "@/types/job";
import { format } from "date-fns";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";

interface RecurringJobManagerProps {
  parentJobId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const RecurringJobManager: React.FC<RecurringJobManagerProps> = ({
  parentJobId,
  onClose,
  onUpdate
}) => {
  const [instances, setInstances] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstances, setSelectedInstances] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadInstances();
  }, [parentJobId]);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getRecurringInstances(parentJobId);
      setInstances(data);
    } catch (error) {
      console.error('Error loading recurring job instances:', error);
      toast.error("Failed to load recurring job instances");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInstance = (instanceId: string) => {
    setSelectedInstances(prev => {
      const newSet = new Set(prev);
      if (newSet.has(instanceId)) {
        newSet.delete(instanceId);
      } else {
        newSet.add(instanceId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedInstances.size === instances.length) {
      setSelectedInstances(new Set());
    } else {
      setSelectedInstances(new Set(instances.map(instance => instance.id)));
    }
  };

  const handleCancelSelected = async () => {
    if (selectedInstances.size === 0) {
      toast.error("Please select instances to cancel");
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to cancel ${selectedInstances.size} job instance(s)?`
    );
    if (!confirm) return;

    try {
      // Cancel each selected instance
      await Promise.all(
        Array.from(selectedInstances).map(instanceId => 
          jobsApi.updateStatus(instanceId, 'cancelled')
        )
      );
      
      toast.success(`${selectedInstances.size} job(s) cancelled successfully`);
      setSelectedInstances(new Set());
      loadInstances();
      onUpdate();
    } catch (error) {
      console.error('Error cancelling jobs:', error);
      toast.error("Failed to cancel jobs");
    }
  };

  const handleCancelSeries = async () => {
    const confirm = window.confirm(
      "Are you sure you want to cancel the entire recurring series? This will cancel all future instances."
    );
    if (!confirm) return;

    try {
      await jobsApi.cancelRecurringSeries(parentJobId);
      toast.success("Recurring series cancelled successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error cancelling series:', error);
      toast.error("Failed to cancel series");
    }
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'in_progress':
        return <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'in_progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Repeat className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Recurring Series</h2>
              <p className="text-sm text-gray-600">View and manage all instances in this series</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="px-6 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedInstances.size === instances.length && instances.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">
              {selectedInstances.size > 0 
                ? `${selectedInstances.size} selected` 
                : `${instances.length} total instances`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {selectedInstances.size > 0 && (
              <button
                onClick={handleCancelSelected}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <CalendarX className="w-4 h-4" />
                Cancel Selected
              </button>
            )}
            <button
              onClick={handleCancelSeries}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Cancel Entire Series
            </button>
          </div>
        </div>

        {/* Instances List */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading instances...</p>
            </div>
          ) : instances.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No instances found</h3>
              <p className="text-gray-600">This recurring series has no instances yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {instances.map((instance) => (
                <div
                  key={instance.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedInstances.has(instance.id)}
                      onChange={() => handleSelectInstance(instance.id)}
                      className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(instance.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {format(new Date(instance.scheduled_date), 'EEEE, MMMM d, yyyy')}
                            </span>
                            {instance.scheduled_time && (
                              <span className="text-sm text-gray-600">
                                at {instance.scheduled_time}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={getStatusBadge(instance.status)}>
                              {instance.status.replace('_', ' ')}
                            </span>
                            {instance.actual_price && (
                              <span className="text-sm text-gray-600">
                                ${instance.actual_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`/jobs/${instance.id}/edit`, '_blank')}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="px-6 py-4 border-t bg-blue-50">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">About Recurring Jobs</p>
              <p>Changes to individual instances won't affect other instances in the series. Cancelling the entire series will only affect future scheduled instances.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringJobManager; 