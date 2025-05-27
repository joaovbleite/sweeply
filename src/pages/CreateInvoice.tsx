import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  User, 
  Calendar, 
  DollarSign, 
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Calculator,
  Percent,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import { invoicesApi } from "@/lib/api/invoices";
import { clientsApi } from "@/lib/api/clients";
import { jobsApi } from "@/lib/api/jobs";
import { CreateInvoiceInput, InvoiceItem } from "@/types/invoice";
import { Client } from "@/types/client";
import { Job } from "@/types/job";
import AppLayout from "@/components/AppLayout";
import { format, addDays } from "date-fns";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  
  const [formData, setFormData] = useState<CreateInvoiceInput>({
    client_id: "",
    due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'), // 30 days from now
    items: [{
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    }],
    tax_rate: 0,
    discount_amount: 0,
    notes: "",
    terms: "Payment due within 30 days of invoice date.",
    footer_text: "Thank you for your business!",
    job_ids: []
  });

  // Load clients and jobs
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, jobsData] = await Promise.all([
          clientsApi.getAll(),
          jobsApi.getAll()
        ]);
        setClients(clientsData);
        setJobs(jobsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error("Failed to load data");
      }
    };
    loadData();
  }, []);

  // Update available jobs when client is selected
  useEffect(() => {
    if (selectedClient) {
      const clientJobs = jobs.filter(job => 
        job.client_id === selectedClient.id && 
        job.status === 'completed'
        // Note: We can't check if a job is already invoiced without invoice_id field
      );
      setAvailableJobs(clientJobs);
    } else {
      setAvailableJobs([]);
    }
  }, [selectedClient, jobs]);

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
    setFormData(prev => ({
      ...prev,
      client_id: clientId,
      job_ids: [] // Reset selected jobs
    }));
  };

  // Add item
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0
      }]
    }));
  };

  // Remove item
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update item
  const updateItem = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };

      // Calculate amount for the item
      if (field === 'quantity' || field === 'rate') {
        newItems[index].amount = newItems[index].quantity * newItems[index].rate;
      }

      return {
        ...prev,
        items: newItems
      };
    });
  };

  // Add jobs as items
  const handleAddJobsAsItems = () => {
    if (!formData.job_ids || formData.job_ids.length === 0) {
      toast.error("Please select jobs to add");
      return;
    }

    const selectedJobs = availableJobs.filter(job => formData.job_ids?.includes(job.id));
    const newItems = selectedJobs.map(job => ({
      description: `${job.title} - ${job.service_type.replace('_', ' ')} (${format(new Date(job.scheduled_date), 'MMM d, yyyy')})`,
      quantity: 1,
      rate: job.actual_price || job.estimated_price || 0,
      amount: job.actual_price || job.estimated_price || 0,
      job_id: job.id
    }));

    setFormData(prev => ({
      ...prev,
      items: [...prev.items.filter(item => item.description), ...newItems]
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (formData.tax_rate || 0) / 100;
    const total = subtotal + taxAmount - (formData.discount_amount || 0);
    
    return {
      subtotal,
      taxAmount,
      total
    };
  };

  const totals = calculateTotals();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.client_id) {
      toast.error("Please select a client");
      return;
    }

    const validItems = formData.items.filter(item => item.description && item.amount > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setLoading(true);

    try {
      const invoiceData: CreateInvoiceInput = {
        ...formData,
        items: validItems
      };

      const invoice = await invoicesApi.create(invoiceData);
      toast.success(`Invoice ${invoice.invoice_number} created successfully!`);
      navigate(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/invoices"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">Create Invoice</h1>
              <p className="mt-1 text-gray-600">Generate a new invoice for your client</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Client Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client *
                </label>
                <select
                  id="client"
                  value={formData.client_id}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  id="due_date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Jobs Selection (if client selected) */}
            {selectedClient && availableJobs.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Completed Jobs
                </label>
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableJobs.map(job => (
                      <label key={job.id} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.job_ids?.includes(job.id) || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                job_ids: [...(prev.job_ids || []), job.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                job_ids: (prev.job_ids || []).filter(id => id !== job.id)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-pulse-500 focus:ring-pulse-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {job.title} - {format(new Date(job.scheduled_date), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-600">
                            {job.service_type.replace('_', ' ')} - ${job.actual_price || job.estimated_price || 0}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {formData.job_ids && formData.job_ids.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddJobsAsItems}
                      className="mt-3 px-4 py-2 bg-pulse-100 text-pulse-700 rounded-lg hover:bg-pulse-200 transition-colors text-sm"
                    >
                      Add Selected Jobs as Items
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Invoice Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice Items
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1 bg-pulse-100 text-pulse-700 rounded-lg hover:bg-pulse-200 transition-colors text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5">
                      <label className="block text-xs text-gray-600 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Service description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Rate ($)</label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Amount</label>
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                        ${item.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={formData.items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Totals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Pricing & Totals
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="tax_rate"
                      value={formData.tax_rate || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Amount ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="discount"
                      value={formData.discount_amount || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                    />
                    <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                  </div>
                  {formData.tax_rate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax ({formData.tax_rate}%)</span>
                      <span className="font-medium">${totals.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {formData.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-red-600">-${formData.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-bold text-pulse-600">${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Additional Information
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                  placeholder="Add any notes or special instructions..."
                />
              </div>

              <div>
                <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                />
              </div>

              <div>
                <label htmlFor="footer" className="block text-sm font-medium text-gray-700 mb-2">
                  Footer Text
                </label>
                <input
                  type="text"
                  id="footer"
                  value={formData.footer_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, footer_text: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Invoice...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Invoice
                </>
              )}
            </button>
            <Link
              to="/invoices"
              className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default CreateInvoice; 