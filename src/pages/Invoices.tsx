import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  DollarSign, 
  Calendar, 
  User, 
  Send,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  Clock,
  TrendingUp,
  CreditCard,
  Receipt
} from "lucide-react";
import { toast } from "sonner";
import { invoicesApi } from "@/lib/api/invoices";
import { Invoice, InvoiceFilters, InvoiceStatus } from "@/types/invoice";
import { format, differenceInDays } from "date-fns";
import AppLayout from "@/components/AppLayout";

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<any>(null);

  // Load invoices and stats
  const loadInvoices = async () => {
    try {
      setLoading(true);
      const [invoicesData, statsData] = await Promise.all([
        invoicesApi.getAll(filters),
        invoicesApi.getStats()
      ]);
      setInvoices(invoicesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadInvoices();
      return;
    }

    try {
      setLoading(true);
      const data = await invoicesApi.search(searchTerm);
      setInvoices(data);
    } catch (error) {
      console.error('Error searching invoices:', error);
      toast.error("Failed to search invoices");
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (invoiceId: string, newStatus: InvoiceStatus) => {
    try {
      if (newStatus === 'sent') {
        await invoicesApi.markAsSent(invoiceId);
        toast.success('Invoice sent successfully');
      } else {
        await invoicesApi.update(invoiceId, { status: newStatus });
        toast.success(`Invoice ${newStatus}`);
      }
      loadInvoices();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error("Failed to update invoice status");
    }
  };

  // Handle payment recording
  const handleRecordPayment = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    const amount = prompt(`Record payment for ${invoice.invoice_number}. Balance due: $${invoice.balance_due}`);
    if (!amount || isNaN(Number(amount))) return;

    const paymentMethod = prompt('Payment method (cash, check, credit_card, bank_transfer):') || 'cash';
    const reference = prompt('Payment reference (optional):') || undefined;

    try {
      await invoicesApi.recordPayment(invoiceId, {
        amount: Number(amount),
        payment_method: paymentMethod,
        payment_date: new Date().toISOString().split('T')[0],
        reference
      });
      toast.success('Payment recorded successfully');
      loadInvoices();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error("Failed to record payment");
    }
  };

  // Handle delete
  const handleDelete = async (invoiceId: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) return;

    try {
      await invoicesApi.delete(invoiceId);
      toast.success('Invoice deleted successfully');
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error("Failed to delete invoice");
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: InvoiceStatus, dueDate?: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    // Check if overdue
    if (status === 'sent' && dueDate && new Date(dueDate) < new Date()) {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    
    switch (status) {
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'sent':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'overdue':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'cancelled':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get status display text
  const getStatusDisplay = (status: InvoiceStatus, dueDate?: string) => {
    if (status === 'sent' && dueDate && new Date(dueDate) < new Date()) {
      return 'Overdue';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get status icon
  const getStatusIcon = (status: InvoiceStatus, dueDate?: string) => {
    if (status === 'sent' && dueDate && new Date(dueDate) < new Date()) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'sent':
        return <Send className="w-4 h-4 text-blue-600" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  // Filter invoices based on search term
  const filteredInvoices = searchTerm 
    ? invoices.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : invoices;

  // Calculate days overdue
  const getDaysOverdue = (dueDate: string) => {
    return differenceInDays(new Date(), new Date(dueDate));
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Invoices</h1>
            <p className="mt-1 text-gray-600">Manage billing and track payments</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={() => {/* Export functionality */}}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <Link
              to="/invoices/new"
              className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.total_revenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Outstanding</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.outstanding_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
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
                  placeholder="Search invoices, clients, or notes..."
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
                    status: e.target.value ? [e.target.value as InvoiceStatus] : undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    date_from: e.target.value || undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    date_to: e.target.value || undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.overdue_only || false}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      overdue_only: e.target.checked || undefined
                    }))}
                    className="rounded border-gray-300 text-pulse-500 focus:ring-pulse-500"
                  />
                  <span className="text-sm text-gray-700">Overdue only</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-xl shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search or filters' : 'Get started by creating your first invoice'}
              </p>
              {!searchTerm && (
                <Link
                  to="/invoices/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Invoice
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => {
                    const isOverdue = invoice.status === 'sent' && new Date(invoice.due_date) < new Date();
                    const daysOverdue = isOverdue ? getDaysOverdue(invoice.due_date) : 0;
                    
                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {getStatusIcon(invoice.status, invoice.due_date)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {invoice.invoice_number}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {invoice.client?.name}
                              </div>
                              {invoice.client?.email && (
                                <div className="text-sm text-gray-500">
                                  {invoice.client.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              ${invoice.total_amount.toFixed(2)}
                            </div>
                            {invoice.paid_amount > 0 && (
                              <div className="text-sm text-green-600">
                                ${invoice.paid_amount.toFixed(2)} paid
                              </div>
                            )}
                            {invoice.balance_due > 0 && (
                              <div className="text-sm text-orange-600">
                                ${invoice.balance_due.toFixed(2)} due
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={getStatusBadge(invoice.status, invoice.due_date)}>
                            {getStatusDisplay(invoice.status, invoice.due_date)}
                          </span>
                          {isOverdue && (
                            <div className="text-xs text-red-600 mt-1">
                              {daysOverdue} days overdue
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {invoice.status === 'draft' && (
                              <button
                                onClick={() => handleStatusUpdate(invoice.id, 'sent')}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Send Invoice"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            {(invoice.status === 'sent' || isOverdue) && invoice.balance_due > 0 && (
                              <button
                                onClick={() => handleRecordPayment(invoice.id)}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                title="Record Payment"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            <Link
                              to={`/invoices/${invoice.id}`}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/invoices/${invoice.id}/edit`}
                              className="p-1 text-gray-400 hover:text-pulse-600 transition-colors"
                              title="Edit invoice"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(invoice.id, invoice.invoice_number)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete invoice"
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
        {!loading && filteredInvoices.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredInvoices.length} of {invoices.length} invoices
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Invoices; 
 
 
 
 