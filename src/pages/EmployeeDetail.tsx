import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Star,
  Award,
  Briefcase,
  Shield,
  FileText,
  MoreVertical,
  TrendingUp,
  Target,
  CreditCard
} from "lucide-react";
import { employeesApi } from "@/lib/api/employees";
import { Employee, EmployeeStatus } from "@/types/employee";
import { format, differenceInDays } from "date-fns";
import AppLayout from "@/components/AppLayout";

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id]);

  const loadEmployee = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await employeesApi.getById(id);
      setEmployee(data);
    } catch (error) {
      console.error('Error loading employee:', error);
      toast.error("Failed to load employee details");
      navigate("/employees");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: EmployeeStatus) => {
    if (!employee) return;

    try {
      setActionLoading(true);
      const updates: { status: EmployeeStatus; termination_date?: string } = { status: newStatus };
      if (newStatus === 'terminated') {
        updates.termination_date = new Date().toISOString().split('T')[0];
      }
      
      await employeesApi.update(employee.id, updates);
      toast.success(`Employee status updated to ${newStatus.replace('_', ' ')}`);
      loadEmployee();
    } catch (error) {
      console.error('Error updating employee status:', error);
      toast.error("Failed to update employee status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!employee) return;
    
    const confirmMessage = `Are you sure you want to delete ${employee.first_name} ${employee.last_name}? This action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    try {
      setActionLoading(true);
      await employeesApi.delete(employee.id);
      toast.success('Employee deleted successfully');
      navigate("/employees");
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error("Failed to delete employee");
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: EmployeeStatus) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'on_leave':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'terminated':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get role badge styling
  const getRoleBadge = (role: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (role) {
      case 'manager':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'supervisor':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'cleaner':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'driver':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'admin':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get performance rating display
  const getPerformanceRating = (rating?: string) => {
    if (!rating) return { stars: 0, color: 'text-gray-400' };
    
    const ratingMap = {
      'excellent': { stars: 5, color: 'text-green-500' },
      'good': { stars: 4, color: 'text-blue-500' },
      'satisfactory': { stars: 3, color: 'text-yellow-500' },
      'needs_improvement': { stars: 2, color: 'text-orange-500' },
      'unsatisfactory': { stars: 1, color: 'text-red-500' }
    };
    
    return ratingMap[rating as keyof typeof ratingMap] || { stars: 0, color: 'text-gray-400' };
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!employee) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Employee Not Found</h1>
            <Link
              to="/employees"
              className="text-pulse-600 hover:text-pulse-700 underline"
            >
              Back to Employees
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const daysSinceHire = differenceInDays(new Date(), new Date(employee.hire_date));
  const performanceRating = getPerformanceRating(employee.current_rating);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/employees"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="mt-1 text-gray-600">Employee ID: {employee.employee_id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to={`/employees/${employee.id}/edit`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pulse-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-pulse-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center gap-2">
                    <span className={getStatusBadge(employee.status)}>
                      {employee.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <span className={getRoleBadge(employee.role)}>
                {employee.role.replace('_', ' ')}
              </span>
              {employee.department && (
                <div className="text-sm text-gray-600">
                  Department: {employee.department}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Compensation</p>
                <p className="text-2xl font-bold text-gray-900">${employee.hourly_rate}/hr</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>{employee.weekly_hours} hours/week</p>
              <p className="capitalize">{employee.payroll_frequency.replace('_', ' ')} pay</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Performance</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= performanceRating.stars
                          ? `${performanceRating.color} fill-current`
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>{employee.total_jobs_completed} jobs completed</p>
              <p>{employee.total_hours_worked.toFixed(0)} total hours</p>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-pulse-600" />
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
                
                {employee.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  </div>
                )}

                {employee.date_of_birth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">{format(new Date(employee.date_of_birth), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {(employee.address || employee.city || employee.state) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <div className="font-medium">
                        {employee.address && <p>{employee.address}</p>}
                        {(employee.city || employee.state) && (
                          <p>{employee.city}{employee.city && employee.state && ', '}{employee.state} {employee.zip}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(employee.emergency_contact_name || employee.emergency_contact_phone) && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Emergency Contact</p>
                    {employee.emergency_contact_name && (
                      <p className="text-sm text-gray-600">Name: {employee.emergency_contact_name}</p>
                    )}
                    {employee.emergency_contact_phone && (
                      <p className="text-sm text-gray-600">Phone: {employee.emergency_contact_phone}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-5 h-5 text-pulse-600" />
              <h2 className="text-xl font-semibold text-gray-900">Employment Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Hire Date</p>
                  <p className="font-medium">{format(new Date(employee.hire_date), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-gray-500">{daysSinceHire} days ago</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Weekly Schedule</p>
                  <p className="font-medium">{employee.weekly_hours} hours per week</p>
                  {employee.schedule_notes && (
                    <p className="text-sm text-gray-500 mt-1">{employee.schedule_notes}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium capitalize">{employee.payment_method.replace('_', ' ')}</p>
                </div>

                {employee.termination_date && (
                  <div>
                    <p className="text-sm text-gray-600">Termination Date</p>
                    <p className="font-medium text-red-600">{format(new Date(employee.termination_date), 'MMM d, yyyy')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills and Qualifications */}
          {(employee.skills.length > 0 || employee.certifications.length > 0 || employee.languages.length > 0) && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-pulse-600" />
                <h2 className="text-xl font-semibold text-gray-900">Skills & Qualifications</h2>
              </div>
              
              <div className="space-y-6">
                {employee.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {employee.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {employee.certifications.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {employee.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {employee.languages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {employee.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {employee.notes && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-pulse-600" />
                <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{employee.notes}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={employee.status}
                onChange={(e) => handleStatusUpdate(e.target.value as EmployeeStatus)}
                disabled={actionLoading}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>

              <Link
                to={`/payroll`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                View Payroll
              </Link>

              <Link
                to={`/performance`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
              >
                <Target className="w-4 h-4" />
                Performance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EmployeeDetail; 