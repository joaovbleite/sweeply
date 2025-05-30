import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  Hash,
  ListFilter,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { invoicesApi } from "@/lib/api/invoices";
import { clientsApi } from "@/lib/api/clients";
import { jobsApi } from "@/lib/api/jobs";
import { serviceTypesApi } from "@/lib/api/service-types";
import { CreateInvoiceInput, InvoiceItem } from "@/types/invoice";
import { Client } from "@/types/client";
import { Job } from "@/types/job";
import { ServiceType } from "@/lib/api/service-types";
import AppLayout from "@/components/AppLayout";
import { format, addDays } from "date-fns";
import { useLocale } from "@/hooks/useLocale";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formatCurrency } = useLocale();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  
  // Get URL parameters
  const searchParams = new URLSearchParams(location.search);
  const clientIdFromUrl = searchParams.get('client');
  const jobIdFromUrl = searchParams.get('job');
  
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

  // Load clients, jobs, and service types
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading data with client ID from URL:", clientIdFromUrl);
        const [clientsData, jobsData, serviceTypesData] = await Promise.all([
          clientsApi.getAll(),
          jobsApi.getAll({ show_instances: false }),
          serviceTypesApi.getActiveServiceTypes()
        ]);
        setClients(clientsData);
        setJobs(jobsData);
        setServiceTypes(serviceTypesData);
        
        // Auto-select client from URL parameter
        if (clientIdFromUrl && clientsData.length > 0) {
          console.log("Found client ID in URL:", clientIdFromUrl);
          const client = clientsData.find(c => c.id === clientIdFromUrl);
          if (client) {
            console.log("Found matching client:", client.name);
            // Set the client directly in state
            setSelectedClient(client);
            setFormData(prev => ({
              ...prev,
              client_id: client.id
            }));
          } else {
            console.log("No matching client found for ID:", clientIdFromUrl);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error("Failed to load data");
      }
    };
    loadData();
  }, [clientIdFromUrl]);

  // Update available jobs when client is selected
  useEffect(() => {
    if (selectedClient) {
      const clientJobs = jobs.filter(job => 
        job.client_id === selectedClient.id && 
        job.status === 'completed'
        // Note: We can't check if a job is already invoiced without invoice_id field
      );
      setAvailableJobs(clientJobs);
      
      // Auto-select job from URL parameter
      if (jobIdFromUrl && clientJobs.length > 0) {
        const jobToSelect = clientJobs.find(j => j.id === jobIdFromUrl);
        if (jobToSelect) {
          // Add this job to selected jobs
          setFormData(prev => ({
            ...prev,
            job_ids: [...(prev.job_ids || []), jobToSelect.id]
          }));
          
          // Get service type details if available
          const jobServiceType = serviceTypes.find(st => st.name?.toLowerCase() === jobToSelect.service_type?.replace('_', ' ')?.toLowerCase());
          
          // Set job date in formatted string
          const formattedJobDate = format(new Date(jobToSelect.scheduled_date), 'MMM d, yyyy');
          
          // Automatically add this job as an invoice item
          const newItem = {
            description: `${jobToSelect.title} - ${jobToSelect.service_type.replace('_', ' ')} (${formattedJobDate})`,
            quantity: 1,
            rate: jobToSelect.actual_price || jobToSelect.estimated_price || (jobServiceType?.default_price || 0),
            amount: jobToSelect.actual_price || jobToSelect.estimated_price || (jobServiceType?.default_price || 0),
            job_id: jobToSelect.id
          };
          
          // Collect any notes from the job
          const jobNotes = [];
          if (jobToSelect.special_instructions) {
            jobNotes.push(`Special Instructions: ${jobToSelect.special_instructions}`);
          }
          if (jobToSelect.access_instructions) {
            jobNotes.push(`Access Details: ${jobToSelect.access_instructions}`);
          }
          if (jobToSelect.address) {
            jobNotes.push(`Service Location: ${jobToSelect.address}`);
          }
          
          // Set invoice defaults based on job
          setFormData(prev => ({
            ...prev,
            items: [...prev.items.filter(item => item.description), newItem],
            notes: jobNotes.length > 0 ? 
              `Job Details:\n${jobNotes.join('\n')}\n\n${prev.notes || ''}` : 
              prev.notes,
            issue_date: format(new Date(), 'yyyy-MM-dd'),
            due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
            service_date: jobToSelect.scheduled_date
          }));
          
          // Show toast notification that job was auto-selected
          toast.success(`Job "${jobToSelect.title}" automatically added to invoice`);
        }
      }
    } else {
      setAvailableJobs([]);
    }
  }, [selectedClient, jobs, jobIdFromUrl, serviceTypes]);

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

  // Handle service type selection for an item
  const handleServiceTypeSelect = (index: number, serviceTypeId: string) => {
    const serviceType = serviceTypes.find(s => s.id === serviceTypeId);
    if (!serviceType) return;

    updateItem(index, 'description', serviceType.name);
    updateItem(index, 'rate', serviceType.default_price);
    updateItem(index, 'amount', serviceType.default_price * formData.items[index].quantity);
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
    
    // Collect job notes
    const allJobNotes: string[] = [];
    
    const newItems = selectedJobs.map(job => {
      // Find matching service type if available
      const jobServiceType = serviceTypes.find(st => 
        st.name?.toLowerCase() === job.service_type?.replace('_', ' ')?.toLowerCase()
      );
      
      // Add job notes
      if (job.special_instructions) {
        allJobNotes.push(`Job ${job.title} Special Instructions: ${job.special_instructions}`);
      }
      if (job.access_instructions) {
        allJobNotes.push(`Job ${job.title} Access Details: ${job.access_instructions}`);
      }
      if (job.address) {
        allJobNotes.push(`Job ${job.title} Location: ${job.address}`);
      }
      
      return {
        description: `${job.title} - ${job.service_type.replace('_', ' ')} (${format(new Date(job.scheduled_date), 'MMM d, yyyy')})`,
        quantity: 1,
        rate: job.actual_price || job.estimated_price || (jobServiceType?.default_price || 0),
        amount: job.actual_price || job.estimated_price || (jobServiceType?.default_price || 0),
        job_id: job.id
      };
    });

    setFormData(prev => ({
      ...prev,
      items: [...prev.items.filter(item => item.description), ...newItems],
      notes: allJobNotes.length > 0 ? 
        `${prev.notes || ''}\n\nJob Details:\n${allJobNotes.join('\n')}` : 
        prev.notes
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

  // Handle select all jobs checkbox
  const handleSelectAllJobs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      // Select all available jobs
      setFormData(prev => ({
        ...prev,
        job_ids: availableJobs.map(job => job.id)
      }));
    } else {
      // Deselect all jobs
      setFormData(prev => ({
        ...prev,
        job_ids: []
      }));
    }
  };

  // Handle individual job selection
  const handleJobSelect = (jobId: string) => {
    setFormData(prev => {
      const currentJobIds = prev.job_ids || [];
      const isSelected = currentJobIds.includes(jobId);
      
      return {
        ...prev,
        job_ids: isSelected
          ? currentJobIds.filter(id => id !== jobId)
          : [...currentJobIds, jobId]
      };
    });
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
              Client Details
            </h3>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client
                </label>
                <select
                  id="client"
                  value={formData.client_id}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Display selected client information */}
              {selectedClient && (
                <div className="bg-gray-50 rounded-lg p-4 mt-2">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Client Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="font-medium">{selectedClient.name}</p>
                    </div>
                    {selectedClient.email && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-medium">{selectedClient.email}</p>
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Phone</p>
                        <p className="font-medium">{selectedClient.phone}</p>
                      </div>
                    )}
                    {selectedClient.address && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Address</p>
                        <p className="font-medium">
                          {[
                            selectedClient.address,
                            selectedClient.city,
                            selectedClient.state,
                            selectedClient.zip
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Jobs Selection */}
          {selectedClient && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Jobs
              </h3>
              
              {jobIdFromUrl && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-blue-700">
                      Job automatically selected from calendar
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    The selected job details have been added to this invoice
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add from Completed Jobs
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
                              onChange={handleSelectAllJobs}
                              checked={
                                availableJobs.length > 0 &&
                                formData.job_ids?.length === availableJobs.length
                              }
                            />
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Job
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {availableJobs.length > 0 ? (
                          availableJobs.map(job => (
                            <tr 
                              key={job.id}
                              className={job.id === jobIdFromUrl ? "bg-blue-50" : ""}
                            >
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
                                  checked={formData.job_ids?.includes(job.id)}
                                  onChange={() => handleJobSelect(job.id)}
                                />
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {job.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {job.service_type?.replace('_', ' ')}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {format(new Date(job.scheduled_date), 'MMM d, yyyy')}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatCurrency(job.actual_price || job.estimated_price || 0)}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              No completed jobs found for this client
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddJobsAsItems}
                    disabled={!formData.job_ids?.length}
                    className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Selected Jobs to Invoice
                  </button>
                </div>
              </div>
            </div>
          )}

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
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
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
                      <div className="flex flex-col gap-2">
                        <label className="block text-xs text-gray-600">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Service description..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500"
                        />
                        
                        {/* Service Type Selector */}
                        <div className="relative">
                          <select
                            onChange={(e) => handleServiceTypeSelect(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500 text-gray-600"
                            value=""
                          >
                            <option value="">Select a service...</option>
                            {serviceTypes.map(serviceType => (
                              <option key={serviceType.id} value={serviceType.id}>
                                {serviceType.name} - {formatCurrency(serviceType.default_price)}
                              </option>
                            ))}
                          </select>
                          <ListFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
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
                      <label className="block text-xs text-gray-600 mb-1">Rate</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Amount</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-1 flex items-end justify-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {formData.items.length === 0 && (
                <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No items added yet</p>
                  <button
                    type="button"
                    onClick={addItem}
                    className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Item
                  </button>
                </div>
              )}
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
                    Discount Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      id="discount"
                      value={formData.discount_amount || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {formData.tax_rate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax ({formData.tax_rate}%)</span>
                      <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
                    </div>
                  )}
                  {formData.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-red-600">-{formatCurrency(formData.discount_amount)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-bold text-pulse-600">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  id="due_date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                  placeholder="Any special notes for this invoice..."
                />
              </div>
              
              <div>
                <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-2">
                  Terms
                </label>
                <textarea
                  id="terms"
                  value={formData.terms || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Create Invoice</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default CreateInvoice; 