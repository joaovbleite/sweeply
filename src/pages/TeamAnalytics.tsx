import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Star,
  Clock,
  DollarSign,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { employeesApi } from "@/lib/api/employees";
import { Employee, EmployeeStats, PerformanceReview } from "@/types/employee";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import AppLayout from "@/components/AppLayout";

const TeamAnalytics = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("3months");

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [employeesData, statsData, reviewsData] = await Promise.all([
        employeesApi.getAll(),
        employeesApi.getStats(),
        employeesApi.getPerformanceReviews()
      ]);
      
      setEmployees(employeesData);
      setStats(statsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate period-based analytics
  const calculatePeriodAnalytics = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case "1month":
        startDate = startOfMonth(subMonths(now, 1));
        break;
      case "3months":
        startDate = startOfMonth(subMonths(now, 3));
        break;
      case "6months":
        startDate = startOfMonth(subMonths(now, 6));
        break;
      case "1year":
        startDate = startOfMonth(subMonths(now, 12));
        break;
      default:
        startDate = startOfMonth(subMonths(now, 3));
    }

    const periodReviews = reviews.filter(review => 
      new Date(review.review_date) >= startDate
    );

    const periodEmployees = employees.filter(employee => 
      new Date(employee.hire_date) >= startDate
    );

    return {
      newHires: periodEmployees.length,
      reviewsCompleted: periodReviews.length,
      averageRating: periodReviews.length > 0 
        ? periodReviews.reduce((acc, review) => {
            const ratingValue = getRatingValue(review.overall_rating);
            return acc + ratingValue;
          }, 0) / periodReviews.length
        : 0,
      totalJobs: employees.reduce((acc, emp) => acc + emp.total_jobs_completed, 0),
      totalHours: employees.reduce((acc, emp) => acc + emp.total_hours_worked, 0)
    };
  };

  const getRatingValue = (rating: string): number => {
    const ratingMap = {
      'excellent': 5,
      'good': 4,
      'satisfactory': 3,
      'needs_improvement': 2,
      'unsatisfactory': 1
    };
    return ratingMap[rating as keyof typeof ratingMap] || 0;
  };

  // Department breakdown
  const getDepartmentStats = () => {
    const departments = employees.reduce((acc, employee) => {
      const dept = employee.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = {
          count: 0,
          totalHours: 0,
          totalJobs: 0,
          totalPayroll: 0,
          avgRating: 0
        };
      }
      acc[dept].count++;
      acc[dept].totalHours += employee.total_hours_worked;
      acc[dept].totalJobs += employee.total_jobs_completed;
      acc[dept].totalPayroll += (employee.hourly_rate * employee.weekly_hours * 4); // Monthly estimate
      
      if (employee.current_rating) {
        acc[dept].avgRating += getRatingValue(employee.current_rating);
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate average ratings
    Object.keys(departments).forEach(dept => {
      if (departments[dept].count > 0) {
        departments[dept].avgRating = departments[dept].avgRating / departments[dept].count;
      }
    });

    return departments;
  };

  // Role distribution
  const getRoleDistribution = () => {
    return employees.reduce((acc, employee) => {
      const role = employee.role;
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  // Performance trends (mock data for visualization)
  const getPerformanceTrends = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        month: format(date, 'MMM'),
        avgRating: 3.5 + Math.random() * 1.5, // Mock data
        totalJobs: Math.floor(Math.random() * 50) + 100,
        newHires: Math.floor(Math.random() * 5),
      });
    }
    return months;
  };

  const periodAnalytics = calculatePeriodAnalytics();
  const departmentStats = getDepartmentStats();
  const roleDistribution = getRoleDistribution();
  const performanceTrends = getPerformanceTrends();

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/employees"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-pulse-600" />
                Team Analytics
              </h1>
              <p className="mt-1 text-gray-600">Comprehensive insights into team performance and metrics</p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <button
              onClick={loadAnalyticsData}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{periodAnalytics.newHires} new hires
                </p>
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
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{periodAnalytics.averageRating.toFixed(1)}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= periodAnalytics.averageRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-blue-600 flex items-center gap-1">
                  {periodAnalytics.reviewsCompleted} reviews completed
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Jobs Completed</p>
                <p className="text-2xl font-bold text-gray-900">{periodAnalytics.totalJobs.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  {periodAnalytics.totalHours.toLocaleString()} total hours
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-pulse-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
                <p className="text-2xl font-bold text-gray-900">${stats?.total_payroll.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-500">
                  Avg ${stats?.avg_hourly_rate.toFixed(2) || 0}/hr
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            
            <div className="space-y-4">
              {performanceTrends.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pulse-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-pulse-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{month.month}</p>
                      <p className="text-sm text-gray-500">{month.totalJobs} jobs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= month.avgRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{month.avgRating.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Team Composition</h3>
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            
            <div className="space-y-4">
              {Object.entries(roleDistribution).map(([role, count]) => {
                const percentage = ((count / employees.length) * 100).toFixed(1);
                const roleColors = {
                  'cleaner': 'bg-green-500',
                  'supervisor': 'bg-blue-500',
                  'manager': 'bg-purple-500',
                  'admin': 'bg-gray-500',
                  'driver': 'bg-orange-500'
                };
                
                return (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${roleColors[role as keyof typeof roleColors] || 'bg-gray-400'}`}></div>
                      <span className="font-medium text-gray-900 capitalize">{role.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{count}</span>
                      <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
            <Award className="w-5 h-5 text-pulse-600" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Jobs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(departmentStats).map(([dept, stats]) => (
                  <tr key={dept} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{stats.count}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">{stats.avgRating.toFixed(1)}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= stats.avgRating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{stats.totalJobs}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{stats.totalHours.toFixed(0)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${stats.totalPayroll.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats && stats.avg_performance_rating < 3.5 && (
              <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Improve Performance</span>
                </div>
                <p className="text-sm text-orange-700">
                  Team performance is below target. Consider additional training or performance reviews.
                </p>
              </div>
            )}
            
            {periodAnalytics.newHires === 0 && (
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Consider Hiring</span>
                </div>
                <p className="text-sm text-blue-700">
                  No new hires this period. Review staffing needs for upcoming demand.
                </p>
              </div>
            )}
            
            {periodAnalytics.reviewsCompleted < employees.length * 0.5 && (
              <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Schedule Reviews</span>
                </div>
                <p className="text-sm text-purple-700">
                  Many employees are due for performance reviews. Schedule upcoming evaluations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TeamAnalytics; 