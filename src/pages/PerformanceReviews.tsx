import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Calendar, 
  User,
  TrendingUp,
  FileText,
  Eye,
  Edit,
  Award,
  Target,
  Clock,
  Download,
  BarChart3
} from "lucide-react";
import { employeesApi } from "@/lib/api/employees";
import { PerformanceReview, Employee, PerformanceRating } from "@/types/employee";
import { format, differenceInDays } from "date-fns";
import AppLayout from "@/components/AppLayout";

const PerformanceReviews = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [showAddReview, setShowAddReview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsData, employeesData] = await Promise.all([
        employeesApi.getPerformanceReviews(),
        employeesApi.getAll({ status: ['active', 'inactive'] })
      ]);
      setReviews(reviewsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast.error("Failed to load performance reviews");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeReviews = async (employeeId: string) => {
    try {
      setLoading(true);
      const data = await employeesApi.getPerformanceReviews(employeeId);
      setReviews(data);
    } catch (error) {
      console.error('Error loading employee reviews:', error);
      toast.error("Failed to load employee reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeFilter = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    if (employeeId) {
      loadEmployeeReviews(employeeId);
    } else {
      loadData();
    }
  };

  // Get rating badge styling
  const getRatingBadge = (rating: PerformanceRating) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (rating) {
      case 'excellent':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'good':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'satisfactory':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'needs_improvement':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'unsatisfactory':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get star rating display
  const getStarRating = (rating: PerformanceRating) => {
    const ratingMap = {
      'excellent': 5,
      'good': 4,
      'satisfactory': 3,
      'needs_improvement': 2,
      'unsatisfactory': 1
    };
    return ratingMap[rating] || 0;
  };

  // Filter reviews based on search
  const filteredReviews = reviews.filter(review => {
    if (!searchTerm) return true;
    const employee = review.employee;
    if (!employee) return false;
    
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return (
      fullName.includes(searchLower) ||
      employee.employee_id.toLowerCase().includes(searchLower) ||
      review.reviewer_name.toLowerCase().includes(searchLower)
    );
  });

  // Calculate performance statistics
  const performanceStats = {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0 
      ? reviews.reduce((acc, review) => acc + getStarRating(review.overall_rating), 0) / reviews.length 
      : 0,
    excellentCount: reviews.filter(r => r.overall_rating === 'excellent').length,
    needsImprovementCount: reviews.filter(r => r.overall_rating === 'needs_improvement' || r.overall_rating === 'unsatisfactory').length
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
              <Award className="w-8 h-8 text-pulse-600" />
              Performance Reviews
            </h1>
            <p className="mt-1 text-gray-600">Track and manage employee performance evaluations</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <Link
              to="/performance/analytics"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link
              to="/performance/new"
              className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Review
            </Link>
          </div>
        </div>

        {/* Performance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{performanceStats.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{performanceStats.averageRating.toFixed(1)}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= performanceStats.averageRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Excellent Performers</p>
                <p className="text-2xl font-bold text-gray-900">{performanceStats.excellentCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Need Support</p>
                <p className="text-2xl font-bold text-gray-900">{performanceStats.needsImprovementCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by employee name, ID, or reviewer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-64">
              <select
                value={selectedEmployee}
                onChange={(e) => handleEmployeeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name} ({employee.employee_id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading performance reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No performance reviews found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search or filters' : 'Get started by creating your first performance review'}
              </p>
              {!searchTerm && (
                <Link
                  to="/performance/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create First Review
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
                      Review Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reviewer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Review Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReviews.map((review) => {
                    const employee = review.employee;
                    const starRating = getStarRating(review.overall_rating);
                    const daysSinceReview = differenceInDays(new Date(), new Date(review.review_date));
                    
                    return (
                      <tr key={review.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-pulse-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-pulse-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employee ? `ID: ${employee.employee_id}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {format(new Date(review.review_period_start), 'MMM d')} - {format(new Date(review.review_period_end), 'MMM d, yyyy')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.ceil(differenceInDays(new Date(review.review_period_end), new Date(review.review_period_start)) / 30)} month period
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={getRatingBadge(review.overall_rating)}>
                              {review.overall_rating.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= starRating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{review.reviewer_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {format(new Date(review.review_date), 'MMM d, yyyy')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {daysSinceReview} days ago
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/performance/${review.id}`}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View review"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/performance/${review.id}/edit`}
                              className="p-1 text-gray-400 hover:text-pulse-600 transition-colors"
                              title="Edit review"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
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
        {!loading && filteredReviews.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredReviews.length} of {reviews.length} performance reviews
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PerformanceReviews; 