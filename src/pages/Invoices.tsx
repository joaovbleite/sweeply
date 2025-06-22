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
  Receipt,
  MoreVertical,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { invoicesApi } from "@/lib/api/invoices";
import { Invoice, InvoiceFilters, InvoiceStatus, InvoiceStats, PaymentMethod } from "@/types/invoice";
import { format, differenceInDays, addDays } from "date-fns";
import AppLayout from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import PageHeader from "@/components/ui/PageHeader";

const Invoices = () => {
  const { t } = useTranslation(['invoices', 'common']);
  const { formatCurrency } = useLocale();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<InvoiceFilters & {
    client_type?: string;
    min_amount?: number;
    max_amount?: number;
    sort_by?: 'date' | 'amount' | 'due_date' | 'client_name';
    sort_order?: 'asc' | 'desc';
  }>({
    sort_by: 'date',
    sort_order: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<InvoiceStats | null>(null);

  // Define the right element for the page header
  const headerRightElement = (
    <Link to="/invoices/new">
      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
        <Plus className="w-5 h-5" />
        {t('invoices:addInvoice')}
      </button>
    </Link>
  );

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

    const paymentMethodInput = prompt('Payment method (cash, check, credit_card, bank_transfer):') || 'cash';
    const reference = prompt('Payment reference (optional):') || undefined;

    try {
      // Create a payment record object with required fields
      const paymentRecord = {
        id: crypto.randomUUID(),
        invoice_id: invoiceId,
        amount: Number(amount),
        payment_method: paymentMethodInput as PaymentMethod,
        payment_date: new Date().toISOString().split('T')[0],
        reference,
        created_at: new Date().toISOString()
      };

      await invoicesApi.recordPayment(invoiceId, paymentRecord);
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

  // Sort invoices
  const sortInvoices = (invoicesToSort: Invoice[]) => {
    return [...invoicesToSort].sort((a, b) => {
      const sortOrder = filters.sort_order === 'asc' ? 1 : -1;
      
      switch(filters.sort_by) {
        case 'date':
          return (new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()) * sortOrder;
        case 'amount':
          return (b.total_amount - a.total_amount) * sortOrder;
        case 'due_date':
          return (new Date(b.due_date).getTime() - new Date(a.due_date).getTime()) * sortOrder;
        case 'client_name':
          return (a.client?.name.localeCompare(b.client?.name || '') || 0) * sortOrder;
        default:
          return (new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()) * sortOrder;
      }
    });
  };

  // Filter invoices based on search term and filters
  const filteredInvoices = (() => {
    // First filter by search term
    let result = searchTerm 
      ? invoices.filter(invoice => 
          invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : invoices;
      
    // Then apply additional filters
    if (filters.client_type) {
      result = result.filter(invoice => 
        invoice.client && 
        'client_type' in invoice.client && 
        invoice.client.client_type === filters.client_type
      );
    }
    
    if (filters.min_amount) {
      result = result.filter(invoice => invoice.total_amount >= (filters.min_amount || 0));
    }
    
    if (filters.max_amount) {
      result = result.filter(invoice => invoice.total_amount <= (filters.max_amount || Infinity));
    }
    
    // Apply sorting
    return sortInvoices(result);
  })();

  // Calculate days overdue
  const getDaysOverdue = (dueDate: string) => {
    return differenceInDays(new Date(), new Date(dueDate));
  };

  // Get progress percentage for invoice status
  const getInvoiceProgress = (invoice: Invoice) => {
    const statusMap = {
      draft: 10,
      sent: 40,
      paid: 100,
      cancelled: 100
    };
    
    // For overdue invoices, calculate progress based on how late they are
    if (invoice.status === 'sent' && new Date(invoice.due_date) < new Date()) {
      const daysOverdue = getDaysOverdue(invoice.due_date);
      // Progress decreases the more overdue it is, to a minimum of 25%
      return Math.max(25, 40 - Math.min(daysOverdue, 15));
    }
    
    return statusMap[invoice.status] || 0;
  };

  // Get color for progress bar
  const getProgressColor = (invoice: Invoice) => {
    if (invoice.status === 'paid') return 'bg-blue-500';
    if (invoice.status === 'cancelled') return 'bg-gray-400';
    if (invoice.status === 'sent' && new Date(invoice.due_date) < new Date()) return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-gray-50">
        <PageHeader
          title={t('navigation:invoices')}
          rightElement={headerRightElement}
        />
        
        {/* Search and Filters */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('common:search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="p-2 border border-gray-300 rounded-lg">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
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
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.outstanding_amount)}</p>
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

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Type</label>
                  <select
                    value={filters.client_type || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      client_type: e.target.value || undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                  >
                    <option value="">All Client Types</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
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
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                  <input
                    type="number"
                    value={filters.min_amount || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      min_amount: e.target.value ? Number(e.target.value) : undefined
                    }))}
                    placeholder="Min $"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                  <input
                    type="number"
                    value={filters.max_amount || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      max_amount: e.target.value ? Number(e.target.value) : undefined
                    }))}
                    placeholder="Max $"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sort_by || 'date'}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sort_by: e.target.value as 'date' | 'amount' | 'due_date' | 'client_name'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                  >
                    <option value="date">Issue Date</option>
                    <option value="due_date">Due Date</option>
                    <option value="amount">Amount</option>
                    <option value="client_name">Client Name</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                  <select
                    value={filters.sort_order || 'desc'}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sort_order: e.target.value as 'asc' | 'desc'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
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
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!filters.status?.includes('draft')}
                      onChange={(e) => setFilters(prev => {
                        if (e.target.checked) {
                          return {
                            ...prev,
                            status: [...(prev.status || []), 'draft']
                          };
                        } else {
                          return {
                            ...prev,
                            status: prev.status?.filter(s => s !== 'draft')
                          };
                        }
                      })}
                      className="rounded border-gray-300 text-pulse-500 focus:ring-pulse-500"
                    />
                    <span className="text-sm text-gray-700">Show drafts</span>
                  </label>
                </div>
                
                <button
                  onClick={() => setFilters({
                    sort_by: 'date',
                    sort_order: 'desc'
                  })}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInvoices.map((invoice) => {
                      const isOverdue = invoice.status === 'sent' && new Date(invoice.due_date) < new Date();
                      const daysOverdue = isOverdue ? getDaysOverdue(invoice.due_date) : 0;
                      const progressPercent = getInvoiceProgress(invoice);
                      const progressColor = getProgressColor(invoice);
                      
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
                                
                                {/* Progress bar */}
                                <div className="w-24 h-1 bg-gray-200 rounded-full mt-2">
                                  <div 
                                    className={`h-1 rounded-full ${progressColor}`}
                                    style={{ width: `${progressPercent}%` }}
                                  />
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
                                {formatCurrency(invoice.total_amount)}
                              </div>
                              {invoice.paid_amount > 0 && (
                                <div className="text-sm text-green-600">
                                  {formatCurrency(invoice.paid_amount)} paid
                                </div>
                              )}
                              {invoice.balance_due > 0 && (
                                <div className="text-sm text-orange-600">
                                  {formatCurrency(invoice.balance_due)} due
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
              {Object.keys(filters).filter(k => k !== 'sort_by' && k !== 'sort_order' && filters[k as keyof typeof filters]).length > 0 && 
                ` with ${Object.keys(filters).filter(k => k !== 'sort_by' && k !== 'sort_order' && filters[k as keyof typeof filters]).length} active filters`
              }
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Invoices; 
 
 
 
 