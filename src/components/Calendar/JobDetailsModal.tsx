import React, { useState, useEffect } from "react";
import { 
  X, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Calendar,
  Repeat,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Camera,
  FileText,
  Route,
  Timer,
  TrendingUp,
  MessageSquare,
  History,
  Copy,
  Share,
  Download,
  Settings,
  Receipt
} from "lucide-react";
import { Job, ServiceType } from "@/types/job";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onStatusChange: (jobId: string, status: string) => void;
  onDuplicate?: (job: Job) => void;
}

interface JobNote {
  id: string;
  content: string;
  timestamp: string;
  author: string;
  type: 'note' | 'issue' | 'completion';
}

interface JobPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  type: 'before' | 'during' | 'after';
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onDuplicate
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'photos' | 'history'>('details');
  const [notes, setNotes] = useState<JobNote[]>([]);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showRecurringSettings, setShowRecurringSettings] = useState(false);
  const [showMapOptions, setShowMapOptions] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    if (job) {
      setNotes([
        {
          id: '1',
          content: 'Client mentioned they have a new puppy, extra care needed around pet areas.',
          timestamp: '2024-01-15T10:30:00Z',
          author: 'Sarah Johnson',
          type: 'note'
        },
        {
          id: '2',
          content: 'Kitchen deep clean completed. Used eco-friendly products as requested.',
          timestamp: '2024-01-15T14:45:00Z',
          author: 'Mike Chen',
          type: 'completion'
        }
      ]);

      setPhotos([
        {
          id: '1',
          url: '/api/placeholder/300/200',
          caption: 'Kitchen before cleaning',
          timestamp: '2024-01-15T09:00:00Z',
          type: 'before'
        },
        {
          id: '2',
          url: '/api/placeholder/300/200',
          caption: 'Kitchen after deep clean',
          timestamp: '2024-01-15T15:00:00Z',
          type: 'after'
        }
      ]);
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getPriorityLevel = (serviceType: ServiceType) => {
    if (serviceType === 'post_construction' || serviceType === 'move_in') return 'High';
    if (serviceType === 'deep_clean') return 'Medium';
    return 'Low';
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(job.id, newStatus);
    toast.success(`Job status updated to ${newStatus}`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: JobNote = {
      id: Date.now().toString(),
      content: newNote,
      timestamp: new Date().toISOString(),
      author: 'Current User',
      type: 'note'
    };
    
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    toast.success('Note added successfully');
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(job);
      toast.success('Job duplicated successfully');
    }
  };

  const handleShare = () => {
    const jobDetails = `Job: ${job.title}\nClient: ${job.client?.name}\nDate: ${format(new Date(job.scheduled_date), 'PPP')}\nTime: ${job.scheduled_time ? format(parseISO(`2000-01-01T${job.scheduled_time}`), 'p') : 'Not set'}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Job Details - ${job.title}`,
        text: jobDetails
      });
    } else {
      navigator.clipboard.writeText(jobDetails);
      toast.success('Job details copied to clipboard');
    }
  };

  const handleCreateInvoice = () => {
    if (job && job.client) {
      console.log("Creating invoice from job:", job.id, "with client:", job.client_id);
      onClose(); // Close the modal
      navigate(`/invoices/new?client=${job.client_id}&job=${job.id}`);
      toast.success("Opening invoice creation page...");
    } else {
      toast.error("Cannot create invoice: Missing client information");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-pulse-500 to-pulse-600 text-white">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-white bg-opacity-20`}>
              {getStatusIcon(job.status)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-pulse-100 text-sm">
                {format(new Date(job.scheduled_date), 'EEEE, MMMM d, yyyy')}
                {job.scheduled_time && ` at ${format(parseISO(`2000-01-01T${job.scheduled_time}`), 'h:mm a')}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Share job details"
            >
              <Share className="w-5 h-5" />
            </button>
            <button
              onClick={handleDuplicate}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Duplicate job"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'details', label: 'Details', icon: FileText },
            { id: 'notes', label: 'Notes', icon: MessageSquare },
            { id: 'photos', label: 'Photos', icon: Camera },
            { id: 'history', label: 'History', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'details' | 'notes' | 'photos' | 'history')}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-pulse-600 border-b-2 border-pulse-600 bg-pulse-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                    {job.status.replace('_', ' ')}
                  </span>
                  
                  <span className="text-sm text-gray-600">
                    Priority: <span className="font-medium">{getPriorityLevel(job.service_type)}</span>
                  </span>
                  
                  {job.is_recurring && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      <Repeat className="w-3 h-3" />
                      Recurring
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCreateInvoice}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                    title="Create invoice from this job"
                  >
                    <Receipt className="w-3 h-3" />
                    Create Invoice
                  </button>
                  
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  <button
                    onClick={() => onEdit(job)}
                    className="px-3 py-1 text-sm bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                </div>
              </div>

              {/* Job Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Client Information
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{job.client?.name}</p>
                    </div>
                    
                    {job.client?.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${job.client.email}`} className="text-pulse-600 hover:underline">
                            {job.client.email}
                          </a>
                        </p>
                      </div>
                    )}
                    
                    {job.client?.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${job.client.phone}`} className="text-pulse-600 hover:underline">
                            {job.client.phone}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Job Details
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Service Type</label>
                      <p className="text-gray-900 capitalize">{job.service_type.replace('_', ' ')}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Duration</label>
                        <p className="text-gray-900 flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {job.estimated_duration ? `${Math.round(job.estimated_duration / 60 * 10) / 10} hours` : 'Not set'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Price</label>
                        <p className="text-gray-900 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.estimated_price ? `$${job.estimated_price}` : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              {job.address && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5" />
                    Location
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{job.address}</p>
                    <button 
                      onClick={() => {
                        const encodedAddress = encodeURIComponent(job.address);
                        
                        // Check if on mobile device
                        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                        
                        if (isMobile) {
                          // Check if iOS
                          const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                          
                          if (isIOS) {
                            // Show custom modal for iOS
                            setShowMapOptions(true);
                          } else {
                            // Android - Google Maps will open in app if installed
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                          }
                        } else {
                          // Desktop - open in new tab
                          window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                        }
                      }}
                      className="mt-2 text-sm text-pulse-600 hover:underline flex items-center gap-1"
                    >
                      <Route className="w-4 h-4" />
                      Get directions
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {(job.special_instructions || job.access_instructions) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Instructions</h3>
                  <div className="space-y-3">
                    {job.special_instructions && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">Special Instructions</h4>
                        <p className="text-yellow-700">{job.special_instructions}</p>
                      </div>
                    )}
                    
                    {job.access_instructions && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">Access Instructions</h4>
                        <p className="text-blue-700">{job.access_instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Add Note</h3>
                <div className="flex gap-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this job..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{note.author}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          note.type === 'completion' ? 'bg-green-100 text-green-800' :
                          note.type === 'issue' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {note.type}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(note.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              {/* Upload Photos */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-3">Upload photos for this job</p>
                <button className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors">
                  Choose Photos
                </button>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900">{photo.caption}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(photo.timestamp), 'MMM d, h:mm a')} • {photo.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="text-center text-gray-500 py-8">
                <History className="w-8 h-8 mx-auto mb-2" />
                <p>Job history tracking coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between">
            <p className="text-sm text-gray-600">
              Created {job.created_at ? format(new Date(job.created_at), 'PPP') : 'Unknown'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDelete(job.id);
                  onClose();
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Options Modal for iOS */}
      {showMapOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[60] p-4">
          <div className="bg-white rounded-t-xl w-full max-w-md animate-slide-up">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-center text-gray-900">
                Open directions in...
              </h3>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  const encodedAddress = encodeURIComponent(job.address);
                  window.location.href = `maps://?address=${encodedAddress}`;
                  setShowMapOptions(false);
                }}
                className="w-full p-4 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg">Apple Maps</span>
              </button>
              
              <button
                onClick={() => {
                  const encodedAddress = encodeURIComponent(job.address);
                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                  setShowMapOptions(false);
                }}
                className="w-full p-4 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg">Google Maps</span>
              </button>
            </div>
            <div className="p-2 border-t">
              <button
                onClick={() => setShowMapOptions(false)}
                className="w-full p-3 text-center text-blue-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsModal; 
 
 
 
 