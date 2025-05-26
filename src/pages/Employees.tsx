import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  DollarSign, 
  Star, 
  Clock, 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  UserCheck,
  UserX,
  UserMinus,
  Briefcase,
  CreditCard,
  FileText,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { employeesApi } from "@/lib/api/employees";
import { Employee, EmployeeFilters, EmployeeStatus, EmployeeRole, EmployeeStats } from "@/types/employee";
import { format, differenceInDays } from "date-fns";
import AppLayout from "@/components/AppLayout";

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<EmployeeFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<EmployeeStats | null>(null);

  // Load employees and stats
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const [employeesData, statsData] = await Promise.all([
        employeesApi.getAll(filters),
        employeesApi.getStats()
      ]);
      setEmployees(employeesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [filters]);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadEmployees();
      return;
    }

    try {
      setLoading(true);
      const data = await employeesApi.search(searchTerm);
      setEmployees(data);
    } catch (error) {
      console.error('Error searching employees:', error);
      toast.error("Failed to search employees");
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (employeeId: string, newStatus: EmployeeStatus) => {
    try {
      const updates: { status: EmployeeStatus; termination_date?: string } = { status: newStatus };
      if (newStatus === 'terminated') {
        updates.termination_date = new Date().toISOString().split('T')[0];
      }
      
      await employeesApi.update(employeeId, updates);
      toast.success(`Employee status updated to ${newStatus.replace('_', ' ')}`);
      loadEmployees();
    } catch (error) {
      console.error('Error updating employee status:', error);
      toast.error("Failed to update employee status");
    }
  };

  // Handle delete
  const handleDelete = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) return;

    try {
      await employeesApi.delete(employeeId);
      toast.success('Employee deleted successfully');
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error("Failed to delete employee");
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: EmployeeStatus) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
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
  const getRoleBadge = (role: EmployeeRole) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
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

  // Filter employees based on search term
  const filteredEmployees = searchTerm 
    ? employees.filter(employee => 
        `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : employees;

  // Calculate days since hire
  const getDaysSinceHire = (hireDate: string) => {
    return differenceInDays(new Date(), new Date(hireDate));
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Team Management</h1>
            <p className="mt-1 text-gray-600">Manage employees, payroll, and performance</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Link
              to="/payroll"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Payroll
            </Link>
            <Link
              to="/performance"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Target className="w-4 h-4" />
              Performance
            </Link>
            <Link
              to="/employees/new"
              className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-green-600">{stats.active} active</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.total_payroll.toFixed(0)}</p>
                  <p className="text-sm text-gray-500">Avg: ${stats.avg_hourly_rate.toFixed(2)}/hr</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avg_performance_rating.toFixed(1)}/5</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= stats.avg_performance_rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hours This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_hours_this_month.toFixed(0)}</p>
                  <p className="text-sm text-gray-500">Across all employees</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search employees by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    status: e.target.value ? [e.target.value as EmployeeStatus] : undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={filters.role?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    role: e.target.value ? [e.target.value as EmployeeRole] : undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                >
                  <option value="">All Roles</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="cleaner">Cleaner</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={filters.department || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    department: e.target.value || undefined
                  }))}
                  placeholder="Department name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({})}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Employees List */}
        <div className="bg-white rounded-xl shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search or filters' : 'Get started by adding your first employee'}
              </p>
              {!searchTerm && (
                <Link
                  to="/employees/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Employee
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Compensation
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => {
                    const daysSinceHire = getDaysSinceHire(employee.hire_date);
                    const performanceRating = getPerformanceRating(employee.current_rating);
                    
                    return (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-pulse-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-pulse-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {employee.first_name} {employee.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {employee.employee_id}
                              </div>
                              <div className="text-xs text-gray-400">
                                Hired {daysSinceHire} days ago
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className={getRoleBadge(employee.role)}>
                              {employee.role.replace('_', ' ')}
                            </span>
                            <br />
                            <span className={getStatusBadge(employee.status)}>
                              {employee.status.replace('_', ' ')}
                            </span>
                            {employee.department && (
                              <div className="text-xs text-gray-500 mt-1">
                                {employee.department}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="w-3 h-3 mr-1 text-gray-400" />
                              {employee.email}
                            </div>
                            {employee.phone && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                {employee.phone}
                              </div>
                            )}
                            {employee.city && employee.state && (
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                {employee.city}, {employee.state}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= performanceRating.stars
                                      ? `${performanceRating.color} fill-current`
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-xs text-gray-500">
                                ({employee.total_jobs_completed} jobs)
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.total_hours_worked.toFixed(0)} hours worked
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              ${employee.hourly_rate}/hr
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.weekly_hours}h/week
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.payroll_frequency.replace('_', ' ')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {employee.status === 'active' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(employee.id, 'on_leave')}
                                  className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded"
                                  title="Put on Leave"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(employee.id, 'inactive')}
                                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                                  title="Deactivate"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {(employee.status === 'inactive' || employee.status === 'on_leave') && (
                              <button
                                onClick={() => handleStatusUpdate(employee.id, 'active')}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                title="Activate"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            <Link
                              to={`/employees/${employee.id}`}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View employee"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/employees/${employee.id}/edit`}
                              className="p-1 text-gray-400 hover:text-pulse-600 transition-colors"
                              title="Edit employee"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(employee.id, `${employee.first_name} ${employee.last_name}`)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete employee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {!loading && filteredEmployees.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredEmployees.length} of {employees.length} employees
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Employees; 
 
 
 
 