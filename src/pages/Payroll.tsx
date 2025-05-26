import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Clock, 
  User,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Users,
  TrendingUp,
  Calculator
} from "lucide-react";
import { toast } from "sonner";
import { employeesApi } from "@/lib/api/employees";
import { PayrollPeriod, PayrollEntry } from "@/types/employee";
import { format, differenceInDays } from "date-fns";
import AppLayout from "@/components/AppLayout";

const Payroll = () => {
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePeriod, setShowCreatePeriod] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    period_start: '',
    period_end: '',
    pay_date: ''
  });

  // Load payroll periods
  const loadPayrollPeriods = async () => {
    try {
      setLoading(true);
      const data = await employeesApi.getPayrollPeriods();
      setPayrollPeriods(data);
      
      // Auto-select the most recent period
      if (data.length > 0 && !selectedPeriod) {
        setSelectedPeriod(data[0]);
      }
    } catch (error) {
      console.error('Error loading payroll periods:', error);
      toast.error("Failed to load payroll periods");
    } finally {
      setLoading(false);
    }
  };

  // Load payroll entries for selected period
  const loadPayrollEntries = async (periodId: string) => {
    try {
      const data = await employeesApi.getPayrollEntries(periodId);
      setPayrollEntries(data);
    } catch (error) {
      console.error('Error loading payroll entries:', error);
      toast.error("Failed to load payroll entries");
    }
  };

  useEffect(() => {
    loadPayrollPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      loadPayrollEntries(selectedPeriod.id);
    }
  }, [selectedPeriod]);

  // Handle create payroll period
  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPeriod.period_start || !newPeriod.period_end || !newPeriod.pay_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await employeesApi.createPayrollPeriod(newPeriod);
      toast.success("Payroll period created successfully");
      setShowCreatePeriod(false);
      setNewPeriod({ period_start: '', period_end: '', pay_date: '' });
      loadPayrollPeriods();
    } catch (error) {
      console.error('Error creating payroll period:', error);
      toast.error("Failed to create payroll period");
    }
  };

  // Handle status update
  const handleStatusUpdate = async (periodId: string, status: 'draft' | 'processed' | 'paid') => {
    try {
      await employeesApi.updatePayrollPeriodStatus(periodId, status);
      toast.success(`Payroll period ${status}`);
      loadPayrollPeriods();
    } catch (error) {
      console.error('Error updating payroll status:', error);
      toast.error("Failed to update payroll status");
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'processed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Calculate totals for selected period
  const periodTotals = payrollEntries.reduce(
    (totals, entry) => ({
      totalHours: totals.totalHours + entry.regular_hours + entry.overtime_hours + entry.holiday_hours,
      totalGrossPay: totals.totalGrossPay + entry.gross_pay,
      totalDeductions: totals.totalDeductions + entry.deductions,
      totalNetPay: totals.totalNetPay + entry.net_pay,
    }),
    { totalHours: 0, totalGrossPay: 0, totalDeductions: 0, totalNetPay: 0 }
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Payroll Management</h1>
            <p className="mt-1 text-gray-600">Manage payroll periods and employee payments</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Link
              to="/employees"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4" />
              Employees
            </Link>
            <button
              onClick={() => setShowCreatePeriod(true)}
              className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Payroll Period
            </button>
          </div>
        </div>

        {/* Create Payroll Period Modal */}
        {showCreatePeriod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Payroll Period</h3>
              <form onSubmit={handleCreatePeriod} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Start Date
                  </label>
                  <input
                    type="date"
                    value={newPeriod.period_start}
                    onChange={(e) => setNewPeriod(prev => ({ ...prev, period_start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period End Date
                  </label>
                  <input
                    type="date"
                    value={newPeriod.period_end}
                    onChange={(e) => setNewPeriod(prev => ({ ...prev, period_end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Date
                  </label>
                  <input
                    type="date"
                    value={newPeriod.pay_date}
                    onChange={(e) => setNewPeriod(prev => ({ ...prev, pay_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreatePeriod(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                  >
                    Create Period
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payroll Periods */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Periods List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-medium text-gray-900">Payroll Periods</h2>
              </div>
              <div className="divide-y">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pulse-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading periods...</p>
                  </div>
                ) : payrollPeriods.length === 0 ? (
                  <div className="p-6 text-center">
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No payroll periods yet</p>
                  </div>
                ) : (
                  payrollPeriods.map((period) => (
                    <div
                      key={period.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedPeriod?.id === period.id ? 'bg-pulse-50 border-r-2 border-pulse-500' : ''
                      }`}
                      onClick={() => setSelectedPeriod(period)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {format(new Date(period.period_start), 'MMM d')} - {format(new Date(period.period_end), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            Pay Date: {format(new Date(period.pay_date), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ${period.total_amount.toFixed(2)} • {period.total_hours.toFixed(1)}h
                          </div>
                        </div>
                        <span className={getStatusBadge(period.status)}>
                          {period.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Period Details */}
          <div className="lg:col-span-2">
            {selectedPeriod ? (
              <div className="space-y-6">
                {/* Period Header */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-medium text-gray-900">
                        Payroll Period: {format(new Date(selectedPeriod.period_start), 'MMM d')} - {format(new Date(selectedPeriod.period_end), 'MMM d, yyyy')}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Pay Date: {format(new Date(selectedPeriod.pay_date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={getStatusBadge(selectedPeriod.status)}>
                        {selectedPeriod.status}
                      </span>
                      {selectedPeriod.status === 'draft' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedPeriod.id, 'processed')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Process
                        </button>
                      )}
                      {selectedPeriod.status === 'processed' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedPeriod.id, 'paid')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Period Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-xs text-gray-600">Total Hours</p>
                          <p className="text-lg font-semibold text-gray-900">{periodTotals.totalHours.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-xs text-gray-600">Gross Pay</p>
                          <p className="text-lg font-semibold text-gray-900">${periodTotals.totalGrossPay.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Calculator className="h-5 w-5 text-orange-600 mr-2" />
                        <div>
                          <p className="text-xs text-gray-600">Deductions</p>
                          <p className="text-lg font-semibold text-gray-900">${periodTotals.totalDeductions.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                        <div>
                          <p className="text-xs text-gray-600">Net Pay</p>
                          <p className="text-lg font-semibold text-gray-900">${periodTotals.totalNetPay.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payroll Entries */}
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Employee Payroll</h3>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Download className="w-4 h-4 inline mr-1" />
                          Export
                        </button>
                        <Link
                          to={`/payroll/${selectedPeriod.id}/add-entry`}
                          className="px-3 py-1 text-sm bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 inline mr-1" />
                          Add Entry
                        </Link>
                      </div>
                    </div>
                  </div>

                  {payrollEntries.length === 0 ? (
                    <div className="p-12 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No payroll entries</h3>
                      <p className="text-gray-600 mb-4">Add payroll entries for this period</p>
                      <Link
                        to={`/payroll/${selectedPeriod.id}/add-entry`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add First Entry
                      </Link>
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
                              Hours
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Gross Pay
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Deductions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Net Pay
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payrollEntries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8">
                                    <div className="h-8 w-8 rounded-full bg-pulse-100 flex items-center justify-center">
                                      <User className="h-4 w-4 text-pulse-600" />
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {entry.employee?.first_name} {entry.employee?.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {entry.employee?.employee_id} • {entry.employee?.role}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {(entry.regular_hours + entry.overtime_hours + entry.holiday_hours).toFixed(1)}h
                                </div>
                                <div className="text-xs text-gray-500">
                                  {entry.regular_hours}r + {entry.overtime_hours}ot + {entry.holiday_hours}h
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  ${entry.gross_pay.toFixed(2)}
                                </div>
                                {entry.bonus > 0 && (
                                  <div className="text-xs text-green-600">
                                    +${entry.bonus.toFixed(2)} bonus
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  ${entry.deductions.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Tax: ${entry.tax_deductions.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-green-600">
                                  ${entry.net_pay.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="View details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="p-1 text-gray-400 hover:text-pulse-600 transition-colors"
                                    title="Edit entry"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Payroll Period</h3>
                <p className="text-gray-600">Choose a payroll period from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Payroll; 
 
 
 
 